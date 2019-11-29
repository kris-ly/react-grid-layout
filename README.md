# 基于react的拖拽布局实现方案
基于react-grid-layout扩展实现，效果如下：

![拖拽效果](https://km.sankuai.com/api/file/cdn/212656993/212752555?contentType=1&isNewContent=false&isNewContent=false)

## 一、介绍
### 1.整体结构
布局结构包含容器和元素，容器即可拖拽区域，元素可在容器内随意拖动。

现状：

- 元素与容器强绑定，在容器中通过transform或者position（left&top）在指定位置摆放。

- 容器与容器之间相互隔离，不支持跨容器拖拽。

### 2.输入输出

layout信息包含所有元素的布局信息，比如：

代码块
```JavaScript
var layout = [
  {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
  {i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
  {i: 'c', x: 4, y: 0, w: 1, h: 2}
];
```
layout作为React的state，与最终布局一一对应。

### 3.基本功能：
- 元素可拖动、可调整大小，可添加或删除、可设置最大最小宽度。

- 可配置挤压方式：水平，垂直或不固定

- 拖动和调整大小时进行边界检查

- 响应式布局

## 使用方法
基本用法：
```JavaScript
import * as React from 'react';
import * as RED from '@dfe/react-easy-drag';

const WidthProvider = RED.WidthProvider;
const ReactGridLayout = WidthProvider(RED);

const layout = [
  {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
  {i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
  {i: 'c', x: 4, y: 0, w: 1, h: 2}
];

export default class BasicLayout extends React.PureComponent {
		render() {
			return (
				<ReactGridLayout
                    layout={layout}
                    dragEnterChild={dragEnterChild}
                    droppingItem={{ w: 2, h: 4, i: '21' }}
                    style={{ border: '1px solid #333' }}
                    draggableHandle=".drag-layout-handle-area"
                    onLayoutChange={this.onLayoutChange}
                    isDroppable
                    {...this.props}
                >
                    {layout.map((item, i) => (
	                    <div key={i}>
			                <div className="drag-layout-handle-area">drag</div>
			                <span className="text">{i}</span>
			            </div>
                    ))}
                </ReactGridLayout>
			)
		}
}
```
ReactGridLayout有以下几个属性：
- WidthProvider：包裹RED的元素，使其具备基本拖拽属性


更多例子见test/examples

### api
ReactGridLayout的Props
```javascript
//
// Basic props
//

// This allows setting the initial width on the server side.
// This is required unless using the HOC <WidthProvider> or similar
width: number,

// If true, the container height swells and contracts to fit contents
autoSize: ?boolean = true,

// Number of columns in this layout.
cols: ?number = 12,

// A CSS selector for tags that will not be draggable.
// For example: draggableCancel:'.MyNonDraggableAreaClassName'
// If you forget the leading . it will not work.
draggableCancel: ?string = '',

// A CSS selector for tags that will act as the draggable handle.
// For example: draggableHandle:'.MyDragHandleClassName'
// If you forget the leading . it will not work.
draggableHandle: ?string = '',

// If true, the layout will compact vertically
verticalCompact: ?boolean = true,

// Compaction type.
compactType: ?('vertical' | 'horizontal') = 'vertical';

// Layout is an array of object with the format:
// {x: number, y: number, w: number, h: number}
// The index into the layout must match the key used on each item component.
// If you choose to use custom keys, you can specify that key in the layout
// array objects like so:
// {i: string, x: number, y: number, w: number, h: number}
layout: ?array = null, // If not provided, use data-grid props on children

// Margin between items [x, y] in px.
margin: ?[number, number] = [10, 10],

// Padding inside the container [x, y] in px
containerPadding: ?[number, number] = margin,

// Rows have a static height, but you can change this based on breakpoints
// if you like.
rowHeight: ?number = 150,

// Configuration of a dropping element. Dropping element is a "virtual" element
// which appears when you drag over some element from outside.
// It can be changed by passing specific parameters:
//  i - id of an element
//  w - width of an element
//  h - height of an element
droppingItem?: { i: string, w: number, h: number }

//
// Flags
//
isDraggable: ?boolean = true,
isResizable: ?boolean = true,
// Uses CSS3 translate() instead of position top/left.
// This makes about 6x faster paint performance
useCSSTransforms: ?boolean = true,
// If parent DOM node of ResponsiveReactGridLayout or ReactGridLayout has "transform: scale(n)" css property,
// we should set scale coefficient to avoid render artefacts while dragging.
transformScale: ?number = 1,

// If true, grid items won't change position when being
// dragged over.
preventCollision: ?boolean = false;

// If true, droppable elements (with `draggable={true}` attribute)
// can be dropped on the grid. It triggers "onDrop" callback
// with position and event object as parameters.
// It can be useful for dropping an element in a specific position
//
// NOTE: In case of using Firefox you should add
// `onDragStart={e => e.dataTransfer.setData('text/plain', '')}` attribute
// along with `draggable={true}` otherwise this feature will work incorrect.
// onDragStart attribute is required for Firefox for a dragging initialization
// @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
isDroppable: ?boolean = false

//
// Callbacks
//

// Callback so you can save the layout.
// Calls back with (currentLayout) after every drag or resize stop.
onLayoutChange: (layout: Layout) => void,

//
// All callbacks below have signature (layout, oldItem, newItem, placeholder, e, element).
// 'start' and 'stop' callbacks pass `undefined` for 'placeholder'.
//
type ItemCallback = (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem,
                     placeholder: LayoutItem, e: MouseEvent, element: HTMLElement) => void;

// Calls when drag starts.
onDragStart: ItemCallback,
// Calls on each drag movement.
onDrag: ItemCallback,
// Calls when drag is complete.
onDragStop: ItemCallback,
// Calls when resize starts.
onResizeStart: ItemCallback,
// Calls when resize movement happens.
onResize: ItemCallback,
// Calls when resize is complete.
onResizeStop: ItemCallback,
// Calls when some element has been dropped
onDrop: (elemParams: { x: number, y: number, e: Event }) => void
```

## 二、基本逻辑
拖拽实现基于react-draggable，RGL加入碰撞解决和Grid布局。

### 1.布局逻辑
具体布局逻辑如下：

1. 初始化配置，包括组件的外边距（margin)、内边距（containerPadding）、布局的列数（cols）等；

2. 加载布局信息，所有布局元素会根据RGL的5个参数进行布局（x,y,w,h,i）；

3. correctBounds，遍历所有布局信息，规范化所有值，对不合法的值进行纠错式赋值，使其合法；

4. compactLayout，按挤压方式（compactType）布局元素，避免碰撞，完成布局；

**重要概念**

compactType——挤压方式。可以使布局更加紧凑，类似于有重力感应的效果，可取值：horizontal与vertical

**碰撞解决**

基本思路：拖拽时，遍历每个元素，找出重叠的元素集。每个重叠元素采用步增式移动解决重叠，移动过程又迭代解决新的重叠，直到没有重叠现象。

![enter image description here](https://km.sankuai.com/api/file/cdn/212656993/212667981?contentType=1&isNewContent=false&isNewContent=false)
### 3.拖拽逻辑
react-draggable不是借助html5的拖拽，而是通过监听鼠标事件实时改变元素的位置，相当于自己实现了拖拽。

这样做的好处是：可以自定义拖拽行为，实现碰撞检查、限制最大宽高、水平垂直拖拽以及步增式拖拽等。

## 三、未来功能支持
### 1.容器外部拖入新的元素
对于新拖入组件
当拖入布局区域时，设置好初始的placeholder的宽高，在drop的时候，更新layout信息，在指定位置渲染新的组件。
对于已布局组件拖入新的容器
比如将外层容器的组件拖入一个tab容器，相当于跨容器拖拽。

### 2.跨容器拖拽
由此前介绍可知：

元素与容器强绑定，容器与容器之间相互隔离

目前RGL自己实现了内部元素的拖拽，容器做元素的拖拽也做了边界检查，不允许拖出容器。要实现跨容器拖拽，相当于打破次元壁，需要对RGl的拖拽逻辑进行大改造。

初步设想：

首先去掉容器的边界检查，定义一个拖出的触发规则和事件，需用户自己实现回调

在拖出时，构造一个虚拟的拖动元素（可行性？）进入新的容器时，触发新拖入组件的逻辑

### 3.自适应布局
不用设置元素的初始宽高，根据元素内容的大小自适应布局，相当于现在拖入筛选器的逻辑。

设计对RGL整个布局逻辑的重构，改动较大，因为目前RGL中的元素有初始的尺寸和位置信息， 根据这些信息在容器中通过transform或者position布局。

按照目前RGL的架构，自适应布局不设置元素的初始宽高，根据元素内容进行渲染后，再解决碰撞问题，相当于实现一遍浏览器的渲染过程。

还不如重写一个拖拽布局逻辑，投入产出有待考量。