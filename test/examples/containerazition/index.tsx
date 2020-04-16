import * as React from 'react';
import * as RED from '@dfe/react-easy-drag';
import componentList from './ComponentList';
import 'style-loader!css-loader!../../../css/styles.css';
import 'style-loader!css-loader!./Home.css';

const WidthProvider = RED.WidthProvider;
const ReactGridLayout = WidthProvider(RED);

type LayoutItemType = 'newTabsLayout' | 'filterLayout' | 'chart';
type LayoutItemCategory = 'chart' | undefined | 'layout';

export interface LayoutItem {
    key: string;
    GridX: number;
    GridY: number;
    w: number;
    h: number;
    static?: boolean;
    type: LayoutItemType;
    minH: number;
    maxH: number;
    child: LayoutItem[];
    category: LayoutItemCategory;
}
// 天璇默认配置
const RGL_PADDING: number[] = [5, 5];
const RGL_COLS: number = 30;
const RGL_MARGIN = [15, 10];
const RGL_ROWHEIGHT: number = 5;

class HomePage extends React.Component {
    componentMap = {};

    constructor(props) {
        super(props);
        componentList.forEach((item) => {
            this.componentMap[item.name] = item.component;
        });
        this.state = {
            layout: [],
            components: {},
            droppingItem: {
                w: 1,
                height: 1,
                i: 0,
            },
        };
    }

    onDrop = (elemParams, layout) => {
        const { components } = this.state;
        this.setState({
            components: {
                ...components,
                [elemParams.i]: elemParams.name,
            },
            layout,
        })
    };

    generateDomList = (layout) => {
        const { components } = this.state;
        return layout.map((item) => {
            console.log('this.componentMap', components[item.i], item.i, this.componentMap);
        return (
            <div key={item.i}>
                {this.componentMap[components[item.i]]}
            </div>
            )
        });
    }

    onLayoutChange = (layout: any[]) => {
    }

    render() {
        const defaultConfig = {
            items: 20,
            rowHeight: RGL_ROWHEIGHT,
            cols: RGL_COLS,
            isDraggable: true,
            isResizable: true,
            margin: RGL_MARGIN,
            containerPadding: RGL_PADDING,
        };

        const { layout, droppingItem } = this.state;
        const layoutDomList = this.generateDomList(layout);
        return (
            <div className="content">
                <div>
                    {componentList.map((item) => (
                        <div
                            className="droppable-element"
                            draggable
                            unselectable="on"
                            onDragStart={(e) => {
                                const { name, initialWidth, initialHeight } = item;
                                e.dataTransfer.setData('text/plain', '');
                                e.dataTransfer.setData('name', name);
                                this.setState({
                                    droppingItem: {
                                        w: initialWidth,
                                        h: initialHeight,
                                        i: name,
                                    },
                                });
                            }}
                        >
                            {item.icon}
                        </div>
                    ))}
                </div>
                <div className="palette">
                    <ReactGridLayout
                        {...defaultConfig} // eslint-disable-line
                        style={{ minHeight: 200, width: '100%' }}
                        onLayoutChange={this.onLayoutChange}
                        layout={layout}
                        droppingItem={droppingItem}
                        onDrop={this.onDrop}
                        isDroppable
                    >
                        {layoutDomList}
                    </ReactGridLayout>
                </div>
            </div>
        );
    }
}
export default HomePage;
