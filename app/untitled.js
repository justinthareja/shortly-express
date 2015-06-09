var db = require('./config.js');
db.knex.raw('drop table "urls_users" ;').then(function () {
  console.log('dropped tables');
});
