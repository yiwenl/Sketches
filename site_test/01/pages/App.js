// App.js

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ExperimentList from './ExperimentList';

class App extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className="App">
				<Link to="/about">ABOUT</Link>
				<ExperimentList 
					experiments = {this.props.experiments}
				/>
			</div>

		);
	}
} 

function mapStateToProps(state, ownProps) {
	console.log("STATE:", state);
	return {experiments:state};
}

export default connect(mapStateToProps)(App);