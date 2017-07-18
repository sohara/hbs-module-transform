/* eslint-env node */
'use strict';
const AddPath = require('./lib/add-path');

module.exports = {
  name: 'hbs-module-transform',

  included () {

    // Thanks to ember-cli-mirage for the following addon directory lookup
    // example
    var app;

    // If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll
    //     // just use that.
    if (typeof this._findHost === 'function') {
      app = this._findHost();
    } else {
      // Otherwise, we'll use this implementation borrowed from the _findHost()
      // method in ember-cli.
      var current = this;
      do {
        app = current.app || app;
      } while (current.parent.parent && (current = current.parent));
    }
    this.app = app;
    this.addonConfig = this.app.project.config(app.env)['hbs-module-transform'] || {};
    this._super.included.apply(this, arguments);
  },

  setupPreprocessorRegistry(_, registry) {
    var env = registry.app.env;
    if (env) {
      AddPath.prototype.environment = env;
      AddPath.prototype.addon = this;
    }

    registry.add('htmlbars-ast-plugin', {
      name: 'translate-tt-helper-to-t-helper-with-module',
      plugin: AddPath,
      baseDir: function() {
        return __dirname;
      }
    });
  },

  isDevelopingAddon: function() {
    return true;
  }
};
