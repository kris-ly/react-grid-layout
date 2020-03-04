import * as React from 'react';
import * as _ from 'lodash';
import * as RED from '@dfe/react-easy-drag';

const WidthProvider = RED.WidthProvider;
const ReactGridLayout = WidthProvider(RED);

export default class GridPropertyLayout extends React.PureComponent {
    static defaultProps = {
        isDraggable: true,
        isResizable: true,
        items: 20,
        rowHeight: 30,
        onLayoutChange() {},
        cols: 12,
    };

    generateDOM() {
    // Generate items with properties from the layout, rather than pass the layout directly
        const layout = this.generateLayout();
        return _.map(_.range(this.props.items), i => (
            <div
                key={i}
                data-grid={layout[i]}
            >
                <span className="text">{i}</span>
            </div>
        ));
    }

    generateLayout() {
        const p = this.props;
        return _.map(new Array(p.items), (item, i) => {
            const w = _.result(p, 'w') || Math.ceil(Math.random() * 4);
            const y = _.result(p, 'y') || Math.ceil(Math.random() * 4) + 1;
            return {
                x: (i * 2) % 12,
                y: Math.floor(i / 6) * y,
                w,
                h: y,
                i: i.toString(),
            };
        });
    }

    onLayoutChange(layout) {
        this.props.onLayoutChange(layout);
    }

    render() {
        return (
            <ReactGridLayout
                onLayoutChange={this.onLayoutChange}
                {...this.props}
            >
                {this.generateDOM()}
            </ReactGridLayout>
        );
    }
}

if (process.env.STATIC_EXAMPLES === true) {
  import('../test-hook').then(fn => fn.default(GridPropertyLayout));
}
