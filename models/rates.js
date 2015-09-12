/* Object/Relational mapping for instances of the Rates class.
 - classes correspond to tables
 - instances correspond to rows
 - fields correspond to columns
 In other words, this code defines how a row in the postgres Rates table
 maps to the JS Order object.
*/
var http = require('http');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Rates", {
		id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
		date: {type: DataTypes.DATE, allowNull: false},
		thirtyYear: {type: DataTypes.STRING, allowNull: true},
		fifteenYear: {type: DataTypes.STRING, allowNull: true},
    }, {
		classMethods: {
			getRates: function(successcb, errcb) {
				var _Rates = this;
				http.get("http://www.zillow.com/webservice/GetRateSummary.htm?zws-id="+process.env.ZILLOW_API_KEY+"&output=json", function(res) {
					
					console.log("Call to Zillow API");
					var body = "";
					var data;
					
					res.on('data', function(chunk) {
						console.log("CHUNK: " + chunk);
						
						body += chunk; 
						console.log("Getting....: ");
					}); 
				
					res.on('end', function() {
						data = JSON.parse(body);
						console.log("30 year: "+data.response.today.thirtyYearFixed );
						console.log("15 year: "+data.response.today.fifteenYearFixed );
						
						if(data.message.code == '0') {
							var newRates = _Rates.build({   
								date: new Date(),
								thirtyYear: data.response.today.thirtyYearFixed,
								fifteenYear: data.response.today.fifteenYearFixed
							});
				
							newRates.save().success(function (savedData) {
								console.log("New Rates Stored!!! :" + JSON.stringify(savedData));
							}).error(function(error) {
								console.log("Error Storing Rates Info. Msg: "+error);
							});
						}

					});
				
					res.on('error', function(err) {
						console.log("Error Getting Data From ZILLOW: "+err);
					});
			
				});
				console.log("Waiting for response....");
			}
		}
    });
};
