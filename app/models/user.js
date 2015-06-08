var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  // hasTimestamps: true,

  links: function () {
    // do we need a foreign key for this
    return this.belongsToMany(Link);
  },
  initialize: function () {
    // this.on('creating', function (mode, attrs, options) {
    //   // this.get('username')
    //   // this.get('password')
    //   // console.log(this.get('username'));
    //   // console.log(this.get('password'));
    //   var username = this.get('username')
    //   var password = bcrypt.hash(this.get('password'), null, null, function (err, hash) {
    //     this.set('password', hash);
        // console.log(password);
    //   })

    // })
  }

});

module.exports = User;
