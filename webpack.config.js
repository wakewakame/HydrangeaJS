const path = require('path');

module.exports = {
	mode: 'development',
	entry: './src/hydrangea.js',
	output: {
		filename: 'hydrangea.js',
		path: path.join(__dirname, 'dst'),
		publicPath: '/dst/'
	}
};
