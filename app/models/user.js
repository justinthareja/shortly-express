var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({

  tableName: 'users',

  initialize: function () {
    this.on('creating', this.hashPassword);
  },

  hashPassword: function () {
    var encrypt = Promise.promisify(bcrypt.hash);
    var vanillaPwd = this.get('password');

    // need to return a promise in order to ensure the db gets saved with the hashed password
    return encrypt(vanillaPwd, null, null)
      .bind(this)
      .then(function (hash) {
        this.set('password', hash);
      });
  },

  matchPasswords: function(loginPwd, hashPwd) {
    var decrypt = Promise.promisify(bcrypt.compare);
    return decrypt(loginPwd, hashPwd);
  }
});

module.exports = User;