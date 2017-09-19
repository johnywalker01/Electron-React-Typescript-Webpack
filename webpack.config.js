var path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

var config = {
  /*
   * app.ts represents the entry point to your web application. Webpack will
   * recursively go through every "require" statement in app.tsx and
   * efficiently build out the application's dependency tree.
   */
  entry: [
    'babel-polyfill',
    './src/index.ts'
  ],

  /*
   * The combination of path and filename tells Webpack what name to give to
   * the final bundled JavaScript file and where to store this file.
   */
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js"
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: true,
    }),
  ],

  /*
   * resolve lets Webpack now in advance what file extensions you plan on
   * "require"ing into the web application, and allows you to drop them
   * in your code.
   */
  resolve: {
      extensions: [ ".ts", ".tsx", ".js", "jsx"],
      plugins: [
        new TsConfigPathsPlugin()
      ]
  },

  module: {
    /*
     * Each loader needs an associated Regex test that goes through each
     * of the files you've included (or in this case, all files but the
     * ones in the excluded directories) and finds all files that pass
     * the test. Then it will apply the loader to that file.
     */
    loaders: [
      // {
      //   test: /\.(ts|tsx)$/,
      //   loader: "babel-loader",
      //   exclude: /node_modules/,
      //   include: path.join(__dirname, 'src'),
      // },
      {
        test: /\.tsx?$/,
        loaders: ['babel-loader?presets[]=es2015', 'awesome-typescript-loader'],
        include: path.join(__dirname, 'src'),
      },
      // {
      //   test: /\.(tsx)$/,
      //   loader: "awesome-typescript-loader",
      // },
      {
        test: /\.(ico)$/,
        loader: "file-loader",
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.css$/,
        use: ["style-loader", { loader: 'css-loader', options: { sourceMap: 1 } }, "postcss-loader"],
      },
      {
        test: /\.less$/,
        use: ["style-loader", { loader: 'css-loader', options: { sourceMap: 1 } }, "postcss-loader", "less-loader"],
      },
      {
        test: /\.(gif|jpg|png)$/,
        loader: 'url-loader',
        include: path.join(__dirname, 'resources'),
        query: {
          limit: 25000,  //inline files < 25k
          name: '[path][name].[hash].[ext]',  //include hashed filename when > 25k
        }
      },
    ]
  },
};

module.exports = config;