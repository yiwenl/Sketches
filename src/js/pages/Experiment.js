// Experiment.js

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';


class Experiment extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		document.body.classList.add('not-home');
	}

	componentWillUnmount() {
		document.body.classList.remove('not-home');
	}

	render() {
		let index = this.props.experiments.length - parseInt(this.props.params.exp)-1;
		let url = this.props.experiments[index].url;
		const protocol = window.location.href.split('://')[0];
		// url.replace('http', protocol);
		console.log('URL : ', url, this.props);
		return (
			<div>
				<div 
					onClick={()=> {
						this.props.dispatch(push(baseUrl));
					}}
					className="Experiment-CloseButton">
					<svg width="512px" height="512px" viewBox="0 0 512 512">
					<path d="M437.5,386.6L306.9,256l130.6-130.6c14.1-14.1,14.1-36.8,0-50.9c-14.1-14.1-36.8-14.1-50.9,0L256,205.1L125.4,74.5
						c-14.1-14.1-36.8-14.1-50.9,0c-14.1,14.1-14.1,36.8,0,50.9L205.1,256L74.5,386.6c-14.1,14.1-14.1,36.8,0,50.9
						c14.1,14.1,36.8,14.1,50.9,0L256,306.9l130.6,130.6c14.1,14.1,36.8,14.1,50.9,0C451.5,423.4,451.5,400.6,437.5,386.6z"/>
					</svg>
				</div>
				<iframe src={url} className="Experiment-Content" />
			</div>
			
		);
	}
}

/*
const Experiment = (props) => {
	let index = parseInt(props.params.exp);
	let url = props.experiments[index].url;
	console.log('URL : ', url, props);
	return (
		<div>
			<div 
				onClick={()=> {
					props.dispatch(push(baseUrl));
				}}
				className="Experiment-CloseButton">
				<svg width="512px" height="512px" viewBox="0 0 512 512">
				<path d="M437.5,386.6L306.9,256l130.6-130.6c14.1-14.1,14.1-36.8,0-50.9c-14.1-14.1-36.8-14.1-50.9,0L256,205.1L125.4,74.5
					c-14.1-14.1-36.8-14.1-50.9,0c-14.1,14.1-14.1,36.8,0,50.9L205.1,256L74.5,386.6c-14.1,14.1-14.1,36.8,0,50.9
					c14.1,14.1,36.8,14.1,50.9,0L256,306.9l130.6,130.6c14.1,14.1,36.8,14.1,50.9,0C451.5,423.4,451.5,400.6,437.5,386.6z"/>
				</svg>
			</div>
			<iframe src={url} className="Experiment-Content" />
		</div>
		
	);
}*/

function mapStateToProps(state, ownProps) {
	return {experiments:state.experiments};
}

export default connect(mapStateToProps)(Experiment);