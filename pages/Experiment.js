// Experiment.js

import React from 'react';
import { connect } from 'react-redux';

const Experiment = (props) => {
	let index = parseInt(props.params.exp);
	let url = props.experiments[index].url;
	console.log('URL : ', url);
	return (
		<div>Experiment container</div>
	);
}

function mapStateToProps(state, ownProps) {
	return {experiments:state};
}

export default connect(mapStateToProps)(Experiment);