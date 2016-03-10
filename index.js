//	IMPORTS
import { createStore } from 'redux';
import { Router, Route, hashHistory } from 'react-router';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import ExpModel from './ExpModel';

import App from './pages/App';
import Description from './pages/Description';
import Experiment from './pages/Experiment';


//	CONSTRUCT MODELS

const reducers = (state=ExpModel, action) => {
	switch (action.type) {
		default :
			return state;
	}
}

//	MAKE SOME REDUCERS

const store = createStore(reducers);

render(
	<Provider store={store}>
		<Router history={hashHistory}>
			<Route path="/" component={App} />
				<Route path="/exps/:exp" component={Experiment} />
			<Route path="/about" component={Description} />
		</Router>
	</Provider>
	,document.querySelector('#root')
);


