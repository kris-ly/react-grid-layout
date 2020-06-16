/**
 * tabs标签页调整顺序
 */
import * as React from 'react';
import classNames from 'classnames';

enum DropEffctEnum {
    none = 'none',
    move = 'move',
    copy = 'copy',
    link = 'link',
}

interface DropItemProps {
    style?: any;
    onDragEnter: (evt: any, data: any) => void;
    onDragOver: (evt: any, data: any) => void;
    onDragLeave: (evt: any, data: any) => void;
    dropEffect?: DropEffctEnum;
    onDrop: (evt: any, data: any) => void;
    children: Array<React.ReactElement<any>>;
}

interface DropItemState {
    itemIn: boolean;
}

export default class DropItem extends React.Component<DropItemProps, DropItemState> {
    state = {
        itemIn: false,
    }

    handleEnter = (e) => {
        const { onDragEnter } = this.props;
        e.preventDefault();
        if (onDragEnter) onDragEnter(e, e.dataTransfer.getData('dragData'));
    }

    handleOver = (e) => {
        const { onDragOver, dropEffect } = this.props;
        if (dropEffect) e.dataTransfer.dropEffect = dropEffect;
        if (!this.state.itemIn) {
            this.setState({
                itemIn: true,
            });
        }
        e.preventDefault();
        if (onDragOver) onDragOver(e, e.dataTransfer.getData('dragData'));
    }

    handleLeave = (e) => {
        const { onDragLeave } = this.props;
        this.setState({
            itemIn: false,
        });
        e.preventDefault();
        if (onDragLeave) onDragLeave(e, e.dataTransfer.getData('dragData'));
    }

    handleDrop = (e) => {
        const { onDrop } = this.props;
        this.setState({
            itemIn: false,
        });
        e.preventDefault();
        if (onDrop) onDrop(e, e.dataTransfer.getData('dragData'));
    }

    render() {
        const { children, style } = this.props;
        const { itemIn } = this.state;

        return (

            <div
                onDragEnter={this.handleEnter}
                onDragOver={this.handleOver}
                onDragLeave={this.handleLeave}
                onDrop={this.handleDrop}
                className={classNames(
                    '"easy-drop-item"',
                    itemIn ? 'drag-item-in' : '',
                )}
                style={style}
            >
                {React.Children.map(children, child => child)}
            </div>
        );
    }
}
