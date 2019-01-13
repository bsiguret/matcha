import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.css';
import registerServiceWorker from './registerServiceWorker';
import { Routes } from './routes';
import { store } from './helpers/store'
import { socketInit, socket } from './socket/socket';
require('dotenv').config()

socketInit(store.dispatch, socket);

ReactDOM.render(
<Provider store={store}>
	<Routes />
</Provider>,
document.getElementById('root'));
registerServiceWorker();
