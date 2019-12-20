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

        const layout = this.generateLayout();
        this.state = {
            layout,
            droppingItem: { w: 2, h: 4, i: '21' },
        };
    }

    generateDOM() {
        return _.map(_.range(this.props.items), i => (
            <div key={i}>
                <div className="drag-layout-handle-area">drag</div>
                <span className="text">{i}</span>
            </div>
        ));
    }

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
            layout, droppingItem,
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
                    layout={layout}
                    droppingItem={droppingItem}
                    style={{ border: '1px solid #333' }}
                    allowCrossGridDrag
                    draggableHandle=".drag-layout-handle-area"
                    isDroppable
                    {...this.props}
                >
                    {this.generateDOM()}
                </ReactGridLayout>
                <ReactGridLayout
                    layout={layout}
                    droppingItem={droppingItem}
                    allowCrossGridDrag
                    style={{ border: '1px solid #333' }}
                    draggableHandle=".drag-layout-handle-area"
                    isDroppable
                    {...this.props}
                >
                    {this.generateDOM()}
                </ReactGridLayout>
            </div>
        );
    }
}

if (process.env.STATIC_EXAMPLES === 'true') {
    import('../test-hook').then(fn => fn.default(BasicLayout));
}
