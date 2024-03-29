// const nodeExternals = require("webpack-node-externals");
const serverlessWebpack = require("serverless-webpack");

module.exports = {
  devtool: "inline-cheap-module-source-map",
  entry: serverlessWebpack.lib.entries,
  mode: serverlessWebpack.lib.webpack.isLocal ? "development" : "production",
  module: {
    rules: [],
  },
  node: false,
  //   externals: [nodeExternals()],
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: [".js"],
  },
  target: "node",
};
