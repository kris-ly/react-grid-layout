declare module '*.css' {
    const content: any;
    // eslint-disable-next-line
    export default content;
}

declare module '*.less' {
    const content: any;
    // eslint-disable-next-line
    export default content;
}

declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'


declare module '@dfe/react-easy-drag' {
    const RED: any;
    // eslint-disable-next-line
    export default RED;
}

interface CommonElement {
    styleName?: string;
    [propName: string]: any;
}

declare namespace JSX {
    interface IntrinsicElements {
        // 给div元素增加styleName属性，为了兼容 react-css-modules 库
        div: CommonElement;
        ul: CommonElement;
        li: CommonElement;
        p: CommonElement;
        span: CommonElement;
        [elemName: string]: any;
    }
}

interface Window {
    [propName: string]: any;
}
