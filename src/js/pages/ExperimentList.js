// ExperimentList.js

import React from 'react';
import { Link } from 'react-router';

const ExperimentList = ({
	experiments
}) => {
	return (
		<div className="Experiment-List">
			{
				experiments.map( (exp, i) => {
					// let dest = baseUrl + 'exps/'+i.toString();
					let dest = `${baseUrl}exps/${experiments.length-i-1}`;
					let divStyle = {
						color: 'white',
						backgroundImage: 'url(' + exp.cover + ')',
						backgroundSize:'cover'
					};
					return (
						<Link 
							to={dest} 
							key={experiments.length-i-1} 
							className="Experiment-Item"
							style={divStyle} />
					);
				})
			}
		</div>
	);
}

export default ExperimentList;