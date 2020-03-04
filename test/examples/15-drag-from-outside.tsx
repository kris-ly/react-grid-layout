import * as React from 'react';
import * as _ from 'lodash';
import * as RED from '@dfe/react-easy-drag';

const WidthProvider = RED.WidthProvider;
const Responsive = RED.Responsive;
const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default class DragFromOutsideLayout extends React.Component {
    static defaultProps = {
        className: 'layout',
        rowHeight: 30,
        onLayoutChange() {},
        cols: {
            lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
        },
        initialLayout: generateLayout(),
    };

    state = {
        currentBreakpoint: 'lg',
        compactType: 'vertical',
        mounted: false,
        layouts: { lg: this.props.initialLayout },
    };

    componentDidMount() {
        this.setState({ mounted: true });
    }

    generateDOM() {
        return _.map(this.state.layouts.lg, (l, i) => (
            <div
                key={i}
                className={l.static ? 'static' : ''}
            >
                {l.static ? (
                    <span
                        className="text"
                        title="This item is static and cannot be removed or resized."
                    >
              Static -
                        {' '}
                        {i}
                    </span>
                ) : (
                    <span className="text">{i}</span>
                )}
            </div>
        ));
    }

    onBreakpointChange = (breakpoint) => {
        this.setState({
            currentBreakpoint: breakpoint,
        });
    };

    onCompactTypeChange = () => {
        const { compactType: oldCompactType } = this.state;
        const compactType = oldCompactType === 'horizontal'
            ? 'vertical'
            : oldCompactType === 'vertical'
                ? null
                : 'horizontal';
        this.setState({ compactType });
    };

    onLayoutChange = (layout, layouts) => {
        this.props.onLayoutChange(layout, layouts);
    };

    onNewLayout = () => {
        this.setState({
            layouts: { lg: generateLayout() },
        });
    };

    onDrop = (elemParams) => {
        alert(`Element parameters: ${JSON.stringify(elemParams)}`);
    };

    render() {
        return (
            <div>
                <div>
          Current Breakpoint:
                    {' '}
                    {this.state.currentBreakpoint}
                    {' '}
(
                    {this.props.cols[this.state.currentBreakpoint]}
                    {' '}
columns)
                </div>
                <div>
          Compaction type:
                    {' '}
                    {_.capitalize(this.state.compactType) || 'No Compaction'}
                </div>
                <button onClick={this.onNewLayout}>Generate New Layout</button>
                <button onClick={this.onCompactTypeChange}>
          Change Compaction Type
                </button>
                <div
                    className="droppable-element"
                    draggable
                    unselectable="on"
                    // this is a hack for firefox
                    // Firefox requires some kind of initialization
                    // which we can do by adding this attribute
                    // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
                    onDragStart={e => e.dataTransfer.setData('text/plain', '')}
                >
          Droppable Element
                </div>
                <ResponsiveReactGridLayout
                    {...this.props}
                    layouts={this.state.layouts}
                    onBreakpointChange={this.onBreakpointChange}
                    onLayoutChange={this.onLayoutChange}
                    onDrop={this.onDrop}
                    // WidthProvider option
                    measureBeforeMount={false}
                    // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
                    // and set `measureBeforeMount={true}`.
                    useCSSTransforms={this.state.mounted}
                    compactType={this.state.compactType}
                    preventCollision={!this.state.compactType}
                    isDroppable
                >
                    {this.generateDOM()}
                </ResponsiveReactGridLayout>
            </div>
        );
    }
}

function generateLayout() {
    return _.map(_.range(0, 25), (item, i) => {
        const y = Math.ceil(Math.random() * 4) + 1;
        return {
            x: (_.random(0, 5) * 2) % 12,
            y: Math.floor(i / 6) * y,
            w: 2,
            h: y,
            i: i.toString(),
            static: Math.random() < 0.05,
        };
    });
}

if (process.env.STATIC_EXAMPLES === true) {
  import('../test-hook').then(fn => fn.default(DragFromOutsideLayout));
}
