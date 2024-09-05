const common = require('./rspack.config.js');
const path = require('path');

//Configure dev enviroment by combining common configuration and adding some more options
module.exports = {
    ...common,
    mode: 'development',
    devServer: {
        static: './public',
        historyApiFallback: true,
        hot: true,
        devMiddleware: {
            writeToDisk: true,
            
      }
    },
    output: {
        path: path.resolve(__dirname, '../public'),
        filename: '[name].bundle.js'
      },
}
