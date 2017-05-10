import '../scss/global.scss';
import '../scss/about.scss';
import '../scss/experiment.scss';

import React from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Router, Route, IndexRoute, hashHistory, browserHistory, Redirect } from 'react-router';
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux'
import { render } from 'react-dom';
import { Provider } from 'react-redux';


import ExpModel from './ExpModel';
import App from './pages/App';
import Home from './pages/Home';
import About from './pages/About';
import Experiment from './pages/Experiment';


ExpModel.reverse();

// console.log('Folder Static pages testing ', Math.floor(Math.random() * 100));
// console.log('Sketches : ', ExpModel);
//	CONSTRUCT MODELS

const experimentsReducer = (state=ExpModel, action) => {
	return state;
}

const middleware = routerMiddleware(browserHistory)


/*/
window.baseUrl = '/';
/*/
window.baseUrl = "/Sketches/";
//*/

// console.log('Location : ', window.location.href);
const protocol = window.location.href.split('://')[0];
if(window.location.href.indexOf('localhost') > -1) {
	window.baseUrl = '/';
	ExpModel.map((exp) => {
		exp.cover = `${protocol}://yiwenl.github.io/Sketches/${exp.cover}`;
	});
} else {
	ExpModel.map((exp) => {
		exp.cover = `${protocol}://yiwenl.github.io/Sketches/${exp.cover}`;
	});
}

//	MAKE SOME REDUCERS
let reducer = combineReducers({
	experiments: experimentsReducer,
	routing: routerReducer
})

const store = createStore(reducer, applyMiddleware(middleware));
const history = syncHistoryWithStore(browserHistory, store);

window.addEventListener('DOMContentLoaded', () => {
	render(
		<Provider store={store}>
			<Router history={browserHistory}>
				<Route path={baseUrl} component={App}>
					<Route path={baseUrl + 'exps/:exp'} component={Experiment} />
					<Route path={baseUrl + 'about'} component={About} />
				</Route>
			</Router>
		</Provider>
		,document.querySelector('#root')
	);	
});

