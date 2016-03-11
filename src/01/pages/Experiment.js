// Experiment.js

import React from 'react';
import { connect } from 'react-redux';

const Experiment = (props) => {
	let index = parseInt(props.params.exp);
	let url = props.experiments[index].url;
	console.log('URL : ', url);
	return (
		// <div>Experiment container</div>
		// <iframe src="http://yiwenl.github.io/Sketches/experiments/selfshadingParticles/dist/index.html"/>
		<iframe src={url} className="Experiment-Content" />
	);
}

function mapStateToProps(state, ownProps) {
	return {experiments:state.experiments};
}

export default connect(mapStateToProps)(Experiment);