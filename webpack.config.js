const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    backupVerify: './src/backupVerify.ts',
    copySnapshots: './src/copySnapshots.ts',
    makeConfig: './src/makeConfig.ts',
    checkDates: './src/checkDates.ts',
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js',
  },
  target: 'node',
  resolve: {
    modules: ['node_modules'],
    extensions: ['.tsx', '.ts', '.mjs', '.js'],
  },
  plugins: [new CleanWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(ts|tsx)?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              onlyCompileBundledFiles: true,
              transpileOnly: false,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
};
