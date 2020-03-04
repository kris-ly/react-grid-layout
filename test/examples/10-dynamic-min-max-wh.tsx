import * as React from 'react';
import * as _ from 'lodash';
import * as RED from '@dfe/react-easy-drag';

const WidthProvider = RED.WidthProvider;
const ReactGridLayout = WidthProvider(RED);

/**
 * This layout demonstrates how to use the `onResize` handler to enforce a min/max width and height.
 *
 * In this grid, all elements are allowed a max width of 2 if the height < 3,
 * and a min width of 2 if the height >= 3.
 */
export default class DynamicMinMaxLayout extends React.PureComponent {
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
        return _.map(layout, l => (
            <div
                key={l.i}
                data-grid={l}
            >
                <span className="text">{l.i}</span>
            </div>
        ));
    }

    generateLayout() {
        const p = this.props;
        return _.map(new Array(p.items), (item, i) => {
            const w = _.random(1, 2);
            const h = _.random(1, 3);
            return {
                x: (i * 2) % 12,
                y: Math.floor(i / 6),
                w,
                h,
                i: i.toString(),
            };
        });
    }

    onLayoutChange(layout) {
        this.props.onLayoutChange(layout);
    }

    onResize(layout, oldLayoutItem, layoutItem, placeholder) {
    // `oldLayoutItem` contains the state of the item before the resize.
    // You can modify `layoutItem` to enforce constraints.

        if (layoutItem.h < 3 && layoutItem.w > 2) {
            layoutItem.w = 2;
            placeholder.w = 2;
        }

        if (layoutItem.h >= 3 && layoutItem.w < 2) {
            layoutItem.w = 2;
            placeholder.w = 2;
        }
    }

    render() {
        return (
            <ReactGridLayout
                onLayoutChange={this.onLayoutChange}
                onResize={this.onResize}
                {...this.props}
            >
                {this.generateDOM()}
            </ReactGridLayout>
        );
    }
}

if (process.env.STATIC_EXAMPLES === true) {
  import('../test-hook').then(fn => fn.default(DynamicMinMaxLayout));
}
