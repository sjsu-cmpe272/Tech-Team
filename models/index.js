/* In this file we set the connection to the Database...
either locally or remotely, depending on the development stage.
*/
if (!global.hasOwnProperty('db')) {
    console.log("hasOwnProperty section....");
    var Sequelize = require('sequelize');
    var sq = null;
    var fs = require('fs');
    var path = require('path');
    var PGPASS_FILE = path.join(__dirname, '../.pgpass');
    if (process.env.DATABASE_URL) {
        console.log("We are on Amazon Database....");
        /* Remote database, We will be parsing a connection
           string of the form:
           postgres://bucsqywelrjenr:ffGhjpe9dR13uL7anYjuk3qzXo@\
           ec2-54-221-204-17.compute-1.amazonaws.com:5432/d4cftmgjmremg1
        */
        var pgregex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
        var match = process.env.DATABASE_URL.match(pgregex);
        var user = match[1];
        var password = match[2];
        var host = match[3];
        var port = match[4];
        var dbname = match[5];

        var config =  {
            dialect:  'postgres',
            protocol: 'postgres',
            port:     port,
            host:     host,
            logging:  console.log
        };

        sq = new Sequelize(dbname, user, password, config);
    } else {
        console.log("We are on Local ec2 Database....");
        /* Local database
           We parse the .pgpass file for the connection string parameters.
           For Running Locally in EC2 Instance
         */
    	var pgtokens = fs.readFileSync(PGPASS_FILE).toString().trimRight().split(':');
        var host = pgtokens[0];
        var port = pgtokens[1];
        //var port = "8080";
        var dbname = pgtokens[2];
        var user = pgtokens[3];
        var password = pgtokens[4];

        console.log("Host: "+host);
        console.log("Port: "+port);
        console.log("dbname: "+dbname);
        console.log("User: "+user);
        console.log("Password: "+password);
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
        var sq = new Sequelize(dbname, user, password, config);
        console.log("We are configuring the db variable...");
    }
    global.db = {
        Sequelize: Sequelize,
        sequelize: sq,
		Email: sq.import(__dirname + '/email'),
        Users: sq.import(__dirname + '/users')
        //Classified: sq.import(__dirname + '/classified')
        //Rates: sq.import(__dirname + '/rates')
    };
}
console.log("We are Going to Export the DB Var...");

module.exports = global.db;
