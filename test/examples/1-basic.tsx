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
        onLayoutChange() {},
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

    generateDOM() {
        const { layout } = this.state;
        console.log('generateDOM', layout);
        
        return _.map(layout, i => (
            <div key={i.i}>
                <div className="drag-layout-handle-area">drag</div>
                <span className="text">{i.key}</span>
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

    onLayoutChange(layout, layouts) {
        console.log('onLayoutChange(layout, layouts)', layout, layouts);
        this.props.onLayoutChange(layout);
    }

    onDrop = (params, layout) => {
        const dropItem = layout.filter(item => item.i === '21')
        this.setState({layout })
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
                    rglName="father"
                    droppingItem={{ w: 2, h: 4, i: '21' }}
                    style={{ border: '1px solid #333' }}
                    draggableHandle=".drag-layout-handle-area"
                    onLayoutChange={this.onLayoutChange}
                    onDrop={this.onDrop}
                    isDroppable
                    {...this.props}
                >
                    {this.generateDOM()}
                </ReactGridLayout>

            </div>
        );
    }
}

if (process.env.STATIC_EXAMPLES === true) {
  import('../test-hook').then(fn => fn.default(BasicLayout));
}
