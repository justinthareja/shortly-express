var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link.js');

var User = db.Model.extend({
  tableName: 'users',
  // hasTimestamps: true,

  links: function () {
    // do we need a foreign key for this
    return this.belongsToMany(Link);
  },
  initialize: function () {
    // console.log('users model fired');
  }

});

module.exports = User;

