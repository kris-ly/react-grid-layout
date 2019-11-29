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
var ReactDOM = require("react-dom");
/*
 * A simple HOC that provides facility for listening to container resizes.
 */
function WidthProvider(ComposedComponent) {
    var _a;
    return _a = /** @class */ (function (_super) {
            __extends(WidthProviderElement, _super);
            function WidthProviderElement() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    width: 1280,
                };
                _this.mounted = false;
                _this.onWindowResize = function () {
                    if (!_this.mounted)
                        return;
                    // eslint-disable-next-line react/no-find-dom-node
                    var node = ReactDOM.findDOMNode(_this); // Flow casts this to Text | Element
                    if (node instanceof HTMLElement) {
                        _this.setState({ width: node.offsetWidth });
                    }
                };
                return _this;
            }
            WidthProviderElement.prototype.componentDidMount = function () {
                this.mounted = true;
                window.addEventListener('resize', this.onWindowResize);
                // Call to properly set the breakpoint and resize the elements.
                // Note that if you're doing a full-width element, this can get a little wonky if a scrollbar
                // appears because of the grid. In that case, fire your own resize event, or set `overflow: scroll` on your body.
                this.onWindowResize();
            };
            WidthProviderElement.prototype.componentWillUnmount = function () {
                this.mounted = false;
                window.removeEventListener('resize', this.onWindowResize);
            };
            WidthProviderElement.prototype.render = function () {
                var _a = this.props, measureBeforeMount = _a.measureBeforeMount, rest = __rest(_a, ["measureBeforeMount"]);
                if (measureBeforeMount && !this.mounted) {
                    return (React.createElement("div", { className: this.props.className, style: this.props.style }));
                }
                return (React.createElement(ComposedComponent, __assign({}, rest, this.state)));
            };
            return WidthProviderElement;
        }(React.Component)),
        _a.defaultProps = {
            measureBeforeMount: false,
        },
        _a.propTypes = {
            // If true, will not render children until mounted. Useful for getting the exact width before
            // rendering, to prevent any unsightly resizing.
            measureBeforeMount: PropTypes.bool,
        },
        _a;
}
exports.default = WidthProvider;
//# sourceMappingURL=WidthProvider.js.map