import * as React from 'react';
import * as _ from 'lodash';
import * as RED from '@dfe/react-easy-drag';

const { utils, WidthProvider } = RED;
const ReactGridLayout = WidthProvider(RED);
const { isMouseIn } = utils;
const droppingItem = { w: 2, h: 4, i: '21' };

export default class BasicLayout extends React.PureComponent<any, any> {
    static defaultProps = {
        className: 'layout',
        items: 10,
        rowHeight: 30,
        onLayoutChange() { },
        cols: 12,
    };

    rglContainerPos = {};

    rgl1 = null;

    rgl2 = null;

    constructor(props) {
        super(props);

        const layout = this.generateLayout();
        this.state = {
            layout,
            enteredRgl: '',
            otherGridItemDroppingPosition: {
                x: 0,
                y: 0,
            },
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

    onLayoutChange = (key, layout, position) => {
        this.rglContainerPos[key] = position;
        this.props.onLayoutChange(layout);
    }

    checkItemPostion = (key, layoutItem, clientX, clientY) => {
        const { rglContainerPos } = this;

        const rglContainerKeys = Object.keys(rglContainerPos);

        let index = 0;
        for (let len = rglContainerKeys.length; index < len; index++) {
            const layoutKey = rglContainerKeys[index];
            if (layoutKey === key) continue;

            if (isMouseIn(clientX, clientY, rglContainerPos[layoutKey])) {
                const { left, top } = rglContainerPos[layoutKey];
                this[layoutKey].rgl.moveItem(droppingItem, clientX - left, clientY - top, window.Event);

                this.setState({
                    enteredRgl: layoutKey,
                    otherGridItemDroppingPosition: {
                        x: clientX - left,
                        y: clientY - top,
                    },
                });
                break;
            }
        }
    }

    render() {
        const {
            layout, enteredRgl, otherGridItemDroppingPosition,
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
                    ref={ref => this.rgl1 = ref}
                    onItemOut={(l, x, y) => {
                        this.checkItemPostion('rgl2', l, x, y);
                    }}
                    otherGridItemEntered={enteredRgl === 'rgl1'}
                    droppingItem={droppingItem}
                    style={{ border: '1px solid #333' }}
                    draggableHandle=".drag-layout-handle-area"
                    isDroppable
                    {...this.props}
                    otherGridItemDroppingPosition={otherGridItemDroppingPosition}
                    onLayoutChange={(ly, position) => {
                        this.onLayoutChange('rgl1', ly, position);
                    }}
                >
                    {this.generateDOM()}
                </ReactGridLayout>
                <ReactGridLayout
                    layout={layout}
                    ref={ref => this.rgl2 = ref}
                    onItemOut={(l, x, y) => {
                        this.checkItemPostion('rgl2', l, x, y);
                    }}
                    droppingItem={droppingItem}
                    otherGridItemEntered={enteredRgl === 'rgl2'}
                    style={{ border: '1px solid #333' }}
                    draggableHandle=".drag-layout-handle-area"
                    isDroppable
                    {...this.props}
                    otherGridItemDroppingPosition={otherGridItemDroppingPosition}
                    onLayoutChange={(ly, position) => {
                        this.onLayoutChange('rgl2', ly, position);
                    }}
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
