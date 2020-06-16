import * as React from 'react';
import * as RED from '@dfe/react-easy-drag';

const { DragItem ,DropItem } = RED;

export default class DragRow extends React.Component<any, any> {
    state = {
        data: '',
    }
    handle_drop = (e, data) => {
        console.log('handle_drop-当元素在目的地放下时触发')
        console.log('dataTransfer', data);
        this.setState({
            data,
        })
    }
    render() {
        const { data } = this.state;
        return (
            <div className="src">
                <DragItem 
                    transferData="{ name: 'kris' }"
                    style={{ height: 200, width: 400, border: '1px solid #aaa'}}
                >
                            此段文字设置了属性draggable="true"
                    <DragItem 
                        transferData="{ name: 'alice' }"
                    >这个也可以拖</DragItem>
                </DragItem>
                <DropItem
                    dropEffect="copy"
                    style={{ height: 300, border: '1px solid #ddd' }}
                    onDrop={this.handle_drop}
                >
                    Drop Here
                    <div>{data}</div>
                </DropItem>
            </div>
        )}
}

