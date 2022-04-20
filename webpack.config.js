const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: { index: [ './src/index.ts' ] },
  devtool: 'inline-source-map',
  
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
        exclude: [ "/node_modules/", "/dist/", "/test/" ],
        options: {
          sources: {
            urlFilter: (attribute, value, resourcePath) => {
              if (/.*\.(png|svg)$/.test(value)) {
                return false;
              }
              return true;
            },
          },
        },
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [ "/node_modules/", "/dist/", "/test/" ]
      },
      // {
      //   test: /\.css$/i,
      //   use: ['style-loader', 'css-loader'],
      //   exclude: [ "/node_modules/", "/dist/", "/test/" ]
      // },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version)
    })
  ],
  resolve: {
    extensions: ['.ts', '.js', '.html'],
    modules: [path.resolve(__dirname), "node_modules"]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  mode: "development"
};