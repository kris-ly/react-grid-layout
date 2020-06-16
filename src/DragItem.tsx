
/**
 * tabs标签页调整顺序
 */
import * as React from 'react';
import { throttle } from 'lodash';

interface DragItemProps {
    style?: any;
    transferData: string;
    onDragStart: (evt: any) => void;
    onDrag: (evt: any) => void;
    onDragEnd: (evt: any) => void;
    children: Array<React.ReactElement<any>>;
}


export default class DragItem extends React.Component<DragItemProps> {
    handleStart = (e) => {
        e.stopPropagation();
        const { transferData, onDragStart } = this.props;
        if (transferData) e.dataTransfer.setData('dragData', transferData);
        if (onDragStart) onDragStart(e);
    }
    /* eslint-disable-next-line */
    handleDrag = throttle((e) => {
        const { onDrag } = this.props;
        e.persist();
        if (onDrag) onDrag(e);
    }, 300)

    handleEnd = (e) => {
        const { onDragEnd } = this.props;
        if (onDragEnd) onDragEnd(e);
    }

    render() {
        const { children, style } = this.props;

        return (
            <div
                draggable
                onDragStart={this.handleStart}
                onDrag={this.handleDrag}
                className="easy-drag-item"
                onDragEnd={this.handleEnd}
                style={style}
            >
                {React.Children.map(children, child => child)}
            </div>
        );
    }
}
