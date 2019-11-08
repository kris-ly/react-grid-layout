/**
 * 后端查询接口返回数据
 *
*/
namespace GridLayout {
    export interface Breakpoints {
        lg?: number;
        md?: number;
        sm?: number;
        xs?: number;
        xxs?: number;
    }
    export interface ResponsiveLayout {
        lg?: Layout;
        md?: Layout;
        sm?: Layout;
        xs?: Layout;
        xxs?: Layout;
    }
}
