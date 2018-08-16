/**
 *  * Require Browsersync along with webpack and middleware for it
 *   */
var browserSync = require('browser-sync').create();
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var stripAnsi = require('strip-ansi');

/**
 *  * Require ./webpack.config.js and make a bundler from it
 *   */
var webpackConfigPromise = require('../webpack.config');

async function main() {
  var webpackConfig = await webpackConfigPromise;
  var bundler = webpack(webpackConfig);

  /**
   *  * Reload all devices when bundle is complete
   *   * or send a fullscreen error message to the browser instead
   *    */
  bundler.plugin('done', function(stats) {
    if (stats.hasErrors() || stats.hasWarnings()) {
      return browserSync.sockets.emit('fullscreen:message', {
        title: 'Webpack Error:',
        body: stripAnsi(stats.toString()),
        timeout: 100000,
      });
    }
    browserSync.reload();
  });

  /**
   *  * Run Browsersync and use middleware for Hot Module Replacement
   *   */
  browserSync.init({
    server: 'server',
    open: false,
    logFileChanges: false,
    middleware: [
      webpackDevMiddleware(bundler, {
        publicPath: undefined,
        stats: {colors: true},
      }),
    ],
    plugins: ['bs-fullscreen-message'],
    files: ['css/**/*.css', 'src/**/*.js', 'index.html'],
  });
}

main()
  .then(function() {
    console.log("done");
  })
  .catch(function(err) {
    console.error(err);
  });


