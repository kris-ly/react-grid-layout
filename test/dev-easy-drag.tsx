import 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import DevLayout from './examples/1-basic';
import makeLayout from './test-hook';
import 'style-loader!css-loader!../css/styles.css';
import 'style-loader!css-loader!../examples/example-styles.css';

const Layout = makeLayout(DevLayout);

export default hot(Layout);
