// App.js

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ExperimentList from './ExperimentList';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class App extends Component {
	constructor(props) {
		super(props);
	}


	render() {
		return (
			<div className="App">
				<Link to={baseUrl+'about'} className="App-LinkToAbout">
					<svg width="512px" height="512px" viewBox="0 0 512 512">
						<g>
							<path d="M256,0C114.625,0,0,114.625,0,256s114.625,256,256,256s256-114.625,256-256S397.375,0,256,0z M256,480
								C132.477,480,32,379.516,32,256S132.477,32,256,32c123.531,0,224,100.484,224,224S379.531,480,256,480z M256,192
								c-17.664,0-32,14.336-32,32v160c0,17.656,14.336,32,32,32c17.656,0,32-14.344,32-32V224C288,206.336,273.656,192,256,192z
								 M224,128.516c0,17.672,14.328,32,32,32s32-14.328,32-32c0-17.68-14.328-32-32-32S224,110.836,224,128.516z"/>
						</g>
					</svg>
				</Link>
				<ExperimentList 
					experiments = {this.props.experiments}
				/>
				
				<ReactCSSTransitionGroup
				  component="div"
				  transitionName="example"
				  transitionEnterTimeout={250}
				  transitionLeaveTimeout={250}
				>
					{this.props.children}
				</ReactCSSTransitionGroup>
			</div>
		)	
	}
}

function mapStateToProps(state, ownProps) {
	return {experiments:state.experiments};
}

export default connect(mapStateToProps)(App);