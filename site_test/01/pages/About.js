// Description.js	

import React from 'react';

import { connect } from 'react-redux';
import { push } from 'react-router-redux'

const About = (props) => {
	return (
		<div
			className='About-Container' 
			onClick={ ()=>{
				props.dispatch(push(''))
			}
		}>About container</div>
	);
}

function mapStateToProps(state, ownProps) {
	return {...state};
}

export default connect(mapStateToProps)(About);