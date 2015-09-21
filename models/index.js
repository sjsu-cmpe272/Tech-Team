/* Set Connection to Database: Remotely or Locally */
if (!global.hasOwnProperty('db')) {
    console.log("hasOwnProperty section....");
    var Sequelize = require('sequelize');
    var sq = null;
    var fs = require('fs');
    var path = require('path');
    var PGPASS_FILE = path.join(__dirname, '../.pgpass');

    /* Remote database... Normally Amazon RDS Postgres */
    if (process.env.DATABASE_URL) {
        console.log("We are on Amazon Database....");

        var pgregex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
        var match = process.env.DATABASE_URL.match(pgregex);
        var user = match[1];
        var password = match[2];
        var host = match[3];
        var port = match[4];
        var dbname = match[5];

        //For Running Remotely on Amazon RDS
        /*
         var host = process.env.RDS_HOSTNAME;
         var port = process.env.RDS_PORT;
         var dbname = process.env.RDS_DBNAME;
         var user = process.env.RDS_USERNAME;
         var password = process.env.RDS_PASSWORD;
         */

        var config =  {
            dialect:  'postgres',
            protocol: 'postgres',
            port:     port,
            host:     host,
            logging:  console.log
        };
 /* hello  work*/
        sq = new Sequelize(dbname, user, password, config);
    } else {
        /* Local database installed on ec2 - Postgres */
        console.log("We are on Local ec2 Database....");

    	var pgtokens = fs.readFileSync(PGPASS_FILE).toString().trimRight().split(':');
        var host = pgtokens[0];
        var port = pgtokens[1];
        var dbname = pgtokens[2];
        var user = pgtokens[3];
        var password = pgtokens[4];
        
        var config =  {
            dialect:  'postgres',
            protocol: 'postgres',
            port:     port,
            host:     host,
            logging:  console.log
        };

        sq = new Sequelize(dbname, user, password, config);
    }
    global.db = {
        Sequelize: Sequelize,
        sequelize: sq,
        Users: sq.import(__dirname + '/users')
    };
}
console.log("We are Going to Export the DB Var...");

module.exports = global.db;
