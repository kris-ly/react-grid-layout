import * as React from 'react';
import * as RED from '@dfe/react-easy-drag';

const { DragBox } = RED;
const arr = [1,2,3,4,5,6,7]
export default class DragRow extends React.Component<any, any> {
    render() {
        return (
            <div>
            <DragBox group="shared">
                <div style={{width: '100%', background: '#aaa'}}>1</div>
                <div>2</div>
                <div>3</div>
            </DragBox >
            <DragBox 
                group="shared" 
                style={{border: '1px solid green'}}
            >
                    {arr.map(item => <div>{item}</div> )}
            </DragBox>
            </div>
        );
    }
}
