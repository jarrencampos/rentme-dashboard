const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
    });
  });

module.exports = {
  mode: 'development',
  entry: './src/js/index.js',  // Ensure this points to your JS entry
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),  // Output directory for the dev server
    },
    compress: true,
    port: 3000,
  },
  resolve: {
    extensions: ['.js', '.json'],  // Allow these extensions to be resolved
    alias: {
      '@firebase-config': path.resolve(__dirname, 'src/js/firebase-config.js'),  // Alias for Firebase config
    },
  },
  module: {
    rules: [
      // Babel loader for JavaScript files (transpiling ES6+ to ES5)
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
      // CSS file handling and extraction
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
      // Image and font file handling
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      // Handling HTML files
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          preprocessor: processNestedHtml,  // Custom HTML preprocessor
        },
      },
    ],
  },
  plugins: [
    ...generateHTMLPlugins(),  // Automatically generate HTML files from templates
    new MiniCssExtractPlugin({
      filename: 'style.css',  // Extract CSS into a separate file
      chunkFilename: 'style.css',
    }),
  ],
  output: {
    filename: 'bundle.js',  // Output JavaScript bundle
    path: path.resolve(__dirname, 'build'),  // Build directory
    clean: true,  // Clean the build folder before each build
    assetModuleFilename: '[path][name][ext]',  // Asset file names
  },
  target: 'web',  // Target the web platform
  stats: 'errors-only',  // Only log errors in the console
};
