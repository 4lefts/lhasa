const path = require('path')
const htmlPlugin = require('html-webpack-plugin')

module.exports = {
	entry: './src/app.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'build'),
		publicPath: '/build/'		
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /(node_modules)/,
			use: [{
				loader: 'babel-loader',
				options: {
					presets:['es2015']
				}
			}]
		}]
	},
	plugins: [new htmlPlugin({
		filename: 'index.html',
		title: 'lhasa',
		template: __dirname + '/src/index.html',
	})],
}


