/**
 * 后端查询接口返回数据
 *
*/
interface Breakpoints {
    lg?: number;
    md?: number;
    sm?: number;
    xs?: number;
    xxs?: number;
}
interface ResponsiveLayout {
    lg?: Layout;
    md?: Layout;
    sm?: Layout;
    xs?: Layout;
    xxs?: Layout;
}
type LayoutItem = {
    w: number;
    h: number;
    x: number;
    y: number;
    i: string;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    moved?: boolean;
    static?: boolean;
    isDraggable?: boolean | null | undefined;
    isResizable?: boolean | null | undefined;
};

type Layout = Array<LayoutItem>;

type PositionType = {
    left: number;
    top: number;
    width: number;
    height: number;
}

type ReactDraggableCallbackData = {
    node: HTMLElement;
    x?: number;
    y?: number;
    deltaX: number;
    deltaY: number;
    lastX?: number;
    lastY?: number;
};

type PartialPosition = {
    left: number;
    top: number;
};

type DroppingPosition = {
    x: number;
    y: number;
    e?: Event;
};

type Size = {
    width: number;
    height: number;
};

type GridDragEvent = {
    e: Event;
    node?: HTMLElement | null;
    newPosition?: PartialPosition;
};

interface ContainerSettings {
    margin: [number, number];
    containerPadding: [number, number] | null;
    rowHeight: number;
    cols: number;
    width: number;
}

type GridResizeEvent = {
    e: Event;
    node: HTMLElement;
    size: Size;
};

type DragOverEvent = MouseEvent & {
    nativeEvent: {
        layerX: number;
        layerY: number;
        target: {
            className: String;
        };
    };
};

    type REl = React.ReactElement<any>;
type ReactChildren = React.ReactNode;

// All callbacks are of the signature (layout, oldItem, newItem, placeholder, e).
type EventCallback = (
    a: Layout,
    oldItem: LayoutItem | null | undefined,
    newItem: LayoutItem | null | undefined,
    placeholder: LayoutItem | null | undefined,
    b: Event,
    c: HTMLElement | null | undefined
) => undefined;

type CompactType = 'horizontal' | 'vertical' | null | undefined;
