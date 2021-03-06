import * as React from 'react';
import * as _ from 'lodash';
import * as RED from '@dfe/react-easy-drag';

const WidthProvider = RED.WidthProvider;
const ReactGridLayout = WidthProvider(RED);

export default class BasicLayout extends React.PureComponent {
    static defaultProps = {
        className: 'layout',
        items: 10,
        rowHeight: 30,
        onLayoutChange() { },
        cols: 12,
    };

    constructor(props) {
        super(props);

        const layout = this.generateLayout();
        this.state = {
            layout,
            dragEnterChild: false,
        };
    }

    generateDOM(layout) {
        return layout.map((item) => {
            if (item.i === '0') {
                const innerLayout = [
                    {
                        i: 'a', x: 0, y: 0, w: 1, h: 4,
                    },
                    {
                        i: 'b', x: 1, y: 0, w: 3, h: 4,
                    },
                    {
                        i: 'c', x: 4, y: 0, w: 1, h: 4,
                    },
                ];
                return (
                    <div
                        key={item.i}
                        data-config={{ static: true }}
                    >
                        <ReactGridLayout
                            layout={innerLayout}
                            droppingItem={{ w: 2, h: 4, i: '21' }}
                            isDroppable
                            onDragNewItemEnter={() => {
                                console.log('onDragNewItemEnter');
                                this.setState({
                                    dragEnterChild: true,
                                });
                            }}
                            onDragNewItemLeave={() => {
                                console.log('onDragNewItemLeave');
                                this.setState({
                                    dragEnterChild: false,
                                });
                            }}
                            allowCrossGridDrag
                            onDrop={() => {
                                console.log('onDrop');
                                this.setState({
                                    dragEnterChild: false,
                                });
                            }}
                            style={{ border: '1px solid #333' }}
                            cols={12}
                            rowHeight={30}
                        >
                            {innerLayout.map((innerItem, j) => (
                                <div key={innerItem.i}>
                                    <span className="text">{j}</span>
                                </div>
                            ))}
                        </ReactGridLayout>
                    </div>
                );
            }
            return (
                <div key={item.i}>
                    <span className="text">{item.i}</span>
                </div>
            );
        });
    }

    generateLayout() {
        const p = this.props;
        return _.map(new Array(p.items), (item, i) => {
            if (i === 0) {
                return {
                    x: 0,
                    y: 0,
                    w: 10,
                    h: 4,
                    i: i.toString(),
                    static: false,
                };
            }
            const y = _.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
            return {
                x: (i * 2) % 12,
                y: 2 + Math.floor(i / 6) * y,
                w: 2,
                h: y,
                i: i.toString(),
                static: i % 8 === 5,
            };
        });
    }

    onLayoutChange(layout) {
        this.props.onLayoutChange(layout);
    }

    render() {
        const { layout, dragEnterChild } = this.state;

        return (
            <div>
                <div
                    className="droppable-element"
                    draggable
                    unselectable="on"
                >
                    draggerble element
                </div>
                <ReactGridLayout
                    layout={layout}
                    dragEnterChild={dragEnterChild}
                    droppingItem={{ w: 2, h: 4, i: '21' }}
                    style={{ border: '1px solid #333' }}
                    onLayoutChange={this.onLayoutChange}
                    allowCrossGridDrag
                    onOtherItemDrop={(rglKey, newLayout, item) => {
                        this.setState({
                            layout: newLayout,
                        });
                    }}
                    isDroppable
                    {...this.props}
                >
                    {this.generateDOM(layout)}
                </ReactGridLayout>

            </div>
        );
    }
}

if (process.env.STATIC_EXAMPLES === true) {
    import('../test-hook').then(fn => fn.default(BasicLayout));
}
