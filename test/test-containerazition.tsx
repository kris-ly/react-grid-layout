import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import DevLayout from './examples/containerazition/index';

function run() {
    const contentDiv = document.getElementById('content');
    ReactDOM.render(<DevLayout />, contentDiv);
}
if (!document.getElementById('content')) {
    document.addEventListener('DOMContentLoaded', run);
} else {
    run();
}

export default hot(DevLayout);

