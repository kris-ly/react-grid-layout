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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var PropTypes = require("prop-types");
var lodash_isequal_1 = require("lodash.isequal");
var utils_1 = require("./utils");
var responsiveUtils_1 = require("./responsiveUtils");
var ReactGridLayout_1 = require("./ReactGridLayout");
var type = function (obj) { return Object.prototype.toString.call(obj); };
/**
 * Get a value of margin or containerPadding.
 *
 * @param  {Array | Object} param Margin | containerPadding, e.g. [10, 10] | {lg: [10, 10], ...}.
 * @param  {String} breakpoint   Breakpoint: lg, md, sm, xs and etc.
 * @return {Array}
 */
function getIndentationValue(param, breakpoint) {
    return Array.isArray(param) ? param : param[breakpoint];
}
var ResponsiveReactGridLayout = /** @class */ (function (_super) {
    __extends(ResponsiveReactGridLayout, _super);
    function ResponsiveReactGridLayout() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = _this.generateInitialState();
        // wrap layouts so we do not need to pass layouts to child
        _this.onLayoutChange = function (layout) {
            var _a;
            _this.props.onLayoutChange(layout, __assign(__assign({}, _this.props.layouts), (_a = {}, _a[_this.state.breakpoint] = layout, _a)));
        };
        return _this;
    }
    ResponsiveReactGridLayout.prototype.generateInitialState = function () {
        var _a = this.props, width = _a.width, breakpoints = _a.breakpoints, layouts = _a.layouts, cols = _a.cols;
        var breakpoint = responsiveUtils_1.getBreakpointFromWidth(breakpoints, width);
        var colNo = responsiveUtils_1.getColsFromBreakpoint(breakpoint, cols);
        // verticalCompact compatibility, now deprecated
        var compactType = this.props.verticalCompact === false ? null : this.props.compactType;
        // Get the initial layout. This can tricky; we try to generate one however possible if one doesn't exist
        // for this layout.
        var initialLayout = responsiveUtils_1.findOrGenerateResponsiveLayout(layouts, breakpoints, breakpoint, breakpoint, colNo, compactType);
        return {
            layout: initialLayout,
            breakpoint: breakpoint,
            cols: colNo,
        };
    };
    ResponsiveReactGridLayout.getDerivedStateFromProps = function (nextProps, prevState) {
        if (!lodash_isequal_1.default(nextProps.layouts, prevState.layouts)) {
            // Allow parent to set layouts directly.
            var breakpoint = prevState.breakpoint, cols = prevState.cols;
            // Since we're setting an entirely new layout object, we must generate a new responsive layout
            // if one does not exist.
            var newLayout = responsiveUtils_1.findOrGenerateResponsiveLayout(nextProps.layouts, nextProps.breakpoints, breakpoint, breakpoint, cols, nextProps.compactType);
            return { layout: newLayout, layouts: nextProps.layouts };
        }
        return null;
    };
    ResponsiveReactGridLayout.prototype.componentDidUpdate = function (prevProps) {
        // Allow parent to set width or breakpoint directly.
        if (this.props.width != prevProps.width
            || this.props.breakpoint !== prevProps.breakpoint
            || !lodash_isequal_1.default(this.props.breakpoints, prevProps.breakpoints)
            || !lodash_isequal_1.default(this.props.cols, prevProps.cols)) {
            this.onWidthChange(this.props);
        }
    };
    /**
   * When the width changes work through breakpoints and reset state with the new width & breakpoint.
   * Width changes are necessary to figure out the widget widths.
   */
    ResponsiveReactGridLayout.prototype.onWidthChange = function (nextProps) {
        var breakpoints = nextProps.breakpoints, cols = nextProps.cols, layouts = nextProps.layouts, compactType = nextProps.compactType;
        var newBreakpoint = nextProps.breakpoint
            || responsiveUtils_1.getBreakpointFromWidth(nextProps.breakpoints, nextProps.width);
        var lastBreakpoint = this.state.breakpoint;
        var newCols = responsiveUtils_1.getColsFromBreakpoint(newBreakpoint, cols);
        // Breakpoint change
        if (lastBreakpoint !== newBreakpoint
            || this.props.breakpoints !== breakpoints
            || this.props.cols !== cols) {
            // Preserve the current layout if the current breakpoint is not present in the next layouts.
            if (!(lastBreakpoint in layouts)) {
                layouts[lastBreakpoint] = utils_1.cloneLayout(this.state.layout);
            }
            // Find or generate a new layout.
            var layout = responsiveUtils_1.findOrGenerateResponsiveLayout(layouts, breakpoints, newBreakpoint, lastBreakpoint, newCols, compactType);
            // This adds missing items.
            layout = utils_1.synchronizeLayoutWithChildren(layout, nextProps.children, newCols, compactType);
            // Store the new layout.
            layouts[newBreakpoint] = layout;
            // callbacks
            this.props.onLayoutChange(layout, layouts);
            this.props.onBreakpointChange(newBreakpoint, newCols);
            this.setState({
                breakpoint: newBreakpoint,
                layout: layout,
                cols: newCols,
            });
        }
        var margin = getIndentationValue(nextProps.margin, newBreakpoint);
        var containerPadding = getIndentationValue(nextProps.containerPadding, newBreakpoint);
        //call onWidthChange on every change of width, not only on breakpoint changes
        this.props.onWidthChange(nextProps.width, margin, newCols, containerPadding);
    };
    ResponsiveReactGridLayout.prototype.render = function () {
        /* eslint-disable no-unused-vars */
        var _a = this.props, breakpoint = _a.breakpoint, breakpoints = _a.breakpoints, cols = _a.cols, layouts = _a.layouts, margin = _a.margin, containerPadding = _a.containerPadding, onBreakpointChange = _a.onBreakpointChange, onLayoutChange = _a.onLayoutChange, onWidthChange = _a.onWidthChange, other = __rest(_a, ["breakpoint", "breakpoints", "cols", "layouts", "margin", "containerPadding", "onBreakpointChange", "onLayoutChange", "onWidthChange"]);
        /* eslint-enable no-unused-vars */
        return (React.createElement(ReactGridLayout_1.default, __assign({}, other, { margin: getIndentationValue(margin, this.state.breakpoint), containerPadding: getIndentationValue(containerPadding, this.state.breakpoint), onLayoutChange: this.onLayoutChange, layout: this.state.layout, cols: this.state.cols })));
    };
    // This should only include propTypes needed in this code; RGL itself
    // will do validation of the rest props passed to it.
    ResponsiveReactGridLayout.propTypes = {
        //
        // Basic props
        //
        // Optional, but if you are managing width yourself you may want to set the breakpoint
        // yourself as well.
        breakpoint: PropTypes.string,
        // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
        breakpoints: PropTypes.object,
        // # of cols. This is a breakpoint -> cols map
        cols: PropTypes.object,
        // # of margin. This is a breakpoint -> margin map
        // e.g. { lg: [5, 5], md: [10, 10], sm: [15, 15] }
        // Margin between items [x, y] in px
        // e.g. [10, 10]
        margin: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
        // # of containerPadding. This is a breakpoint -> containerPadding map
        // e.g. { lg: [5, 5], md: [10, 10], sm: [15, 15] }
        // Padding inside the container [x, y] in px
        // e.g. [10, 10]
        containerPadding: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
        // layouts is an object mapping breakpoints to layouts.
        // e.g. {lg: Layout, md: Layout, ...}
        layouts: function (props, propName) {
            if (type(props[propName]) !== '[object Object]') {
                throw new Error("Layout property must be an object. Received: " + type(props[propName]));
            }
            Object.keys(props[propName]).forEach(function (key) {
                if (!(key in props.breakpoints)) {
                    throw new Error('Each key in layouts must align with a key in breakpoints.');
                }
                utils_1.validateLayout(props.layouts[key], "layouts." + key);
            });
        },
        // The width of this component.
        // Required in this propTypes stanza because generateInitialState() will fail without it.
        width: PropTypes.number.isRequired,
        //
        // Callbacks
        //
        // Calls back with breakpoint and new # cols
        onBreakpointChange: PropTypes.func,
        // Callback so you can save the layout.
        // Calls back with (currentLayout, allLayouts). allLayouts are keyed by breakpoint.
        onLayoutChange: PropTypes.func,
        // Calls back with (containerWidth, margin, cols, containerPadding)
        onWidthChange: PropTypes.func,
    };
    ResponsiveReactGridLayout.defaultProps = {
        breakpoints: {
            lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0,
        },
        cols: {
            lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
        },
        layouts: {},
        margin: [10, 10],
        containerPadding: {
            lg: null, md: null, sm: null, xs: null, xxs: null,
        },
        onBreakpointChange: utils_1.noop,
        onLayoutChange: utils_1.noop,
        onWidthChange: utils_1.noop,
    };
    return ResponsiveReactGridLayout;
}(React.Component));
exports.default = ResponsiveReactGridLayout;
//# sourceMappingURL=ResponsiveReactGridLayout.js.map