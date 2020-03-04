import * as React from 'react';
import * as _ from 'lodash';
import * as RED from '@dfe/react-easy-drag';

const WidthProvider = RED.WidthProvider;
const ReactGridLayout = WidthProvider(RED);

export default class MinMaxLayout extends React.PureComponent {
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
        return _.map(layout, (l) => {
            const mins = [l.minW, l.minH];
            const maxes = [l.maxW, l.maxH];
            return (
                <div
                    key={l.i}
                    data-grid={l}
                >
                    <span className="text">{l.i}</span>
                    <div className="minMax">{`min:${mins} - max:${maxes}`}</div>
                </div>
            );
        });
    }

    generateLayout() {
        const p = this.props;
        return _.map(new Array(p.items), (item, i) => {
            const minW = _.random(1, 6);
            const minH = _.random(1, 6);
            const maxW = _.random(minW, 6);
            const maxH = _.random(minH, 6);
            const w = _.random(minW, maxW);
            const y = _.random(minH, maxH);
            return {
                x: (i * 2) % 12,
                y: Math.floor(i / 6) * y,
                w,
                h: y,
                i: i.toString(),
                minW,
                maxW,
                minH,
                maxH,
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
  import('../test-hook').then(fn => fn.default(MinMaxLayout));
}
