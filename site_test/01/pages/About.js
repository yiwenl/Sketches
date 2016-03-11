// Description.js	

import React from 'react';

import { connect } from 'react-redux';
import { push } from 'react-router-redux'

const About = (props) => {
	console.log('Props :', props);
	return (
		<div
			className='About-Container' 
			onClick={ ()=>{
				console.log('Clicked !!', push);

				// props.history.push('/');
				props.dispatch(push(''))
			}
		}>About container</div>
	);
}

function mapStateToProps(state, ownProps) {
	return {...state};
}

export default connect(mapStateToProps)(About);