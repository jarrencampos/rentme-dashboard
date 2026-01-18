const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Determine build mode
const isProduction = process.env.NODE_ENV === 'production';

// Custom HTML preprocessor logic
const INCLUDE_PATTERN = /<include src="(.+)"\s*\/?>(?:<\/include>)?/gi;
const processNestedHtml = (content, loaderContext, dir = null) =>
  !INCLUDE_PATTERN.test(content)
    ? content
    : content.replace(INCLUDE_PATTERN, (m, src) => {
        const filePath = path.resolve(dir || loaderContext.context, src);
        loaderContext.dependency(filePath);
        return processNestedHtml(
          loaderContext.fs.readFileSync(filePath, 'utf8'),
          loaderContext,
          path.dirname(filePath)
        );
      });

// Generate HTML Plugins from the src folder
const generateHTMLPlugins = () =>
  glob.sync('./src/*.html').map((filePath) => {
    const filename = path.basename(filePath);
    return new HtmlWebpackPlugin({
      filename,
      template: filePath,
      favicon: './src/images/favicon.ico',
      inject: 'body',
      minify: isProduction ? {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      } : false,
    });
  });

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/js/index.js',

  // Source maps for debugging
  devtool: isProduction ? 'source-map' : 'eval-source-map',

  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
  },

  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src/js'),
    },
  },

  module: {
    rules: [
      // Babel loader for JavaScript
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              [
                'prismjs',
                {
                  languages: ['javascript', 'css', 'markup'],
                  plugins: ['copy-to-clipboard'],
                  css: true,
                },
              ],
            ],
          },
        },
      },
      // CSS handling
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer')({
                    overrideBrowserslist: ['last 2 versions'],
                  }),
                ],
              },
            },
          },
        ],
      },
      // Images
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: isProduction ? 'images/[name].[contenthash:8][ext]' : 'images/[name][ext]',
        },
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
      // HTML
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          preprocessor: processNestedHtml,
        },
      },
    ],
  },

  plugins: [
    ...generateHTMLPlugins(),
    new MiniCssExtractPlugin({
      filename: isProduction ? 'css/style.[contenthash:8].css' : 'css/style.css',
    }),
  ],

  output: {
    filename: isProduction ? 'js/bundle.[contenthash:8].js' : 'js/bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
    publicPath: '/',
  },

  // Performance hints
  performance: {
    hints: isProduction ? 'warning' : false,
    maxAssetSize: 500000,
    maxEntrypointSize: 500000,
  },

  target: 'web',
  stats: isProduction ? 'normal' : 'errors-warnings',
};
