import * as React from 'react';
import * as PropTypes from 'prop-types';
import { isEqual, debounce } from 'lodash';
import * as classNames from 'classnames';
import {
    autoBindHandlers,
    bottom,
    outOfBoundary,
    childrenEqual,
    cloneLayoutItem,
    compact,
    getLayoutItem,
    getLayoutItemIndex,
    getOffset,
    calcXY,
    moveElement,
    synchronizeLayoutWithChildren,
    validateLayout,
    getAllCollisions,
    noop,
} from './utils';
import GridItem from './GridItem';
import {
    EventCallback,
    CompactType,
    GridResizeEvent,
    GridDragEvent,
    DragOverEvent,
    Layout,
    Position,
    DroppingPosition,
    LayoutItem,
} from './utils';


type State = {
    activeDrag: LayoutItem | null | undefined;
    layout: Layout;
    mounted: boolean;
    oldDragItem: LayoutItem | null | undefined;
    oldLayout: Layout | null | undefined;
    oldResizeItem: LayoutItem | null | undefined;
    droppingDOMNode: React.ReactElement<any> | HTMLElement | null;
    droppingPosition?: DroppingPosition;
    // Mirrored props
    children: Array<React.ReactElement<any>>;
    compactType?: CompactType;
    propsLayout?: Layout;
};

export type Props = {
    className: string;
    style: any;
    width: number;
    autoSize: boolean;
    cols: number;
    draggableCancel: string;
    draggableHandle: string;
    verticalCompact: boolean;
    compactType: CompactType;
    layout: Layout;
    margin: [number, number];
    containerPadding: [number, number] | null;
    rowHeight: number;
    maxRows: number;
    isDraggable: boolean;
    isResizable: boolean;
    isDroppable: boolean;
    preventCollision: boolean;
    useCSSTransforms: boolean;
    transformScale: number;
    droppingItem: Partial<LayoutItem>;
    // Callbacks
    onLayoutChange: (a: Layout, b: Position) => void;
    onItemOut: (l: LayoutItem, clientX: number, clientY: number) => void;
    otherGridItemDroppingPosition: {
        x: number;
        y: number;
    };
    otherGridItemEntered: boolean;
    onDrag: EventCallback;
    onDragStart: EventCallback;
    onDragStop: EventCallback;
    onDragNewItemEnter: any;
    onDragNewItemLeave: any;
    dragEnterChild: boolean;
    onResize: EventCallback;
    onResizeStart: EventCallback;
    onResizeStop: EventCallback;
    onDrop: (
        itemPosition: {
            x: number;
            y: number;
            w: number;
            h: number;
        }
    ) => undefined;
    children: Array<React.ReactElement<any>>;
};

// End Types

const compactType = (props: Props): CompactType => {
    const { verticalCompact, compactType } = props || {};

    return verticalCompact === false ? null : compactType;
};

const layoutClassName = 'react-grid-layout';
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */

class RGL extends React.Component<Props, State> {
    // TODO publish internal ReactClass displayName transform
    static displayName = 'ReactGridLayout';

    static propTypes = {
        //
        // Basic props
        //
        className: PropTypes.string,
        style: PropTypes.object,

        // This can be set explicitly. If it is not set, it will automatically
        // be set to the container width. Note that resizes will *not* cause this to adjust.
        // If you need that behavior, use WidthProvider.
        width: PropTypes.number,

        // If true, the container height swells and contracts to fit contents
        autoSize: PropTypes.bool,
        // # of cols.
        cols: PropTypes.number,

        // A selector that will not be draggable.
        draggableCancel: PropTypes.string,
        // A selector for the draggable handler
        draggableHandle: PropTypes.string,

        // Deprecated
        verticalCompact(props: Props) {
            if (
                props.verticalCompact === false
                && process.env.NODE_ENV !== 'production'
            ) {
                console.warn(
                    // eslint-disable-line no-console
                    '`verticalCompact` on <ReactGridLayout> is deprecated and will be removed soon. '
                    + 'Use `compactType`: "horizontal" | "vertical" | null.',
                );
            }
        },
        // Choose vertical or hotizontal compaction
        compactType: PropTypes.oneOf(['vertical', 'horizontal']),

        // layout is an array of object with the format:
        // {x: Number, y: Number, w: Number, h: Number, i: String}
        layout(props: Props) {
            const layout = props.layout;
            // I hope you're setting the data-grid property on the grid items
            if (layout === undefined) return;
            validateLayout(layout, 'layout');
        },

        //
        // Grid Dimensions
        //

        // Margin between items [x, y] in px
        margin: PropTypes.arrayOf(PropTypes.number),
        // Padding inside the container [x, y] in px
        containerPadding: PropTypes.arrayOf(PropTypes.number),
        // Rows have a static height, but you can change this based on breakpoints if you like
        rowHeight: PropTypes.number,
        // Default Infinity, but you can specify a max here if you like.
        // Note that this isn't fully fleshed out and won't error if you specify a layout that
        // extends beyond the row capacity. It will, however, not allow users to drag/resize
        // an item past the barrier. They can push items beyond the barrier, though.
        // Intentionally not documented for this reason.
        maxRows: PropTypes.number,

        //
        // Flags
        //
        isDraggable: PropTypes.bool,
        isResizable: PropTypes.bool,
        // If true, grid items won't change position when being dragged over.
        preventCollision: PropTypes.bool,
        // Use CSS transforms instead of top/left
        useCSSTransforms: PropTypes.bool,
        // parent layout transform scale
        transformScale: PropTypes.number,
        // If true, an external element can trigger onDrop callback with a specific grid position as a parameter
        isDroppable: PropTypes.bool,

        //
        // Callbacks
        //

        // Callback so you can save the layout. Calls after each drag & resize stops.
        onLayoutChange: PropTypes.func,
        onItemOut: PropTypes.func,
        otherGridItemEntered: PropTypes.bool,
        otherGridItemDroppingPosition: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
        }),
        // Calls when drag starts. Callback is of the signature (layout, oldItem, newItem, placeholder, e, ?node).
        // All callbacks below have the same signature. 'start' and 'stop' callbacks omit the 'placeholder'.
        onDragStart: PropTypes.func,
        // Calls on each drag movement.
        onDrag: PropTypes.func,
        // Calls when drag is complete.
        onDragStop: PropTypes.func,
        //Calls when resize starts.
        onResizeStart: PropTypes.func,
        // Calls when resize movement happens.
        onResize: PropTypes.func,
        // Calls when resize is complete.
        onResizeStop: PropTypes.func,
        // Calls when some element is dropped.
        onDrop: PropTypes.func,
        onDragNewItemEnter: PropTypes.func,
        onDragNewItemLeave: PropTypes.func,
        dragEnterChild: PropTypes.bool,
        //
        // Other validations
        //

        droppingItem: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
            i: PropTypes.string.isRequired,
            w: PropTypes.number.isRequired,
            h: PropTypes.number.isRequired,
        }),

        // Children must not have duplicate keys.
        children(props: Props, propName: string) {
            const children = props[propName];

            // Check children keys for duplicates. Throw if found.
            const keys = {};
            React.Children.forEach(children, (child) => {
                if (keys[child.key]) {
                    throw new Error(
                        `Duplicate child key "${
                            child.key
                        }" found! This will cause problems in ReactGridLayout.`,
                    );
                }
                keys[child.key] = true;
            });
        },
    };

    static defaultProps = {
        autoSize: true,
        cols: 12,
        className: '',
        style: {},
        draggableHandle: '',
        draggableCancel: '',
        containerPadding: null,
        rowHeight: 150,
        maxRows: Infinity, // infinite vertical growth
        layout: [],
        margin: [10, 10],
        isDraggable: true,
        isResizable: true,
        isDroppable: false,
        useCSSTransforms: true,
        transformScale: 1,
        verticalCompact: true,
        compactType: 'vertical',
        preventCollision: false,
        otherGridItemEntered: false,
        droppingItem: {
            i: '__dropping-elem__',
            h: 1,
            w: 1,
        },
        onLayoutChange: noop,
        onItemOut: noop,
        onDragStart: noop,
        onDrag: noop,
        onDragStop: noop,
        onDragNewItemEnter: noop,
        onDragNewItemLeave: noop,
        dragEnterChild: false,
        onResizeStart: noop,
        onResize: noop,
        onResizeStop: noop,
        onDrop: noop,
    };

    state: State = {
        activeDrag: null,
        layout: synchronizeLayoutWithChildren(
            this.props.layout,
            this.props.children,
            this.props.cols,
            // Legacy support for verticalCompact: false
            compactType(this.props),
        ),
        mounted: false,
        oldDragItem: null,
        oldLayout: null,
        oldResizeItem: null,
        droppingDOMNode: null,
        children: [],
    };

    dragEnterCounter = 0;

    rglContainer: any = null;

    onItemOut: any = noop;

    rglContainerPos: Position = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    }

    constructor(props: Props, context: any) {
        super(props, context);
        autoBindHandlers(this, [
            'onDragStart',
            'onDrag',
            'onDragStop',
            'onResizeStart',
            'onResize',
            'onResizeStop',
        ]);
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        let newLayoutBase;

        if (prevState.activeDrag) {
            return null;
        }

        // Legacy support for compactType
        // Allow parent to set layout directly.
        if (
            !isEqual(nextProps.layout, prevState.propsLayout)
            || nextProps.compactType !== prevState.compactType
        ) {
            newLayoutBase = nextProps.layout;
        } else if (!childrenEqual(nextProps.children, prevState.children)) {
            // If children change, also regenerate the layout. Use our state
            // as the base in case because it may be more up to date than
            // what is in props.
            newLayoutBase = prevState.layout;
        }

        // We need to regenerate the layout.
        if (newLayoutBase) {
            const newLayout = synchronizeLayoutWithChildren(
                newLayoutBase,
                nextProps.children,
                nextProps.cols,
                compactType(nextProps),
            );

            return {
                layout: newLayout,
                // We need to save these props to state for using
                // getDerivedStateFromProps instead of componentDidMount (in which we would get extra rerender)
                compactType: nextProps.compactType,
                children: nextProps.children,
                propsLayout: nextProps.layout,
            };
        }

        return null;
    }

    componentDidMount() {
        this.setState({ mounted: true });
        // Possibly call back with layout on mount. This should be done after correcting the layout width
        // to ensure we don't rerender with the wrong width.
        this.onLayoutMaybeChanged(this.state.layout, this.props.layout, true);
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (!this.state.activeDrag) {
            const newLayout = this.state.layout;
            const oldLayout = prevState.layout;

            this.onLayoutMaybeChanged(newLayout, oldLayout);
        }
    }

    /**
   * Calculates a pixel value for the container.
   * @return {String} Container height in pixels.
   */
    containerHeight() {
        if (!this.props.autoSize) return;
        const nbRow = bottom(this.state.layout);
        const containerPaddingY = this.props.containerPadding
            ? this.props.containerPadding[1]
            : this.props.margin[1];
        return (
            `${nbRow * this.props.rowHeight
            + (nbRow - 1) * this.props.margin[1]
            + containerPaddingY * 2
            }px`
        );
    }

    calcXY(top: number, left: number): {
        x: number;
        y: number;
    } {
        const {
            margin, cols, rowHeight, containerPadding, width,
        } = this.props;


        const padding = containerPadding || margin;
        const colWidth = (width - margin[0] * (cols - 1) - padding[0] * 2) / cols;

        const x = Math.round((left - margin[0]) / (colWidth + margin[0]));
        const y = Math.round((top - margin[1]) / (rowHeight + margin[1]));

        return { x, y };
    }

    /**
   * When dragging starts
   * @param {String} i Id of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
    onDragStart(i: string, x: number, y: number, {
        e,
        node,
    }: GridDragEvent) {
        const { layout } = this.state;
        const l = getLayoutItem(layout, i);
        if (!l) return;

        this.setState({
            oldDragItem: cloneLayoutItem(l),
            oldLayout: this.state.layout,
        });

        return this.props.onDragStart(layout, l, l, null, e, node);
    }

    /**
   * Each drag movement create a new dragelement and move the element to the dragged location
   * @param {String} i Id of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
    onDrag(i: string, x: number, y: number, {
        e,
        node,
    }: GridDragEvent) {
        const { oldDragItem } = this.state;
        let { layout } = this.state;
        const { cols } = this.props;
        const l = getLayoutItem(layout, i);
        if (!l) return;

        // Create placeholder (display only)
        const placeholder = {
            w: l.w,
            h: l.h,
            x,
            y,
            placeholder: true,
            i,
        };
        if (outOfBoundary(cols, bottom(layout), {
            x, y, w: l.w, h: l.h,
        })) {
            const { clientX, clientY } = e as any;
            this.props.onItemOut(l, clientX, clientY);
            this.setState({
                activeDrag: null,
            });
        } else {
            this.setState({
                activeDrag: placeholder,
            });
        }

        // Move the element to the dragged location.
        const isUserAction = true;
        layout = moveElement(
            layout,
            l,
            x,
            y,
            isUserAction,
            this.props.preventCollision,
            compactType(this.props),
            cols,
        );

        this.props.onDrag(layout, oldDragItem, l, placeholder, e, node);

        this.setState({
            layout: compact(layout, compactType(this.props), cols),
        });
    }

    /**
   * When dragging stops, figure out which position the element is closest to and update its x and y.
   * @param  {String} i Index of the child.
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
    onDragStop(i: string, x: number, y: number, {
        e,
        node,
    }: GridDragEvent) {
        const { oldDragItem } = this.state;
        let { layout } = this.state;
        const { cols, preventCollision } = this.props;
        const l = getLayoutItem(layout, i);
        if (!l) return;
        if (outOfBoundary(cols, bottom(layout), {
            x, y, w: l.w, h: l.h,
        })) {
            console.log('onDragStop outOfBoundary');
            const idx = getLayoutItemIndex(layout, i);

            layout.splice(idx, 1);
        } else {
            // Move the element here
            const isUserAction = true;
            layout = moveElement(
                layout,
                l,
                x,
                y,
                isUserAction,
                preventCollision,
                compactType(this.props),
                cols,
            );
        }

        if (this.state.activeDrag) {
            this.props.onDragStop(layout, oldDragItem, l, null, e, node);
        }

        // Set state
        const newLayout = compact(layout, compactType(this.props), cols);
        const { oldLayout } = this.state;
        this.setState({
            activeDrag: null,
            layout: newLayout,
            oldDragItem: null,
            oldLayout: null,
        });

        this.onLayoutMaybeChanged(newLayout, oldLayout);
    }

    onLayoutMaybeChanged(newLayout: Layout, oldLayout: Layout | null | undefined, isForce?: boolean) {
        if (!oldLayout) oldLayout = this.state.layout;
        // 计算容器位置
        const containerEl = this.rglContainer;
        const containerOffset = getOffset(containerEl);
        const width: any = containerEl.clientWidth;
        const height: any = containerEl.clientHeight;

        this.rglContainerPos = {
            ...containerOffset,
            width,
            height,
        };
        if (isForce) {
            this.props.onLayoutChange(newLayout, this.rglContainerPos);
            return;
        }

        if (!isEqual(oldLayout, newLayout)) {
            this.props.onLayoutChange(newLayout, this.rglContainerPos);
        }
    }

    onResizeStart(i: string, w: number, h: number, {
        e,
        node,
    }: GridResizeEvent) {
        const { layout } = this.state;
        const l = getLayoutItem(layout, i);
        if (!l) return;

        this.setState({
            oldResizeItem: cloneLayoutItem(l),
            oldLayout: this.state.layout,
        });

        this.props.onResizeStart(layout, l, l, null, e, node);
    }

    onResize(i: string, w: number, h: number, {
        e,
        node,
    }: GridResizeEvent) {
        const { layout, oldResizeItem } = this.state;
        const { cols, preventCollision } = this.props;
        const l: LayoutItem | null | undefined = getLayoutItem(layout, i);
        if (!l) return;

        // Something like quad tree should be used
        // to find collisions faster
        let hasCollisions;
        if (preventCollision) {
            const collisions = getAllCollisions(layout, { ...l, w, h }).filter(
                layoutItem => layoutItem.i !== l.i,
            );
            hasCollisions = collisions.length > 0;

            // If we're colliding, we need adjust the placeholder.
            if (hasCollisions) {
                // adjust w && h to maximum allowed space
                let leastX = Infinity;
                let leastY = Infinity;
                collisions.forEach((layoutItem) => {
                    if (layoutItem.x > l.x) leastX = Math.min(leastX, layoutItem.x);
                    if (layoutItem.y > l.y) leastY = Math.min(leastY, layoutItem.y);
                });

                if (Number.isFinite(leastX)) l.w = leastX - l.x;
                if (Number.isFinite(leastY)) l.h = leastY - l.y;
            }
        }

        if (!hasCollisions) {
            // Set new width and height.
            l.w = w;
            l.h = h;
        }

        // Create placeholder element (display only)
        const placeholder = {
            w: l.w,
            h: l.h,
            x: l.x,
            y: l.y,
            static: true,
            i,
        };

        this.props.onResize(layout, oldResizeItem, l, placeholder, e, node);

        // Re-compact the layout and set the drag placeholder.
        this.setState({
            layout: compact(layout, compactType(this.props), cols),
            activeDrag: placeholder,
        });
    }

    onResizeStop(i: string, w: number, h: number, {
        e,
        node,
    }: GridResizeEvent) {
        const { layout, oldResizeItem } = this.state;
        const { cols } = this.props;
        const l = getLayoutItem(layout, i);

        this.props.onResizeStop(layout, oldResizeItem, l, null, e, node);

        // Set state
        const newLayout = compact(layout, compactType(this.props), cols);
        const { oldLayout } = this.state;
        this.setState({
            activeDrag: null,
            layout: newLayout,
            oldResizeItem: null,
            oldLayout: null,
        });

        this.onLayoutMaybeChanged(newLayout, oldLayout);
    }

    /**
   * Create a placeholder object.
   * @return {Element} Placeholder div.
   */
    placeholder(): React.ReactElement<any> | null {
        const { activeDrag } = this.state;
        if (!activeDrag || this.props.dragEnterChild) return null;

        const {
            width,
            cols,
            margin,
            containerPadding,
            rowHeight,
            maxRows,
            useCSSTransforms,
            transformScale,
        } = this.props;

        // {...this.state.activeDrag} is pretty slow, actually
        return (
            <GridItem
                w={activeDrag.w}
                h={activeDrag.h}
                x={activeDrag.x}
                y={activeDrag.y}
                i={activeDrag.i}
                className="react-grid-placeholder"
                containerWidth={width}
                cols={cols}
                margin={margin}
                containerPadding={containerPadding || margin}
                maxRows={maxRows}
                rowHeight={rowHeight}
                isDraggable={false}
                isResizable={false}
                useCSSTransforms={useCSSTransforms}
                transformScale={transformScale}
            >
                <div />
            </GridItem>
        );
    }

    /**
   * Given a grid item, set its style attributes & surround in a <Draggable>.
   * @param  {Element} child React element.
   * @return {Element}       Element wrapped in draggable and properly placed.
   */
    processGridItem(child: React.ReactElement<any>, isDroppingItem?: boolean): React.ReactElement<any> | null {
        if (!child || !child.key) return null;
        const l = getLayoutItem(this.state.layout, String(child.key));
        if (!l) return null;
        const {
            width,
            cols,
            margin,
            containerPadding,
            rowHeight,
            maxRows,
            isDraggable,
            isResizable,
            useCSSTransforms,
            transformScale,
            draggableCancel,
            draggableHandle,
        } = this.props;
        const { mounted, droppingPosition } = this.state;

        // Parse 'static'. Any properties defined directly on the grid item will take precedence.
        const draggable = Boolean(
            !l.static && isDraggable && (l.isDraggable || l.isDraggable == null),
        );
        const resizable = Boolean(
            !l.static && isResizable && (l.isResizable || l.isResizable == null),
        );
        return (
            // @ts-ignore
            <GridItem
                containerWidth={width}
                cols={cols}
                margin={margin}
                containerPadding={containerPadding || margin}
                maxRows={maxRows}
                rowHeight={rowHeight}
                cancel={draggableCancel}
                handle={draggableHandle}
                onDragStop={this.onDragStop}
                onDragStart={this.onDragStart}
                onDrag={this.onDrag}
                onResizeStart={this.onResizeStart}
                onResize={this.onResize}
                onResizeStop={this.onResizeStop}
                isDraggable={draggable}
                isResizable={resizable}
                useCSSTransforms={useCSSTransforms && mounted}
                usePercentages={!mounted}
                transformScale={transformScale}
                w={l.w}
                h={l.h}
                x={isDroppingItem && droppingPosition ? droppingPosition.x : l.x}
                y={isDroppingItem && droppingPosition ? droppingPosition.y : l.y}
                i={l.i}
                minH={l.minH}
                minW={l.minW}
                maxH={l.maxH}
                maxW={l.maxW}
                static={l.static}
                isDroppingItem={!!isDroppingItem}
            >
                {child}
            </GridItem>
        );
    }

    moveItem = (droppingItem, layerX, layerY, e) => {
        const { layout } = this.state;
        const {
            margin, containerPadding, width, cols, rowHeight,
        } = this.props;
        const { x, y } = calcXY(layerY, layerX, {
            margin, containerPadding, width, cols, rowHeight,
        });

        if (!this.state.droppingDOMNode) {
            // @ts-ignore
            this.setState({
                droppingDOMNode: <div key={droppingItem.i} />,
                droppingPosition: {
                    x: layerX,
                    y: layerY,
                },
                layout: [
                    ...layout,
                    {
                        ...droppingItem,
                        x: 0,
                        y: 0,
                        static: false,
                        isDraggable: true,
                    },
                ],
            });
        } else if (this.state.droppingPosition) {
            const shouldUpdatePosition = this.state.droppingPosition.x !== layerX
                || this.state.droppingPosition.y !== layerY;
            shouldUpdatePosition && this.setState({
                droppingPosition: {
                    x: layerX,
                    y: layerY,
                },
            });
        }

        this.onDrag(droppingItem.i, x, y, { e });
    }

    onDragOver = (e: DragOverEvent) => {
        // we should ignore events from layout's children in Firefox
        // to avoid unpredictable jumping of a dropping placeholder
        if (
            isFirefox
            && !e.nativeEvent.target.className.includes(layoutClassName)
        ) {
            return false;
        }

        const {
            droppingItem,
        } = this.props;
        const { layerX, layerY } = e.nativeEvent;

        this.moveItem(droppingItem, layerX, layerY, e);

        e.stopPropagation();
        e.preventDefault();
    };

    removeDroppingPlaceholder = () => {
        const { droppingItem, cols } = this.props;
        const { layout } = this.state;

        const newLayout = compact(
            layout.filter(l => l.i !== droppingItem.i),
            compactType(this.props),
            cols,
        );

        this.setState({
            layout: newLayout,
            droppingDOMNode: null,
            activeDrag: null,
            droppingPosition: undefined,
        });
    };

    onDragLeave = () => {
        this.dragEnterCounter--;
        // onDragLeave can be triggered on each layout's child.
        // But we know that count of dragEnter and dragLeave events
        // will be balanced after leaving the layout's container
        // so we can increase and decrease count of dragEnter and
        // when it'll be equal to 0 we'll remove the placeholder
        if (this.dragEnterCounter === 0) {
            this.removeDroppingPlaceholder();
            this.props.onDragNewItemLeave();
        }
    };

    onDragEnter = () => {
        if (this.dragEnterCounter === 0) {
            this.props.onDragNewItemEnter();
        }
        this.dragEnterCounter++;
    };

    onDrop = () => {
        const { droppingItem } = this.props;
        const { layout } = this.state;
        const {
            x, y, w, h,
        } = layout.find(l => l.i === droppingItem.i) || {};

        // reset gragEnter counter on drop
        this.dragEnterCounter = 0;

        this.removeDroppingPlaceholder();
        this.props.onDrop({
            // @ts-ignore
            x, y, w, h,
        });
    };

    render() {
        const {
            className, style, isDroppable,
        } = this.props;

        const mergedClassName = classNames(layoutClassName, className);
        const mergedStyle = {
            height: this.containerHeight(),
            ...style,
        };

        return (
            <div
                className={mergedClassName}
                style={mergedStyle}
                ref={(ref) => { this.rglContainer = ref; }}
                onDrop={isDroppable ? this.onDrop : noop}
                onDragLeave={isDroppable ? this.onDragLeave : noop}
                onDragEnter={isDroppable ? this.onDragEnter : noop}
                onDragOver={isDroppable ? this.onDragOver : noop}
            >
                {React.Children.map(this.props.children, child => this.processGridItem(child))}
                {isDroppable
                    && this.state.droppingDOMNode
                    && this.processGridItem(this.state.droppingDOMNode, true)}
                {this.placeholder()}
            </div>
        );
    }
}
export default RGL;
