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
  resolve: {
    extensions: ['.ts', '.js', '.html'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  mode: "development"
};