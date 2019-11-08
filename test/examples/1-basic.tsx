import * as React from 'react';
import * as _ from 'lodash';
import * as RGL from 'react-grid-layout';

const WidthProvider = RGL.WidthProvider;
const ReactGridLayout = WidthProvider(RGL);

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
        this.state = { layout };
    }

    generateDOM() {
        return _.map(_.range(this.props.items), i => (
            <div key={i}>
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
                y: Math.floor(i / 6) * y,
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
                    layout={this.state.layout}
                    droppingItem={{ w: 2, h: 4, i: '21' }}
                    style={{ border: '1px solid #333' }}
                    useCSSTransforms={false}
                    onLayoutChange={this.onLayoutChange}
                    isDroppable
                    {...this.props}
                >
                    {this.generateDOM()}
                </ReactGridLayout>
                <ReactGridLayout
                    layout={this.state.layout}
                    style={{ border: '1px solid #333' }}
                    droppingItem={{ w: 2, h: 4, i: '21' }}
                    useCSSTransforms={false}
                    onLayoutChange={this.onLayoutChange}
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
