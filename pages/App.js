// App.js

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ExperimentList from './ExperimentList';

// const App = (props) => {

// 	return (
// 		<div>
// 			<Link to="/about">ABOUT</Link>
// 			<ExperimentList 
// 				experiments = {props.experiments}
// 			/>
// 		</div>

// 	);

// }


class App extends Component {

	// static propTypes = {
	// 	location: PropTypes.object,
	// 	terms: PropTypes.object.isRequired,
	// 	browser: PropTypes.object.isRequired,
	// 	platform: PropTypes.object,
	// };

	constructor(props) {
		super(props)

		console.log('PropTypes', PropTypes);
	}

	

	render() {
		return (
			<div>
				<Link to="/about">ABOUT</Link>
				<ExperimentList 
					experiments = {this.props.experiments}
				/>
			</div>

		);
	}
} 

function mapStateToProps(state, ownProps) {
	return {experiments:state};
}

export default connect(mapStateToProps)(App);