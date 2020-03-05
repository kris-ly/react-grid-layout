# 基于react的拖拽布局实现方案
基于react-grid-layout扩展实现，效果如下：

![拖拽效果](https://km.sankuai.com/api/file/cdn/212656993/212752555?contentType=1&isNewContent=false&isNewContent=false)

## 一、介绍
### 1.整体结构
布局结构包含容器和元素，容器即可拖拽区域，元素可在容器内随意拖动。

现状：

- 元素与容器强绑定，在容器中通过transform或者position（left&top）在指定位置摆放。

- 支持从外部拖入组件

- 支持跨容器间拖拽（ResponsiveReactGridLayout 还未支持）

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
- WidthProvider：包裹RED的元素，使其具备基本容器属性（width等）


更多例子见 test/examples

### api
ReactGridLayout的Props
```javascript
//
// 基本props
//

className?: string,

style?: object,
// 可以在服务器端设置初始宽度。
// 必需的props，除非使用HOC <WidthProvider>或类似的方法
width: number,

// 如果为true，则容器高度将自动膨胀或者收缩以适合内容物
autoSize?: boolean = true,

// 此布局中的列数。
cols?: number = 12,

// 不可拖动标签的CSS选择器。
// 例如：draggableCancel：'.MyNonDraggableAreaClassName'
draggableCancel?: string = '',

// CSS标签选择器，将其用作可拖动的句柄。
// 例如：draggableHandle：'.MyDragHandleClassName'
draggableHandle?: string = '',

// 标志当前 grid container，跨容器拖拽时需要
rglKey?: string,

// 如果为true，则布局将垂直压缩（Deprecated）
verticalCompact?: boolean = true,

// 压缩类型：垂直或者水平.
compactType?: ('vertical' | 'horizontal') = 'vertical';

// Layout是一个对象数组，其格式为：
// {x: number，y: number，w: number，h: number}
// 布局的索引必须与每个项目组件上使用的key匹配。
// 如果您选择使用自定义key，则可以在布局中指定该key
// 数组对象如下：
// {i：string，x: number，y: number，w: number，h: number}
layout?: array = null, //如果未提供，请在子级上添加 data-grid 的 props

// item[x，y]之间的 margin，以 px 为单位。
margin?: [number, number] = [10, 10],

// 单位在容器[x，y]内的 padding，以 px 为单位。
containerPadding?: [number, number] = margin,

// 行具有固定高度，但是您可以根据断点更改此高度
rowHeight?: number = 150,

maxRows?: number,
// 从外部拖入元素的配置。 拖入元素是“虚拟”的
// 当从外部拖动某些元素时显示可以通过传递特定参数来更改它：
// i-元素的ID
// w-元素的宽度
// h-元素的高度
droppingItem?: { i: string, w: number, h: number }

//
// 标志
//
isDraggable?: boolean = true,
isResizable?: boolean = true,

// 使用CSS3 translate（）代替 left/top 定位
// 这样可使 paint 性能提高约6倍
useCSSTransforms?: boolean = true,

// 如果ResponsiveReactGridLayout或ReactGridLayout的父DOM节点具有“ transform: scale(n)” css属性，
// 我们应该设置比例系数，以避免在拖动时渲染假象。
transformScale?: number = 1,

// 如果为true，则有其他 item 拖到上方时不会更改自身位置。
preventCollision?: boolean = false;

//如果为true，则可以将可放置元素（具有`draggable = {true}`属性）放置在网格上。 它使用位置和事件对象作为参数触发“ onDrop”回调。 将元素放置在特定位置时很有用
//注意：如果使用的是Firefox，则应添加`onDragStart = {e => e.dataTransfer.setData（'text / plain'，''）}）属性和`draggable = {true}`，否则此功能将工作不正确。 Firefox需要onDragStart属性才能进行拖动初始化@see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
isDroppable?: boolean = false

// 是否允许跨容器拖拽
allowCrossGridDrag?: boolean = false
//
// 回调函数
//

// 该回调方便保存布局。
// 每次停止拖动或调整大小后，使用（currentLayout）进行回调。
onLayoutChange: (layout: Layout) => void,

// 下面的所有回调都具有相同的参数 (layout, oldItem, newItem, placeholder, e, element)。
// 'start'和'stop'回调传递给'placeholder'的'undefined'。
type ItemCallback = (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem,
                     placeholder: LayoutItem, e: MouseEvent, element: HTMLElement) => void;

// 拖动开始时调用。
onDragStart: ItemCallback,

// 调用每个拖动动作。
onDrag: ItemCallback,

// 拖动完成后调用。
onDragStop: ItemCallback,

//在调整大小开始时调用。
onResizeStart: ItemCallback,

//发生尺寸调整时调用。
onResize: ItemCallback,

//调整大小后调用。
onResizeStop: ItemCallback,

// 拖入某个元素时调用
onDrop: PropTypes.func,

// 拖入的元素进入时
onDragNewItemEnter: PropTypes.func,

// 拖入的元素离开时
onDragNewItemLeave: PropTypes.func,

// 其他grid容器拖入了元素（跨容器拖拽）
onOtherItemIn: PropTypes.func,

// 其他grid容器拖入的元素并放置（跨容器拖拽）
onOtherItemDrop: PropTypes.func,

// 其他grid容器拖入的元素又离开（跨容器拖拽）
onItemDropOut: PropTypes.func,

// 拖入的元素进入了子 gird 容器（父子容器嵌套）
dragEnterChild: PropTypes.bool,
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
