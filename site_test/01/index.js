//	IMPORTS
import { createStore, combineReducers } from 'redux';
import { Router, Route, hashHistory, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'


import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import ExpModel from './ExpModel';

import App from './pages/App';
import About from './pages/About';
import Experiment from './pages/Experiment';


//	CONSTRUCT MODELS

const reducers = (state=ExpModel, action) => {
	switch (action.type) {
		default :
			return state;
	}
}

//	MAKE SOME REDUCERS
// const reducer = combineReducers({
//   ...reducers,
//   routing: routerReducer
// })

const store = createStore(reducers);
// const history = syncHistoryWithStore(browserHistory, store);

render(
	<Provider store={store}>
		<Router history={hashHistory}>
			<Route path="/" component={App} />
				<Route path="/exps/:exp" component={Experiment} />
			<Route path="/about" component={About} />
		</Router>
	</Provider>
	,document.querySelector('#root')
);


