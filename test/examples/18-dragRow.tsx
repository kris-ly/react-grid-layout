import * as React from 'react';
import * as RED from '@dfe/react-easy-drag';

const { DragBox } = RED;
const arr = [1,2,3,4,5,6,7]
export default class DragRow extends React.Component<any, any> {
    render() {
        return (
            <div>
                <DragBox group="shared">
                    <p 
                        style={{width: '100%', background: '#aaa'}}
                        data-obj="{name: 1}"
                        className="box1">
                        <span>1</span>
                    </p>
                        <div data-obj="{{ name: 2 }}" ><p>12342342342342442</p></div>
                    <div data-obj="{{ name: 3 }}">
                            <span>1</span>
                    </div>
                </DragBox >
                <DragBox 
                    group="shared" 
                    style={{border: '1px solid green'}}
                        onAdd={(evt) => { 
                            // 打印 dataset
                            console.log(evt.item.dataset);
                        }}
                >
                        {arr.map(item => <div>{item}</div> )}
                </DragBox>
            </div>
        );
    }
}
