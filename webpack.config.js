
const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package');

const isProd = process.env.NODE_ENV === 'production';
const outDir = process.env.RUNTYPER ? 'dist-runtyper' : 'dist';
const runtyper = process.env.RUNTYPER ? ['babel-plugin-runtyper', {
  warnLevel: 'break',
  implicitAddStringNumber: 'allow',
}] : null;
const babelPlugins = [runtyper].filter(Boolean);
const outFile = path.basename(packageJson.main).replace('.min.js', isProd ? '.min.js' : '.js');

module.exports = {
  entry: './src',
  output: {
    path: path.resolve(outDir),
    filename: outFile,
    libraryTarget: 'umd',
    library: 'WebSocketAsPromised',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: babelPlugins,
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin(`${packageJson.name} v${packageJson.version}`)
  ]
};
