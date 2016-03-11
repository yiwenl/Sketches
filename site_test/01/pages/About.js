// Description.js	

import React from 'react';

const About = (props) => {
	console.log('Props :', props);
	return (
		<div
			className='About-Container' 
			onClick={ ()=>{
				console.log('Clicked !!');
			}
		}>About container</div>
	);
}

// function mapStateToProps(state, ownProps) {
// 	return {experiments:state};
// }

export default About;