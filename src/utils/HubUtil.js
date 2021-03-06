import _ from 'underscore';
import request from 'request';
import accountServerActions from '../actions/AccountServerActions';
import metrics from './MetricsUtil';
import log from '../stores/LogStore';

let HUB_ENDPOINT = process.env.HUB_ENDPOINT || 'https://vpn.ht';

var defaultSettings = {
    launchStartup: false,
    connectLaunch: false,
    saveCredentials: false,
    disableSmartdns: false,
    autoPath: true,
    encryption: 128,
    minToTaskbar: true
};

module.exports = {

  username: function () {
    return localStorage.getItem('auth.username') || null;
  },

  credentials: function () {
    let config = this.config();
    if (!config) {
      return {
          username: null,
          password: null
      };
    }

    let [username, password] = this.creds(config);
    return {username, password};
  },

  config: function () {
    let config = localStorage.getItem('auth.config');
    if (!config) {
      return null;
    }
    return config;
  },

  settings: function (item) {
    var haveDefault = null,
        value = localStorage.getItem('settings.'+item);

    // hack to parse the local storage type and fully
    // backward compatible
    try {
        value = JSON.parse(value);
    } catch(e) {
        if (value === 'true' || 'false') {
            value = (value === 'true') ? true : false;
        }
    }

    if (defaultSettings[item] && value === null) {
        value = defaultSettings[item];
    }

    return value;

  },

  saveSettings: function (key, value, callback) {
    log.info('Preferences | ' + key + ' = ' + value);
    localStorage.setItem('settings.'+key, JSON.stringify(value));
    if (callback) { callback(); }
  },

  loggedin: function () {
    return this.config();
  },

  logout: function () {
    accountServerActions.loggedout();
    localStorage.removeItem('auth.username');
    localStorage.removeItem('auth.config');
  },

  saveLogin: function (username, password, callback) {
    log.info('Username and password saved for future use');
    localStorage.setItem('auth.username', username);
    localStorage.setItem('auth.config', new Buffer(username + ':' + password).toString('base64'));
    accountServerActions.loggedin({username});
    if (callback) { callback(); }
  },

  creds: function (config) {
    return new Buffer(config, 'base64').toString().split(/:(.+)?/).slice(0, 2);
  }

};
