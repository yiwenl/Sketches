// App.js

import React from 'react';

const App = (props) => {
	console.log('props : ', props);
	return (
		<div>{props.children}</div>
	)
}


export default App;