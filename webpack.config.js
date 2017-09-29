
const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package');

const outDir = process.env.RUNTYPER ? 'dist-runtyper' : 'dist';
const outFile = path.basename(packageJson.main)
  .replace('.js', process.env.NODE_ENV === 'production' ? '.min.js' : '.js');

module.exports = {
  entry: './src',
  output: {
    path: path.resolve(outDir),
    filename: outFile,
    libraryTarget: 'umd',
    library: 'fs',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: process.env.RUNTYPER ? [
              ['babel-plugin-runtyper', {
                warnLevel: 'break',
                implicitAddStringNumber: 'allow',
              }]
            ] : []
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin(`${packageJson.name} v${packageJson.version}`)
  ]
};
