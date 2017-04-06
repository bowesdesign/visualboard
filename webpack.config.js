const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");
const extractSass = new ExtractTextPlugin({
    filename: "../css/main.css"
});

module.exports = {
    entry: ['./static/js/main.js', './static/scss/main.scss'],
    // entry: ['./static/js/main.js'],
    output: {
        publicPath: 'http://localhost:8080/',
        filename: 'static/build/bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css-loader!sass-loader')
            },
            {test: /\.jpg/, loader: "url-loader?mimetype=image/png"},
            {test: /\.gif/, loader: "url-loader?mimetype=image/png"}
        ]
    },
    plugins: [
        new ExtractTextPlugin('./static/build/main.css')
    ]
};

// module.exports = {
//     entry: './static/js/main.js',
//     output: {
//         filename: 'bundle.js',
//         path: path.resolve(__dirname, 'static/js/')
//     },
//     module: {
//         rules: [{
//             test: /\.scss$/,
//             use: extractSass.extract({
//                 use: [{
//                     loader: "css-loader"
//                 }, {
//                     loader: "sass-loader"
//                 }],
//                 // use style-loader in development
//                 fallback: "style-loader"
//             })
//         }],
//         loaders: [
//             {
//                 test: /\.(jpe?g|png|gif|svg)$/i,
//                 loaders: [
//                     'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
//                     'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
//                 ]
//             }
//         ],
//     },
//     plugins: [
//         extractSass
//     ]
// }
// ;