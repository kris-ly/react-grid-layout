"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var PropTypes = require("prop-types");
var lodash_1 = require("lodash");
var classNames = require("classnames");
var utils_1 = require("./utils");
var GridItem_1 = require("./GridItem");
var eventUtils_1 = require("./eventUtils");
// End Types
var compactType = function (props) {
    var _a = props || {}, verticalCompact = _a.verticalCompact, compactType = _a.compactType;
    return verticalCompact === false ? null : compactType;
};
var layoutClassName = 'react-grid-layout';
var isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
/**
 * A reactive, fluid grid layout with draggable, resizable components.
 */
var RGL = /** @class */ (function (_super) {
    __extends(RGL, _super);
    function RGL(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.state = {
            activeDrag: null,
            layout: utils_1.synchronizeLayoutWithChildren(_this.props.layout, _this.props.children, _this.props.cols, 
            // Legacy support for verticalCompact: false
            compactType(_this.props)),
            mounted: false,
            oldDragItem: null,
            oldLayout: null,
            oldResizeItem: null,
            droppingDOMNode: null,
            children: [],
        };
        _this.dragEnterCounter = 0;
        _this.rglContainer = null;
        _this.ownItemOut = false;
        _this.otherItemIn = false;
        _this.rglContainerPos = {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        };
        _this.moveItem = function (droppingItem, layerX, layerY) {
            var layout = _this.state.layout;
            var _a = _this.props, margin = _a.margin, containerPadding = _a.containerPadding, width = _a.width, cols = _a.cols, rowHeight = _a.rowHeight;
            var _b = utils_1.calcXY(layerY, layerX, {
                margin: margin, containerPadding: containerPadding, width: width, cols: cols, rowHeight: rowHeight,
            }), x = _b.x, y = _b.y;
            var placeholder = {
                w: droppingItem.w,
                h: droppingItem.h,
                x: x,
                y: y,
                placeholder: true,
                i: droppingItem.i,
            };
            if (!_this.state.droppingDOMNode) {
                layout = __spreadArrays(layout, [
                    __assign(__assign({}, droppingItem), { x: 0, y: 0, static: false, isDraggable: true }),
                ]);
                _this.setState({
                    droppingDOMNode: React.createElement("div", { key: droppingItem.i }),
                    droppingPosition: {
                        x: layerX,
                        y: layerY,
                    },
                });
            }
            else if (_this.state.droppingPosition) {
                var shouldUpdatePosition = _this.state.droppingPosition.x !== layerX
                    || _this.state.droppingPosition.y !== layerY;
                if (shouldUpdatePosition) {
                    var idx = utils_1.getLayoutItemIndex(layout, droppingItem.i);
                    layout[idx] = __assign(__assign({}, droppingItem), { x: x,
                        y: y, static: false, isDraggable: true });
                    _this.setState({
                        droppingPosition: {
                            x: layerX,
                            y: layerY,
                        },
                    });
                }
            }
            // Move the element to the dragged location.
            var isUserAction = true;
            layout = utils_1.moveElement(layout, droppingItem, x, y, isUserAction, _this.props.preventCollision, compactType(_this.props), cols);
            _this.setState({
                activeDrag: placeholder,
                layout: utils_1.compact(layout, compactType(_this.props), cols),
            });
        };
        _this.onDragOver = function (e) {
            // we should ignore events from layout's children in Firefox
            // to avoid unpredictable jumping of a dropping placeholder
            if (isFirefox
                && !e.nativeEvent.target.className.includes(layoutClassName)) {
                return false;
            }
            var droppingItem = _this.props.droppingItem;
            var _a = e.nativeEvent, layerX = _a.layerX, layerY = _a.layerY;
            _this.moveItem(droppingItem, layerX, layerY);
            e.stopPropagation();
            e.preventDefault();
        };
        _this.removeDroppingPlaceholder = function (dontCangeLayout) {
            if (dontCangeLayout === void 0) { dontCangeLayout = false; }
            if (dontCangeLayout) {
                _this.setState({
                    droppingDOMNode: null,
                    activeDrag: null,
                    droppingPosition: undefined,
                });
                return;
            }
            var _a = _this.props, droppingItem = _a.droppingItem, cols = _a.cols;
            var layout = _this.state.layout;
            var newLayout = utils_1.compact(layout.filter(function (l) { return l.i !== droppingItem.i; }), compactType(_this.props), cols);
            _this.setState({
                layout: newLayout,
                droppingDOMNode: null,
                activeDrag: null,
                droppingPosition: undefined,
            });
        };
        _this.onDragLeave = function () {
            _this.dragEnterCounter--;
            // onDragLeave can be triggered on each layout's child.
            // But we know that count of dragEnter and dragLeave events
            // will be balanced after leaving the layout's container
            // so we can increase and decrease count of dragEnter and
            // when it'll be equal to 0 we'll remove the placeholder
            if (_this.dragEnterCounter === 0) {
                _this.removeDroppingPlaceholder();
                _this.props.onDragNewItemLeave();
            }
        };
        _this.onDragEnter = function () {
            if (_this.dragEnterCounter === 0) {
                _this.props.onDragNewItemEnter();
            }
            _this.dragEnterCounter++;
        };
        _this.onDrop = function () {
            var droppingItem = _this.props.droppingItem;
            var layout = _this.state.layout;
            var _a = layout.find(function (l) { return l.i === droppingItem.i; }) || {}, x = _a.x, y = _a.y, w = _a.w, h = _a.h;
            // reset gragEnter counter on drop
            _this.dragEnterCounter = 0;
            _this.removeDroppingPlaceholder();
            _this.props.onDrop({
                // @ts-ignore
                x: x, y: y, w: w, h: h,
            });
        };
        utils_1.autoBindHandlers(_this, [
            'onDragStart',
            'onDrag',
            'onDragStop',
            'onResizeStart',
            'onResize',
            'onResizeStop',
        ]);
        return _this;
    }
    RGL.getDerivedStateFromProps = function (nextProps, prevState) {
        var newLayoutBase;
        // if (prevState.activeDrag) {
        //     return null;
        // }
        // Legacy support for compactType
        // Allow parent to set layout directly.
        if (!lodash_1.isEqual(nextProps.layout, prevState.propsLayout)
            || nextProps.compactType !== prevState.compactType) {
            newLayoutBase = nextProps.layout;
        }
        else if (!utils_1.childrenEqual(nextProps.children, prevState.children)) {
            // If children change, also regenerate the layout. Use our state
            // as the base in case because it may be more up to date than
            // what is in props.
            newLayoutBase = prevState.layout;
        }
        // We need to regenerate the layout.
        if (newLayoutBase) {
            var newLayout = utils_1.synchronizeLayoutWithChildren(newLayoutBase, nextProps.children, nextProps.cols, compactType(nextProps));
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
    };
    RGL.prototype.componentDidMount = function () {
        var _this = this;
        this.setState({ mounted: true });
        // Possibly call back with layout on mount. This should be done after correcting the layout width
        // to ensure we don't rerender with the wrong width.
        this.onLayoutMaybeChanged(this.state.layout, this.props.layout, true);
        if (!this.props.allowCrossGridDrag)
            return;
        eventUtils_1.bindItemOutEvent(function (params) {
            if (_this.ownItemOut)
                return;
            var item = params.item, clientX = params.clientX, clientY = params.clientY;
            var _a = _this.props, droppingItem = _a.droppingItem, rglKey = _a.rglKey;
            if (utils_1.isMouseIn(clientX, clientY, _this.rglContainerPos)) {
                var newDroppingItem = {
                    i: droppingItem.i,
                    w: item.w,
                    h: item.h,
                };
                var _b = _this.rglContainerPos, left = _b.left, top_1 = _b.top;
                _this.otherItemIn = true;
                _this.moveItem(newDroppingItem, clientX - left, clientY - top_1);
                _this.props.onOtherItemIn(rglKey, item, clientX, clientY);
                return;
            }
            if (_this.otherItemIn) {
                _this.removeDroppingPlaceholder();
                _this.otherItemIn = false;
            }
        });
        eventUtils_1.bindItemDropEvent(function (_a) {
            var rglKey = _a.rglKey, item = _a.item;
            if (_this.ownItemOut)
                return;
            var layout = _this.state.layout;
            _this.props.onOtherItemDrop(rglKey, layout, item);
            if (_this.state.activeDrag) {
                _this.removeDroppingPlaceholder(true);
            }
        });
    };
    RGL.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (!this.state.activeDrag) {
            var newLayout = this.state.layout;
            var oldLayout = prevState.layout;
            this.onLayoutMaybeChanged(newLayout, oldLayout);
        }
    };
    /**
   * Calculates a pixel value for the container.
   * @return {String} Container height in pixels.
   */
    RGL.prototype.containerHeight = function () {
        if (!this.props.autoSize)
            return;
        var nbRow = utils_1.bottom(this.state.layout);
        var containerPaddingY = this.props.containerPadding
            ? this.props.containerPadding[1]
            : this.props.margin[1];
        return (nbRow * this.props.rowHeight
            + (nbRow - 1) * this.props.margin[1]
            + containerPaddingY * 2 + "px");
    };
    RGL.prototype.calcXY = function (top, left) {
        var _a = this.props, margin = _a.margin, cols = _a.cols, rowHeight = _a.rowHeight, containerPadding = _a.containerPadding, width = _a.width;
        var padding = containerPadding || margin;
        var colWidth = (width - margin[0] * (cols - 1) - padding[0] * 2) / cols;
        var x = Math.round((left - margin[0]) / (colWidth + margin[0]));
        var y = Math.round((top - margin[1]) / (rowHeight + margin[1]));
        return { x: x, y: y };
    };
    /**
   * When dragging starts
   * @param {String} i Id of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
    RGL.prototype.onDragStart = function (i, x, y, _a) {
        var e = _a.e, node = _a.node;
        var layout = this.state.layout;
        var l = utils_1.getLayoutItem(layout, i);
        if (!l)
            return;
        this.setState({
            oldDragItem: utils_1.cloneLayoutItem(l),
            oldLayout: this.state.layout,
        });
        return this.props.onDragStart(layout, l, l, null, e, node);
    };
    /**
   * Each drag movement create a new dragelement and move the element to the dragged location
   * @param {String} i Id of the child
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
    RGL.prototype.onDrag = function (i, x, y, _a) {
        var e = _a.e, node = _a.node;
        var oldDragItem = this.state.oldDragItem;
        var layout = this.state.layout;
        var _b = this.props, cols = _b.cols, allowCrossGridDrag = _b.allowCrossGridDrag;
        var l = utils_1.getLayoutItem(layout, i);
        if (!l)
            return;
        // Create placeholder (display only)
        var placeholder = {
            w: l.w,
            h: l.h,
            x: x,
            y: y,
            placeholder: true,
            i: i,
        };
        if (utils_1.outOfBoundary(cols, utils_1.bottom(layout), {
            x: x, y: y, w: l.w, h: l.h,
        })) {
            var _c = e, clientX = _c.clientX, clientY = _c.clientY;
            this.ownItemOut = true;
            if (allowCrossGridDrag) {
                eventUtils_1.emitItemOutEvent({
                    item: l,
                    clientX: clientX,
                    clientY: clientY,
                });
            }
            this.setState({
                activeDrag: null,
            });
        }
        else {
            this.ownItemOut = false;
            this.setState({
                activeDrag: placeholder,
            });
        }
        // Move the element to the dragged location.
        var isUserAction = true;
        layout = utils_1.moveElement(layout, l, x, y, isUserAction, this.props.preventCollision, compactType(this.props), cols);
        this.props.onDrag(layout, oldDragItem, l, placeholder, e, node);
        this.setState({
            layout: utils_1.compact(layout, compactType(this.props), cols),
        });
    };
    /**
   * When dragging stops, figure out which position the element is closest to and update its x and y.
   * @param  {String} i Index of the child.
   * @param {Number} x X position of the move
   * @param {Number} y Y position of the move
   * @param {Event} e The mousedown event
   * @param {Element} node The current dragging DOM element
   */
    RGL.prototype.onDragStop = function (i, x, y, _a) {
        var e = _a.e, node = _a.node;
        var oldDragItem = this.state.oldDragItem;
        var layout = this.state.layout;
        var _b = this.props, cols = _b.cols, preventCollision = _b.preventCollision, allowCrossGridDrag = _b.allowCrossGridDrag, onItemDropOut = _b.onItemDropOut, rglKey = _b.rglKey;
        var l = utils_1.getLayoutItem(layout, i);
        if (!l)
            return;
        if (utils_1.outOfBoundary(cols, utils_1.bottom(layout), {
            x: x, y: y, w: l.w, h: l.h,
        })) {
            var idx = utils_1.getLayoutItemIndex(layout, i);
            layout.splice(idx, 1);
        }
        else {
            // Move the element here
            var isUserAction = true;
            layout = utils_1.moveElement(layout, l, x, y, isUserAction, preventCollision, compactType(this.props), cols);
        }
        if (this.state.activeDrag) {
            this.props.onDragStop(layout, oldDragItem, l, null, e, node);
        }
        // Set state
        var newLayout = utils_1.compact(layout, compactType(this.props), cols);
        var oldLayout = this.state.oldLayout;
        if (this.ownItemOut) {
            onItemDropOut(oldLayout, newLayout, l);
            if (allowCrossGridDrag) {
                eventUtils_1.emitItemDropEvent({
                    rglKey: rglKey,
                    item: l,
                });
            }
        }
        this.setState({
            activeDrag: null,
            layout: newLayout,
            oldDragItem: null,
            oldLayout: null,
        });
        this.onLayoutMaybeChanged(newLayout, oldLayout);
    };
    RGL.prototype.onLayoutMaybeChanged = function (newLayout, oldLayout, isForce) {
        if (!oldLayout)
            oldLayout = this.state.layout;
        // 计算容器位置
        var containerEl = this.rglContainer;
        var containerOffset = utils_1.getOffset(containerEl);
        var width = containerEl.clientWidth;
        var height = containerEl.clientHeight;
        this.rglContainerPos = __assign(__assign({}, containerOffset), { width: width,
            height: height });
        if (isForce) {
            this.props.onLayoutChange(newLayout, this.rglContainerPos);
            return;
        }
        if (!lodash_1.isEqual(oldLayout, newLayout)) {
            this.props.onLayoutChange(newLayout, this.rglContainerPos);
        }
    };
    RGL.prototype.onResizeStart = function (i, w, h, _a) {
        var e = _a.e, node = _a.node;
        var layout = this.state.layout;
        var l = utils_1.getLayoutItem(layout, i);
        if (!l)
            return;
        this.setState({
            oldResizeItem: utils_1.cloneLayoutItem(l),
            oldLayout: this.state.layout,
        });
        this.props.onResizeStart(layout, l, l, null, e, node);
    };
    RGL.prototype.onResize = function (i, w, h, _a) {
        var e = _a.e, node = _a.node;
        var _b = this.state, layout = _b.layout, oldResizeItem = _b.oldResizeItem;
        var _c = this.props, cols = _c.cols, preventCollision = _c.preventCollision;
        var l = utils_1.getLayoutItem(layout, i);
        if (!l)
            return;
        // Something like quad tree should be used
        // to find collisions faster
        var hasCollisions;
        if (preventCollision) {
            var collisions = utils_1.getAllCollisions(layout, __assign(__assign({}, l), { w: w, h: h })).filter(function (layoutItem) { return layoutItem.i !== l.i; });
            hasCollisions = collisions.length > 0;
            // If we're colliding, we need adjust the placeholder.
            if (hasCollisions) {
                // adjust w && h to maximum allowed space
                var leastX_1 = Infinity;
                var leastY_1 = Infinity;
                collisions.forEach(function (layoutItem) {
                    if (layoutItem.x > l.x)
                        leastX_1 = Math.min(leastX_1, layoutItem.x);
                    if (layoutItem.y > l.y)
                        leastY_1 = Math.min(leastY_1, layoutItem.y);
                });
                if (Number.isFinite(leastX_1))
                    l.w = leastX_1 - l.x;
                if (Number.isFinite(leastY_1))
                    l.h = leastY_1 - l.y;
            }
        }
        if (!hasCollisions) {
            // Set new width and height.
            l.w = w;
            l.h = h;
        }
        // Create placeholder element (display only)
        var placeholder = {
            w: l.w,
            h: l.h,
            x: l.x,
            y: l.y,
            static: true,
            i: i,
        };
        this.props.onResize(layout, oldResizeItem, l, placeholder, e, node);
        // Re-compact the layout and set the drag placeholder.
        this.setState({
            layout: utils_1.compact(layout, compactType(this.props), cols),
            activeDrag: placeholder,
        });
    };
    RGL.prototype.onResizeStop = function (i, w, h, _a) {
        var e = _a.e, node = _a.node;
        var _b = this.state, layout = _b.layout, oldResizeItem = _b.oldResizeItem;
        var cols = this.props.cols;
        var l = utils_1.getLayoutItem(layout, i);
        this.props.onResizeStop(layout, oldResizeItem, l, null, e, node);
        // Set state
        var newLayout = utils_1.compact(layout, compactType(this.props), cols);
        var oldLayout = this.state.oldLayout;
        this.setState({
            activeDrag: null,
            layout: newLayout,
            oldResizeItem: null,
            oldLayout: null,
        });
        this.onLayoutMaybeChanged(newLayout, oldLayout);
    };
    /**
   * Create a placeholder object.
   * @return {Element} Placeholder div.
   */
    RGL.prototype.placeholder = function () {
        var activeDrag = this.state.activeDrag;
        if (!activeDrag || this.props.dragEnterChild)
            return null;
        var _a = this.props, width = _a.width, cols = _a.cols, margin = _a.margin, containerPadding = _a.containerPadding, rowHeight = _a.rowHeight, maxRows = _a.maxRows, useCSSTransforms = _a.useCSSTransforms, transformScale = _a.transformScale;
        // {...this.state.activeDrag} is pretty slow, actually
        return (React.createElement(GridItem_1.default, { w: activeDrag.w, h: activeDrag.h, x: activeDrag.x, y: activeDrag.y, i: activeDrag.i, className: "react-grid-placeholder", containerWidth: width, cols: cols, margin: margin, containerPadding: containerPadding || margin, maxRows: maxRows, rowHeight: rowHeight, isDraggable: false, isResizable: false, isDroppingItem: false, useCSSTransforms: useCSSTransforms, transformScale: transformScale },
            React.createElement("div", null)));
    };
    /**
   * Given a grid item, set its style attributes & surround in a <Draggable>.
   * @param  {Element} child React element.
   * @return {Element}       Element wrapped in draggable and properly placed.
   */
    RGL.prototype.processGridItem = function (child, isDroppingItem) {
        if (!child || !child.key)
            return null;
        var l = utils_1.getLayoutItem(this.state.layout, String(child.key));
        if (!l)
            return null;
        // 如果是外部拖入的组件
        if (isDroppingItem && !this.otherItemIn)
            return null;
        var _a = this.props, width = _a.width, cols = _a.cols, margin = _a.margin, containerPadding = _a.containerPadding, rowHeight = _a.rowHeight, maxRows = _a.maxRows, isDraggable = _a.isDraggable, isResizable = _a.isResizable, useCSSTransforms = _a.useCSSTransforms, transformScale = _a.transformScale, draggableCancel = _a.draggableCancel, draggableHandle = _a.draggableHandle;
        var _b = this.state, mounted = _b.mounted, droppingPosition = _b.droppingPosition;
        var config = child.props['data-config'] || {};
        // Parse 'static'. Any properties defined directly on the grid item will take precedence.
        var draggable = Boolean(!config.static && !l.static && isDraggable && (l.isDraggable || l.isDraggable == null));
        var resizable = Boolean(!config.static && !l.static && isResizable && (l.isResizable || l.isResizable == null));
        return (
        // @ts-ignore
        React.createElement(GridItem_1.default, { containerWidth: width, cols: cols, margin: margin, containerPadding: containerPadding || margin, maxRows: maxRows, rowHeight: rowHeight, cancel: draggableCancel, handle: draggableHandle, onDragStop: this.onDragStop, onDragStart: this.onDragStart, onDrag: this.onDrag, onResizeStart: this.onResizeStart, onResize: this.onResize, onResizeStop: this.onResizeStop, isDraggable: draggable, isResizable: resizable, useCSSTransforms: useCSSTransforms && mounted, usePercentages: !mounted, transformScale: transformScale, w: l.w, h: l.h, x: isDroppingItem && droppingPosition ? droppingPosition.x : l.x, y: isDroppingItem && droppingPosition ? droppingPosition.y : l.y, i: l.i, minH: l.minH, minW: l.minW, maxH: l.maxH, maxW: l.maxW, static: l.static, isDroppingItem: !!isDroppingItem }, child));
    };
    RGL.prototype.render = function () {
        var _this = this;
        var _a = this.props, className = _a.className, style = _a.style, isDroppable = _a.isDroppable;
        var mergedClassName = classNames(layoutClassName, className);
        var mergedStyle = __assign({ height: this.containerHeight() }, style);
        return (React.createElement("div", { className: mergedClassName, style: mergedStyle, ref: function (ref) { _this.rglContainer = ref; }, onDrop: isDroppable ? this.onDrop : utils_1.noop, onDragLeave: isDroppable ? this.onDragLeave : utils_1.noop, onDragEnter: isDroppable ? this.onDragEnter : utils_1.noop, onDragOver: isDroppable ? this.onDragOver : utils_1.noop },
            React.Children.map(this.props.children, function (child) { return _this.processGridItem(child); }),
            isDroppable
                && this.state.droppingDOMNode
                && this.processGridItem(this.state.droppingDOMNode, true),
            this.placeholder()));
    };
    // TODO publish internal ReactClass displayName transform
    RGL.displayName = 'ReactGridLayout';
    RGL.propTypes = {
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
        rglKey: PropTypes.string,
        // Deprecated
        verticalCompact: function (props) {
            if (props.verticalCompact === false
                && process.env.NODE_ENV !== 'production') {
                console.warn(
                // eslint-disable-line no-console
                '`verticalCompact` on <ReactGridLayout> is deprecated and will be removed soon. '
                    + 'Use `compactType`: "horizontal" | "vertical" | null.');
            }
        },
        // Choose vertical or hotizontal compaction
        compactType: PropTypes.oneOf(['vertical', 'horizontal']),
        // layout is an array of object with the format:
        // {x: Number, y: Number, w: Number, h: Number, i: String}
        layout: function (props) {
            var layout = props.layout;
            // I hope you're setting the data-grid property on the grid items
            if (layout === undefined)
                return;
            utils_1.validateLayout(layout, 'layout');
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
        allowCrossGridDrag: PropTypes.bool,
        //
        // Callbacks
        //
        // Callback so you can save the layout. Calls after each drag & resize stops.
        onLayoutChange: PropTypes.func,
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
        onOtherItemIn: PropTypes.func,
        onOtherItemDrop: PropTypes.func,
        onItemDropOut: PropTypes.func,
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
        children: function (props, propName) {
            var children = props[propName];
            // Check children keys for duplicates. Throw if found.
            var keys = {};
            React.Children.forEach(children, function (child) {
                if (keys[child.key]) {
                    throw new Error("Duplicate child key \"" + child.key + "\" found! This will cause problems in ReactGridLayout.");
                }
                keys[child.key] = true;
            });
        },
    };
    RGL.defaultProps = {
        autoSize: true,
        cols: 12,
        className: '',
        style: {},
        draggableHandle: '',
        draggableCancel: '',
        rglKey: '',
        containerPadding: null,
        rowHeight: 150,
        maxRows: Infinity,
        layout: [],
        margin: [10, 10],
        isDraggable: true,
        isResizable: true,
        isDroppable: false,
        allowCrossGridDrag: false,
        useCSSTransforms: true,
        transformScale: 1,
        verticalCompact: true,
        compactType: 'vertical',
        preventCollision: false,
        droppingItem: {
            i: '__dropping-elem__',
            h: 1,
            w: 1,
        },
        onLayoutChange: utils_1.noop,
        onDragStart: utils_1.noop,
        onDrag: utils_1.noop,
        onDragStop: utils_1.noop,
        onDragNewItemEnter: utils_1.noop,
        onDragNewItemLeave: utils_1.noop,
        onOtherItemIn: utils_1.noop,
        onOtherItemDrop: utils_1.noop,
        onItemDropOut: utils_1.noop,
        dragEnterChild: false,
        onResizeStart: utils_1.noop,
        onResize: utils_1.noop,
        onResizeStop: utils_1.noop,
        onDrop: utils_1.noop,
    };
    return RGL;
}(React.Component));
exports.default = RGL;
//# sourceMappingURL=ReactGridLayout.js.map