const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "buffer": require.resolve("buffer/"),
          "process": require.resolve("process/browser")
        }
      }
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      ]
    }
  }
};
