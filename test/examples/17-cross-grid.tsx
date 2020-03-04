import * as React from 'react';
import * as _ from 'lodash';
import * as RED from '@dfe/react-easy-drag';

const { WidthProvider } = RED;
const ReactGridLayout = WidthProvider(RED);

export default class BasicLayout extends React.PureComponent<any, any> {
    static defaultProps = {
        className: 'layout',
        items: 10,
        rowHeight: 30,
        onLayoutChange() { },
        cols: 12,
    };

    constructor(props) {
        super(props);

        const layout1 = this.generateLayout();
        const layout2 = this.generateLayout();
        this.state = {
            layout1,
            layout2,
            droppingItem: { w: 2, h: 4, i: '21' },
        };
    }

    generateDOM = items => (
        items.map(item => (
            <div key={item.i}>
                <div className="drag-layout-handle-area">drag</div>
                <span className="text">{item.i}</span>
            </div>
        ))
    )

    generateLayout() {
        const p = this.props;
        return _.map(new Array(p.items), (item, i) => {
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

    render() {
        const {
            layout1, layout2, droppingItem,
        } = this.state;


        return (
            <div>
                <div
                    className="droppable-element"
                    draggable
                    id="red-draggable"
                    unselectable="on"
                >
                    draggerble element
                </div>
                <ReactGridLayout
                    layout={layout1}
                    droppingItem={droppingItem}
                    rglKey="layout1"
                    style={{ border: '1px solid #333' }}
                    allowCrossGridDrag
                    onOtherItemIn={(p) => { console.log('onOtherItemIn'); }}
                    onOtherItemDrop={(rglKey, layout, item) => {
                        this.setState({
                            layout1: layout,
                        });
                    }}
                    draggableHandle=".drag-layout-handle-area"
                    isDroppable
                    {...this.props}
                >
                    {this.generateDOM(layout1)}
                </ReactGridLayout>
                <ReactGridLayout
                    layout={layout2}
                    droppingItem={droppingItem}
                    style={{ border: '1px solid #333', marginTop: 100 }}
                    rglKey="layout2"
                    allowCrossGridDrag
                    onOtherItemIn={(p) => { console.log('onOtherItemIn'); }}
                    onOtherItemDrop={(rglKey, layout, item) => {
                        this.setState({
                            layout2: layout,
                        });
                    }}
                    draggableHandle=".drag-layout-handle-area"
                    onItemDropOut={(oldLayout, newLayout, item) => {
                        console.log('item', oldLayout, newLayout, item);
                    }}
                    isDroppable
                    {...this.props}
                >
                    {this.generateDOM(layout2)}
                </ReactGridLayout>
            </div>
        );
    }
}

if (process.env.STATIC_EXAMPLES === 'true') {
    import('../test-hook').then(fn => fn.default(BasicLayout));
}
