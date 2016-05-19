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
					let dest = baseUrl + 'exps/'+i.toString();
					let divStyle = {
						color: 'white',
						backgroundImage: 'url(' + exp.cover + ')',
						backgroundSize:'cover'
					};
					return (
						<Link 
							to={dest} 
							key={i} 
							className="Experiment-Item"
							style={divStyle} />
					);
				})
			}
		</div>
	);
}

export default ExperimentList;