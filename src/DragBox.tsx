/**
 * tabs标签页调整顺序
 */
import * as React from 'react';
import classNames from 'classnames';
import Sortable, { MultiDrag, Swap, utils } from 'sortablejs';

export const dragUtils = utils;

interface DragEvent {
    item: any; // dragged HTMLElement
    to: any; // target list
    from: any; // previous list
    oldIndex: any; // element's old index within old parent
    newIndex: any; // element's new index within new parent
    oldDraggableIndex: any; // element's old index within old parent, only counting draggable elements
    newDraggableIndex: any; // element's new index within new parent, only counting draggable elements
    clone: any; // the clone element
    pullMode: any;
}
type EventCallback = (evt: DragEvent) => void;

interface DragLineProps {
    allowSwag?: Boolean;
    allowMultiDrag?: Boolean;
    style?: any;
    removeDraginItem?: boolean;

    group: string | any;
    sort: Boolean; // sorting inside list
    delay: number; // time in milliseconds to define when the sorting should start
    delayOnTouchOnly: Boolean; // only delay if user is using touch
    touchStartThreshold: number; // px, how many pixels the point should move before cancelling a delayed drag event
    disabled: Boolean; // Disables the sortable if set to true.
    animation: 150; // ms, animation speed moving items when sorting, `0` — without animation
    easing: string; // Easing for animation. Defaults to null. See https://easings.net/ for examples.
    handle: string; // Drag handle selector within list items
    filter: string; // Selectors that do not lead to dragging (String or Function)
    preventOnFilter: Boolean; // Call `event.preventDefault()` when triggered `filter`
    draggable: string; // Specifies which items inside the element should be draggable
    dataIdAttr: string;

    ghostClass: string; // Class name for the drop placeholder
    chosenClass: string; // Class name for the chosen item
    dragClass: string; // Class name for the dragging item

    swapThreshold: number; // Threshold of the swap zone
    invertSwap: Boolean; // Will always use inverted swap zone if set to true
    invertedSwapThreshold: number; // Threshold of the inverted swap zone (will be set to swapThreshold value by default)
    direction: string; // Direction of Sortable (will be detected automatically if not given)

    forceFallback: Boolean; // ignore the HTML5 DnD behaviour and force the fallback to kick in
    fallbackClass: string; // Class name for the cloned DOM Element when using forceFallback
    fallbackOnBody: Boolean; // Appends the cloned DOM Element into the Document's Body
    fallbackTolerance: number; // Specify in pixels how far the mouse should move before it's considered as a drag.

    dragoverBubble: Boolean;
    removeCloneOnHide: Boolean; // Remove the clone element when it is not showing, rather than just hiding it
    emptyInsertThreshold: number; // px, distance mouse must be from empty sortable to insert drag element into it

    setData: (/** DataTransfer */dataTransfer: any, /** HTMLElement*/dragEl: any) => void;

    // Element is chosen
    onChoose: EventCallback;

    // Element is unchosen
    onUnchoose: EventCallback;

    // Element dragging started
    onStart: EventCallback;

    // Element dragging ended
    onEnd: EventCallback;

    // Element is dropped into the list from another list
    onAdd: EventCallback;

    // Changed sorting within list
    onUpdate: EventCallback;

    // Called by any change to the list (add / update / remove)
    onSort: EventCallback;

    // Element is removed from the list into another list
    onRemove: EventCallback;

    // Attempt to drag a filtered element
    onFilter: EventCallback;

    // Event when you move an item in the list or between lists
    onMove: (/**Event*/evt: any, /**Event*/originalEvent: any) => void;

    // Called when creating a clone of element
    onClone: EventCallback;

    // Called when dragging element changes position
    onChange: EventCallback;

    children: Array<React.ReactElement<any>>;
}


export default class DragBox extends React.Component<DragLineProps> {
    static defaultProps = {
        allowSwag: false,
        allowMultiDrag: false,
        removeDraginItem: false,
    }

    containerRef: any = null;

    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
    }

    componentDidMount() {
        const {
            allowSwag, allowMultiDrag, children, onAdd, removeDraginItem, ...dragProps
        } = this.props;
        const dragContainer = this.containerRef.current;
        if (allowMultiDrag) {
            Sortable.mount(new MultiDrag());
        }
        if (allowSwag) {
            Sortable.mount(new Swap());
        }

        Sortable.create(dragContainer, {
            ...dragProps,
            onAdd: removeDraginItem ? (evt) => {
                const { item } = evt;
                if (item.parentNode) {
                    item.parentNode.removeChild(item);
                }
                this.props.onAdd(evt);
            } : onAdd,
        });
    }

    render() {
        const { children, style } = this.props;

        return (
            <div
                ref={this.containerRef}
                style={style}
            >
                {React.Children.map(children, child => React.cloneElement(child, {
                    className: classNames(
                        'drag-box-item',
                        child.props.className,
                    ),
                }))}
            </div>
        );
    }
}
