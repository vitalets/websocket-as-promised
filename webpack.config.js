
const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package');

const outDir = process.env.RUNTYPER ? '.runtyper' : 'dist';
const runtyper = process.env.RUNTYPER ? ['babel-plugin-runtyper', {
  warnLevel: 'break',
  implicitAddStringNumber: 'allow',
}] : null;
const babelPlugins = [runtyper].filter(Boolean);
const outFile = path.basename(packageJson.main);

module.exports = {
  mode: 'production',
  entry: './src',
  output: {
    path: path.resolve(outDir),
    filename: outFile,
    libraryTarget: 'umd',
    library: 'WebSocketAsPromised',
    globalObject: 'this', // https://github.com/webpack/webpack/issues/6525
  },
  devtool: 'source-map',
  // disable own minification as second minification in app can break the code.
  // see: https://github.com/vitalets/websocket-as-promised/issues/21
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
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
