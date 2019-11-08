import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'style-loader!css-loader!../css/styles.css';
import 'style-loader!css-loader!../examples/example-styles.css';

typeof window !== 'undefined' && (window.React = React); // for devtools

export default function makeLayout(Layout) {
    class ExampleLayout extends React.Component {
        state = { layout: [] };

        onLayoutChange = (layout) => {
            this.setState({ layout });
        };

        stringifyLayout() {
            return this.state.layout.map(l => (
                <div
                    className="layoutItem"
                    key={l.i}
                >
                    <b>{l.i}</b>
                    {`: [${l.x}, ${l.y}, ${l.w}, ${l.h}]`}
                </div>
            ));
        }

        render() {
            return (
                <div>
                    <div className="layoutJSON">
            Displayed as
                        {' '}
                        <code>[x, y, w, h]</code>
:
                        <div className="columns">{this.stringifyLayout()}</div>
                    </div>
                    <Layout onLayoutChange={this.onLayoutChange} />
                </div>
            );
        }
    }

    function run() {
        const contentDiv = document.getElementById('content');
        const gridProps = window.gridProps || {};
        ReactDOM.render(React.createElement(ExampleLayout, gridProps), contentDiv);
    }
    if (!document.getElementById('content')) {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    return ExampleLayout;
}
