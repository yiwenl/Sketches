// Description.js	

import React, { Component } from 'react';

import { connect } from 'react-redux';
import { push } from 'react-router-redux'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class About extends Component {
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
		let props = this.props;
		let returnToHome = () => {
			props.dispatch(push(baseUrl));
		};

		return (
			<div className='About-Page' ref="AboutRoot">
				<div 
					onClick={returnToHome}
					className="About-CloseButton">
					<svg width="512px" height="512px" viewBox="0 0 512 512">
					<path d="M437.5,386.6L306.9,256l130.6-130.6c14.1-14.1,14.1-36.8,0-50.9c-14.1-14.1-36.8-14.1-50.9,0L256,205.1L125.4,74.5
						c-14.1-14.1-36.8-14.1-50.9,0c-14.1,14.1-14.1,36.8,0,50.9L205.1,256L74.5,386.6c-14.1,14.1-14.1,36.8,0,50.9
						c14.1,14.1,36.8,14.1,50.9,0L256,306.9l130.6,130.6c14.1,14.1,36.8,14.1,50.9,0C451.5,423.4,451.5,400.6,437.5,386.6z"/>
					</svg>
				</div>
				<ReactCSSTransitionGroup
				  component="div"
				  transitionName="slideInDelay"
				  transitionLeaveTimeout={250}
				  transitionAppear={true} 
				  transitionAppearTimeout={10000}
				>
					<div className="About-RightPanel">
						<div className="About-TextWrapper">	
							<p className="About-Desc">A place for my sketches, most of them are not optimised so it take a bit of time to load, please be patient. And apologies for some of the sketches might not work across different devices and platforms. This is more a playground for me to tryout ideas.</p>
							<p className="About-Desc with-link">Source code could be found here: <a href="https://github.com/yiwenl/Sketches" target="_blank"><p className="About-Link">https://github.com/yiwenl/Sketches</p></a></p>
							<p className="About-Desc with-link">Built with my WebGL Tools : <a href="https://github.com/yiwenl/Alfrid" target="_blank"><p className="About-Link">https://github.com/yiwenl/Alfrid</p></a></p>
							<br/>
							<a href="http://blog.bongiovi.tw" target="_blank"><p className="About-Link">blog.bongiovi.tw</p></a>
							<a href="https://twitter.com/yiwen_lin" target="_blank"><p className="About-Link">@yiwen_lin</p></a>
						</div>
					</div>
				</ReactCSSTransitionGroup>
				<div 
					className="About-Background"
					onClick={returnToHome}
				/>
			</div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {...state};
}

export default connect(mapStateToProps)(About);