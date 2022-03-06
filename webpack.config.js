const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: 'html-loader',
        exclude: [ "/node_modules/", "/dist/", "/test/" ]
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [ "/node_modules/", "/dist/", "/test/" ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.html'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: "development"
};