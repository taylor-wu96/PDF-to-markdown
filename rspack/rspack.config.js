const path = require('path');
const defineConfig =require("@rspack/cli");
const rspack =require("@rspack/core");
const RefreshPlugin= require("@rspack/plugin-react-refresh") ;
const isDev = process.env.NODE_ENV === "development";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];
const __base = path.resolve(__dirname, '..');
module.exports ={
	context: __dirname,
	entry: {
		main: path.join( __base,"src/index.jsx")
	},
	resolve: {
		extensions: ["...", ".ts", ".tsx", ".jsx"]
	},
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__base, 'public'),
    clean: true
},
	module: {
		rules: [
			{
				test: /\.svg$/,
				type: "asset"
			},
			{
				test: /\.(jsx?|tsx?)$/,
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "typescript",
									tsx: true
								},
								transform: {
									react: {
										runtime: "automatic",
										development: isDev,
										refresh: isDev
									}
								}
							},
							env: { targets }
						}
					}
				]
			}
		]
	},
	plugins: [
		new rspack.HtmlRspackPlugin({
			template: "../src/index.html"
		}),
		isDev ? new RefreshPlugin() : null
	].filter(Boolean),
	optimization: {
		minimizer: [
			new rspack.SwcJsMinimizerRspackPlugin(),
			new rspack.LightningCssMinimizerRspackPlugin({
				minimizerOptions: { targets }
			})
		]
	},
	experiments: {
		css: true
	}
};
