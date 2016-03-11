// Description.js	

import React from 'react';

import { connect } from 'react-redux';
import { push } from 'react-router-redux'

const About = (props) => {
	return (
		<div className='About-Container' >
			<div className="About-RightPanel">
				<div className="About-TextWrapper">	
					<p className="About-Desc">A place for my sketches, most of them are not optimised so it take a bit of time to load, please be patient. Also some of them aren't working in Firefox because Firefox doesn't support textureCubeLod</p>
					<a href="http://blog.bongiovi.tw" target="_blank"><p className="About-Link">blog.bongiovi.tw</p></a>
					<a href="https://twitter.com/yiwen_lin" target="_blank"><p className="About-Link">@yiwen_lin</p></a>
				</div>
			</div>
			<div 
				className="About-Background"
				onClick={ ()=>{
					console.log('Click');
					props.dispatch(push('/Sketches/'));
				}}
			/>
		</div>
	);
}

function mapStateToProps(state, ownProps) {
	return {...state};
}

export default connect(mapStateToProps)(About);