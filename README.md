# 基于react的拖拽实现方案

**包含一维布局和二维布局，一维布局基于 sortablejs, 二维布局基于 react-grid-layout。**

一维拖拽效果如下：
![一维拖拽效果](https://km.sankuai.com/api/file/cdn/212526245/329495889?contentType=1&isNewContent=false&isNewContent=false)


二维布局拖拽效果如下：
![二维拖拽效果](https://km.sankuai.com/api/file/cdn/212656993/212752555?contentType=1&isNewContent=false&isNewContent=false)

## 一、一维布局介绍

支持嵌套、扩容器拖拽、拖拽排序以及交换顺序、多选拖拽等功能。支持PC端和移动端

### 基本用法
```JavaScript
import RED from '@dfe/react-easy-drag';

const { DragBox } = RED;
const arr = [1,2,3,4,5,6,7];
export default class DragRow extends React.Component<any, any> {
    render() {
        return (
            <div>
            <DragBox group="shared">
                <div style={{width: '100%', background: '#aaa'}}>1</div>
                <div>2</div>
                <div>3</div>
            </DragBox >
            <DragBox 
                group="shared" 
                style={{border: '1px solid green'}}
            >
                    {arr.map(item => <div>{item}</div> )}
            </DragBox>
            </div>
        );
    }
}

```
就实现了简单的容器内拖拽排序和扩容器拖拽，可以查看[更多例子](http://sortablejs.github.io/Sortable/)

### 定制 props：

#### allowSwag;

类型：Boolean

是否支持拖拽交换顺序，默认 false，查看[例子](http://sortablejs.github.io/Sortable/#swap)



#### allowMultiDrag

类型： Boolean

是否支持多选拖拽，默认false，查看[例子](http://sortablejs.github.io/Sortable/#multi-drag)


#### style

类型: object;

拖拽容器的自定义样式


### 基本 props

详细可参考 [sortablejs](https://github.com/SortableJS/Sortable#options) 的属性。

#### group

要将元素从一个列表拖到另一个列表中，两个列表必须具有相同的组值。 您还可以定义列表是否可以不接受新元素，给予和保留副本（克隆）以及接收元素。

类型：string | object

string 相当于 object 的 name 属性

object 有三个属性：
- name：字符串—组名，可随意填写该拖拽组的名字（与其他的区分），也可填"shared"——跨容器拖拽；"nested" 嵌套拖拽，

- pull：true | false | [“ foo”，“ bar”] |'clone'|功能-从列表中移出的能力。 克隆—复制项目，而不是移动。 或可以放置元素的组名称。默认为true。

- put：true | false | [“ baz”，“ qux”] | function — 是否可以从其他列表中添加元素，或者可以从中添加元素的组名数组。
revertClone boolean — 将克隆的元素移动到另一个列表后将其还原到初始位置。

演示：
[基本用法](https://jsbin.com/hijetos/edit?js,output)
[use of complex logic in the pull and put](https://jsbin.com/nacoyah/edit?js,output)
[use revertClone: true](https://jsbin.com/bifuyab/edit?js,output)

#### sort

类型：Boolean

是否支持排序，默认 true

#### direction 

类型：string

Sortable应该排序的方向。可以设置为“vertical”，“horizontal”或函数（只要将目标拖到上方，就会调用该函数。 必须返回“vertical”或“horizontal”），默认 vertical

#### disabled 

类型：Boolean

如果设置为true，则禁用sortable。


#### handle 

类型：string

定义拖拽元素可触发拖动的区域，设为拖动元素的子元素的class

```
<DragBox handle=".my-handle">
	<li><span class="my-handle">::</span> list item text one
	<li><span class="my-handle">::</span> list item text two
</DragBox>

.my-handle {
	cursor: move;
	cursor: -webkit-grabbing;
}
```

#### delay

类型：number

定义排序开始时间的时间（以毫秒为单位）。 不幸的是，由于浏览器的限制，使用本地拖放功能无法在IE或Edge上进行延迟。

#### delayOnTouchOnly 

类型：Boolean

是否仅在用户使用触摸（例如，在移动设备上）时才应用延迟。 在任何其他情况下，都不会延迟。 默认为false。

#### swapThreshold 

类型：number

交换区域将占用的目标百分比，介于0和1之间的浮动值。 [了解更多](https://github.com/SortableJS/Sortable/wiki/Swap-Thresholds-and-Direction#swap-threshold)
 
#### ghostClass 

类型：string

放置placeholder的class名称（默认为sortable-ghost）。

#### chosenClass 

类型：string

所选元素的class名称（默认为 sortable-chosen）。

#### delay 

类型：number

#### onChoose

类型： EventCallback

元素渲染时的回调

```
onChoose: function (/**Event*/evt) {
  evt.oldIndex;  // element index within parent
}
```

**更多回调函数:**

//未选择元素
onUnchoose：EventCallback;

//开始拖动元素
onStart：EventCallback;

//元素拖动结束
onEnd：EventCallback;

//将元素从另一个列表拖放到列表中
onAdd：EventCallback;

//更改列表中的排序
onUpdate：EventCallback;

//由列表的任何更改调用（添加/更新/删除）
onSort：EventCallback;

//将元素从列表中删除到另一个列表中
onRemove：EventCallback;

//尝试拖动已过滤的元素
onFilter：EventCallback;

//在列表中或列表之间移动项目时发生的事件
onMove：（/ **事件* / evt：任何，/ **事件* / originalEvent：任何）=>无效;

//创建元素的克隆时调用
onClone：EventCallback;

//拖动元素更改位置时调用
onChange：EventCallback;


### EventCallback 参数 evt 对象的属性

- to：HTMLElement —列表，其中已移动元素

- from：HTMLElement —上一个列表

- item：HTMLElement —拖动的元素

- clone：HTMLElement

- oldIndex：Number | undefined —父级中的旧索引

- newIndex：Number | undefined —父级中的新索引

- oldDraggableIndex：数字|未定义—父级中的旧索引，仅计算可拖动元素

- newDraggableIndex：数字|未定义—父级中的新索引，仅计算可拖动元素

- pullMode：String | Boolean | undefined —如果拖动到另一个可排序（“ clone”，true或false）中，则为拉模式，否则为undefined




## 二、二维布局介绍
### 1.结构
布局结构包含容器和元素，容器即可拖拽区域，元素可在容器内随意拖动。


功能支持：

- 支持grid布局

- 支持碰撞检查

- 支持横纵向压缩（使布局更紧凑）

- 支持从外部拖入组件

- 支持跨容器间拖拽



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
- WidthProvider：包裹RED的元素，使其具备基本容器属性，根据屏幕width实时改变容器的宽度


更多例子见 test/examples

### 基本属性
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

**重要概念**

compactType——挤压方式。可以使布局更加紧凑，类似于有重力感应的效果，可取值：horizontal与vertical

**碰撞解决**

基本思路：拖拽时，遍历每个元素，找出重叠的元素集。每个重叠元素采用步增式移动解决重叠，移动过程又迭代解决新的重叠，直到没有重叠现象。

### 3.拖拽逻辑
react-draggable不是借助html5的拖拽，而是通过监听鼠标事件实时改变元素的位置，相当于自己实现了拖拽。

这样做的好处是：可以自定义拖拽行为，实现碰撞检查、限制最大宽高、水平垂直拖拽以及步增式拖拽等。
