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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var PropTypes = require("prop-types");
var react_draggable_1 = require("react-draggable");
var react_resizable_1 = require("react-resizable");
var classnames_1 = require("classnames");
var utils_1 = require("./utils");
/**
 * An individual item within a ReactGridLayout.
 */
var GridItem = /** @class */ (function (_super) {
    __extends(GridItem, _super);
    function GridItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            resizing: null,
            dragging: null,
            className: '',
        };
        _this.currentNode = null;
        /**
       * onDragStart event handler
       * @param  {Event}  e             event data
       * @param  {Object} callbackData  an object with node, delta and position information
       */
        _this.onDragStart = function (e, _a) {
            var node = _a.node;
            if (!_this.props.onDragStart)
                return;
            var newPosition = { top: 0, left: 0 };
            // TODO: this wont work on nested parents
            var offsetParent = node.offsetParent;
            if (!offsetParent)
                return;
            var parentRect = offsetParent.getBoundingClientRect();
            var clientRect = node.getBoundingClientRect();
            var cLeft = clientRect.left / _this.props.transformScale;
            var pLeft = parentRect.left / _this.props.transformScale;
            var cTop = clientRect.top / _this.props.transformScale;
            var pTop = parentRect.top / _this.props.transformScale;
            newPosition.left = cLeft - pLeft + offsetParent.scrollLeft;
            newPosition.top = cTop - pTop + offsetParent.scrollTop;
            _this.setState({ dragging: newPosition });
            var _b = _this.calcXY(newPosition.top, newPosition.left), x = _b.x, y = _b.y;
            return (_this.props.onDragStart
                && _this.props.onDragStart.call(_this, _this.props.i, x, y, {
                    e: e,
                    node: node,
                    newPosition: newPosition,
                }));
        };
        /**
       * onDrag event handler
       * @param  {Event}  e             event data
       * @param  {Object} callbackData  an object with node, delta and position information
       */
        _this.onDrag = function (e, _a) {
            var node = _a.node, deltaX = _a.deltaX, deltaY = _a.deltaY;
            if (!_this.props.onDrag)
                return;
            var newPosition = { top: 0, left: 0 };
            if (!_this.state.dragging) {
                throw new Error('onDrag called before onDragStart.');
            }
            newPosition.left = _this.state.dragging.left + deltaX;
            newPosition.top = _this.state.dragging.top + deltaY;
            _this.setState({ dragging: newPosition });
            var _b = _this.calcXY(newPosition.top, newPosition.left), x = _b.x, y = _b.y;
            return (_this.props.onDrag
                && _this.props.onDrag.call(_this, _this.props.i, x, y, {
                    e: e,
                    node: node,
                    newPosition: newPosition,
                }));
        };
        /**
       * onDragStop event handler
       * @param  {Event}  e             event data
       * @param  {Object} callbackData  an object with node, delta and position information
       */
        _this.onDragStop = function (e, _a) {
            var node = _a.node;
            if (!_this.props.onDragStop)
                return;
            var newPosition = { top: 0, left: 0 };
            if (!_this.state.dragging) {
                throw new Error('onDragEnd called before onDragStart.');
            }
            newPosition.left = _this.state.dragging.left;
            newPosition.top = _this.state.dragging.top;
            _this.setState({ dragging: null });
            var _b = _this.calcXY(newPosition.top, newPosition.left), x = _b.x, y = _b.y;
            return (_this.props.onDragStop
                && _this.props.onDragStop.call(_this, _this.props.i, x, y, {
                    e: e,
                    node: node,
                    newPosition: newPosition,
                }));
        };
        /**
       * onResizeStop event handler
       * @param  {Event}  e             event data
       * @param  {Object} callbackData  an object with node and size information
       */
        _this.onResizeStop = function (e, callbackData) {
            _this.onResizeHandler(e, callbackData, 'onResizeStop');
        };
        /**
       * onResizeStart event handler
       * @param  {Event}  e             event data
       * @param  {Object} callbackData  an object with node and size information
       */
        _this.onResizeStart = function (e, callbackData) {
            _this.onResizeHandler(e, callbackData, 'onResizeStart');
        };
        /**
       * onResize event handler
       * @param  {Event}  e             event data
       * @param  {Object} callbackData  an object with node and size information
       */
        _this.onResize = function (e, callbackData) {
            _this.onResizeHandler(e, callbackData, 'onResize');
        };
        return _this;
    }
    GridItem.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.droppingPosition && prevProps.droppingPosition) {
            this.moveDroppingItem(prevProps);
        }
    };
    GridItem.prototype.moveDroppingItem = function (prevProps) {
        var droppingPosition = this.props.droppingPosition;
        var dragging = this.state.dragging;
        if (!droppingPosition || !prevProps.droppingPosition) {
            return;
        }
        if (!this.currentNode) {
            // eslint-disable-next-line react/no-find-dom-node
            this.currentNode = ReactDOM.findDOMNode(this);
        }
        var shouldDrag = (dragging && droppingPosition.x !== prevProps.droppingPosition.x)
            || droppingPosition.y !== prevProps.droppingPosition.y;
        if (!dragging) {
            this.onDragStart(droppingPosition.e, {
                node: this.currentNode,
                deltaX: droppingPosition.x,
                deltaY: droppingPosition.y,
            });
        }
        else if (shouldDrag) {
            var deltaX = droppingPosition.x - dragging.left;
            var deltaY = droppingPosition.y - dragging.top;
            this.onDrag(droppingPosition.e, {
                node: this.currentNode,
                deltaX: deltaX,
                deltaY: deltaY,
            });
        }
    };
    // Helper for generating column width
    GridItem.prototype.calcColWidth = function () {
        var _a = this.props, margin = _a.margin, containerPadding = _a.containerPadding, containerWidth = _a.containerWidth, cols = _a.cols;
        return ((containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols);
    };
    /**
   * Return position on the page given an x, y, w, h.
   * left, top, width, height are all in pixels.
   * @param  {Number}  x             X coordinate in grid units.
   * @param  {Number}  y             Y coordinate in grid units.
   * @param  {Number}  w             W coordinate in grid units.
   * @param  {Number}  h             H coordinate in grid units.
   * @return {Object}                Object containing coords.
   */
    GridItem.prototype.calcPosition = function (x, y, w, h, state) {
        var _a = this.props, margin = _a.margin, containerPadding = _a.containerPadding, rowHeight = _a.rowHeight;
        var colWidth = this.calcColWidth();
        var out = {};
        // If resizing, use the exact width and height as returned from resizing callbacks.
        if (state && state.resizing) {
            out.width = Math.round(state.resizing.width);
            out.height = Math.round(state.resizing.height);
        }
        // Otherwise, calculate from grid units.
        else {
            // 0 * Infinity === NaN, which causes problems with resize constraints;
            // Fix this if it occurs.
            // Note we do it here rather than later because Math.round(Infinity) causes deopt
            out.width = w === Infinity
                ? w
                : Math.round(colWidth * w + Math.max(0, w - 1) * margin[0]);
            out.height = h === Infinity
                ? h
                : Math.round(rowHeight * h + Math.max(0, h - 1) * margin[1]);
        }
        // If dragging, use the exact width and height as returned from dragging callbacks.
        if (state && state.dragging) {
            out.top = Math.round(state.dragging.top);
            out.left = Math.round(state.dragging.left);
        }
        // Otherwise, calculate from grid units.
        else {
            out.top = Math.round((rowHeight + margin[1]) * y + containerPadding[1]);
            out.left = Math.round((colWidth + margin[0]) * x + containerPadding[0]);
        }
        return out;
    };
    /**
   * Translate x and y coordinates from pixels to grid units.
   * @param  {Number} top  Top position (relative to parent) in pixels.
   * @param  {Number} left Left position (relative to parent) in pixels.
   * @return {Object} x and y in grid units.
   */
    GridItem.prototype.calcXY = function (top, left) {
        var _a = this.props, margin = _a.margin, cols = _a.cols, rowHeight = _a.rowHeight, w = _a.w, h = _a.h, maxRows = _a.maxRows;
        var colWidth = this.calcColWidth();
        // left = colWidth * x + margin * (x + 1)
        // l = cx + m(x+1)
        // l = cx + mx + m
        // l - m = cx + mx
        // l - m = x(c + m)
        // (l - m) / (c + m) = x
        // x = (left - margin) / (coldWidth + margin)
        var x = Math.round((left - margin[0]) / (colWidth + margin[0]));
        var y = Math.round((top - margin[1]) / (rowHeight + margin[1]));
        // Capping
        x = Math.max(Math.min(x, cols - w), 0);
        y = Math.max(Math.min(y, maxRows - h), 0);
        return { x: x, y: y };
    };
    /**
   * Given a height and width in pixel values, calculate grid units.
   * @param  {Number} height Height in pixels.
   * @param  {Number} width  Width in pixels.
   * @return {Object} w, h as grid units.
   */
    GridItem.prototype.calcWH = function (_a) {
        var height = _a.height, width = _a.width;
        var _b = this.props, margin = _b.margin, maxRows = _b.maxRows, cols = _b.cols, rowHeight = _b.rowHeight, x = _b.x, y = _b.y;
        var colWidth = this.calcColWidth();
        // width = colWidth * w - (margin * (w - 1))
        // ...
        // w = (width + margin) / (colWidth + margin)
        var w = Math.round((width + margin[0]) / (colWidth + margin[0]));
        var h = Math.round((height + margin[1]) / (rowHeight + margin[1]));
        // Capping
        w = Math.max(Math.min(w, cols - x), 0);
        h = Math.max(Math.min(h, maxRows - y), 0);
        return { w: w, h: h };
    };
    /**
   * This is where we set the grid item's absolute placement. It gets a little tricky because we want to do it
   * well when server rendering, and the only way to do that properly is to use percentage width/left because
   * we don't know exactly what the browser viewport is.
   * Unfortunately, CSS Transforms, which are great for performance, break in this instance because a percentage
   * left is relative to the item itself, not its container! So we cannot use them on the server rendering pass.
   *
   * @param  {Object} pos Position object with width, height, left, top.
   * @return {Object}     Style object.
   */
    GridItem.prototype.createStyle = function (pos) {
        var _a = this.props, usePercentages = _a.usePercentages, containerWidth = _a.containerWidth, useCSSTransforms = _a.useCSSTransforms;
        var style;
        // CSS Transforms support (default)
        if (useCSSTransforms) {
            style = utils_1.setTransform(pos);
        }
        else {
            // top,left (slow)
            style = utils_1.setTopLeft(pos);
            // This is used for server rendering.
            if (usePercentages) {
                style.left = utils_1.perc(pos.left / containerWidth);
                style.width = utils_1.perc(pos.width / containerWidth);
            }
        }
        return style;
    };
    /**
   * Mix a Draggable instance into a child.
   * @param  {Element} child    Child element.
   * @return {Element}          Child wrapped in Draggable.
   */
    GridItem.prototype.mixinDraggable = function (child) {
        return (
        // @ts-ignore
        React.createElement(react_draggable_1.DraggableCore, { onStart: this.onDragStart, onDrag: this.onDrag, onStop: this.onDragStop, handle: this.props.handle, cancel: ".react-resizable-handle" + (this.props.cancel ? "," + this.props.cancel : '') }, child));
    };
    /**
   * Mix a Resizable instance into a child.
   * @param  {Element} child    Child element.
   * @param  {Object} position  Position object (pixel values)
   * @return {Element}          Child wrapped in Resizable.
   */
    GridItem.prototype.mixinResizable = function (child, position) {
        var _a = this.props, cols = _a.cols, x = _a.x, minW = _a.minW, minH = _a.minH, maxW = _a.maxW, maxH = _a.maxH;
        // This is the max possible width - doesn't go to infinity because of the width of the window
        var maxWidth = this.calcPosition(0, 0, cols - x, 0).width;
        // Calculate min/max constraints using our min & maxes
        var mins = this.calcPosition(0, 0, minW, minH);
        var maxes = this.calcPosition(0, 0, maxW, maxH);
        var minConstraints = [mins.width, mins.height];
        var maxConstraints = [
            Math.min(maxes.width, maxWidth),
            Math.min(maxes.height, Infinity),
        ];
        return (React.createElement(react_resizable_1.Resizable, { width: position.width, height: position.height, minConstraints: minConstraints, maxConstraints: maxConstraints, onResizeStop: this.onResizeStop, onResizeStart: this.onResizeStart, onResize: this.onResize }, child));
    };
    /**
   * Wrapper around drag events to provide more useful data.
   * All drag events call the function with the given handler name,
   * with the signature (index, x, y).
   *
   * @param  {String} handlerName Handler name to wrap.
   * @return {Function}           Handler function.
   */
    GridItem.prototype.onResizeHandler = function (e, _a, handlerName) {
        var node = _a.node, size = _a.size;
        var handler = this.props[handlerName];
        if (!handler)
            return;
        var _b = this.props, cols = _b.cols, x = _b.x, i = _b.i, maxW = _b.maxW, minW = _b.minW, maxH = _b.maxH, minH = _b.minH;
        // Get new XY
        var _c = this.calcWH(size), w = _c.w, h = _c.h;
        // Cap w at numCols
        w = Math.min(w, cols - x);
        // Ensure w is at least 1
        w = Math.max(w, 1);
        // Min/max capping
        w = Math.max(Math.min(w, maxW), minW);
        h = Math.max(Math.min(h, maxH), minH);
        this.setState({ resizing: handlerName === 'onResizeStop' ? null : size });
        handler.call(this, i, w, h, { e: e, node: node, size: size });
    };
    GridItem.prototype.render = function () {
        var _a = this.props, x = _a.x, y = _a.y, w = _a.w, h = _a.h, isDraggable = _a.isDraggable, isResizable = _a.isResizable, droppingPosition = _a.droppingPosition, useCSSTransforms = _a.useCSSTransforms;
        var pos = this.calcPosition(x, y, w, h, this.state);
        var child = React.Children.only(this.props.children);
        // Create the child element. We clone the existing element but modify its className and style.
        var newChild = React.cloneElement(child, {
            className: classnames_1.default('react-grid-item', child.props.className, this.props.className, {
                static: this.props.static,
                resizing: Boolean(this.state.resizing),
                'react-draggable': isDraggable,
                'react-draggable-dragging': Boolean(this.state.dragging),
                dropping: Boolean(droppingPosition),
                cssTransforms: useCSSTransforms,
            }),
            // We can set the width and height on the child, but unfortunately we can't set the position.
            style: __assign(__assign(__assign({}, this.props.style), child.props.style), this.createStyle(pos)),
        });
        // Resizable support. This is usually on but the user can toggle it off.
        if (isResizable)
            newChild = this.mixinResizable(newChild, pos);
        // Draggable support. This is always on, except for with placeholders.
        if (isDraggable)
            newChild = this.mixinDraggable(newChild);
        return newChild;
    };
    GridItem.propTypes = {
        // Children must be only a single element
        children: PropTypes.element,
        // General grid attributes
        cols: PropTypes.number.isRequired,
        containerWidth: PropTypes.number.isRequired,
        rowHeight: PropTypes.number.isRequired,
        margin: PropTypes.array.isRequired,
        maxRows: PropTypes.number.isRequired,
        containerPadding: PropTypes.array.isRequired,
        // These are all in grid units
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
        // All optional
        minW: function (props, propName) {
            var value = props[propName];
            if (typeof value !== 'number')
                return new Error('minWidth not Number');
            if (value > props.w || value > props.maxW) {
                return new Error('minWidth larger than item width/maxWidth');
            }
        },
        maxW: function (props, propName) {
            var value = props[propName];
            if (typeof value !== 'number')
                return new Error('maxWidth not Number');
            if (value < props.w || value < props.minW) {
                return new Error('maxWidth smaller than item width/minWidth');
            }
        },
        minH: function (props, propName) {
            var value = props[propName];
            if (typeof value !== 'number')
                return new Error('minHeight not Number');
            if (value > props.h || value > props.maxH) {
                return new Error('minHeight larger than item height/maxHeight');
            }
        },
        maxH: function (props, propName) {
            var value = props[propName];
            if (typeof value !== 'number')
                return new Error('maxHeight not Number');
            if (value < props.h || value < props.minH) {
                return new Error('maxHeight smaller than item height/minHeight');
            }
        },
        // ID is nice to have for callbacks
        i: PropTypes.string.isRequired,
        // Functions
        onDragStop: PropTypes.func,
        onDragStart: PropTypes.func,
        onDrag: PropTypes.func,
        onResizeStop: PropTypes.func,
        onResizeStart: PropTypes.func,
        onResize: PropTypes.func,
        // Flags
        isDraggable: PropTypes.bool.isRequired,
        isResizable: PropTypes.bool.isRequired,
        static: PropTypes.bool,
        // Use CSS transforms instead of top/left
        useCSSTransforms: PropTypes.bool.isRequired,
        transformScale: PropTypes.number,
        // Others
        className: PropTypes.string,
        // Selector for draggable handle
        handle: PropTypes.string,
        // Selector for draggable cancel (see react-draggable)
        cancel: PropTypes.string,
        // Current position of a dropping element
        droppingPosition: PropTypes.shape({
            e: PropTypes.object.isRequired,
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
        }),
    };
    GridItem.defaultProps = {
        className: '',
        cancel: '',
        handle: '',
        minH: 1,
        minW: 1,
        maxH: Infinity,
        maxW: Infinity,
        transformScale: 1,
    };
    return GridItem;
}(React.Component));
exports.default = GridItem;
//# sourceMappingURL=GridItem.js.map