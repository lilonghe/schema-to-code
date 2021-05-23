const config  = {
    publicPath: '/service/schema-to-code/',
    webpack: {
        /**
         * assets loader
        *
        * assetsPattern: /\.(png|jpg|gif|svg)$/,
        * assetsLoader: 'url-loader',
        * assetsLoaderOption: { limit: 1024, },
        * 
        **/
        enableESLint: false,
        port: 5555,
    }
}
module.exports = config;