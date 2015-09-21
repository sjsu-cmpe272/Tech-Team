/* Object/Relational mapping for instances of the Users class.
     - classes correspond to tables
     - instances correspond to rows
    - fields correspond to columns
In other words, this code defines how a row in the postgres Users table
maps to the JS Order object.
*/

module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Users", {
    username: {type: DataTypes.STRING, allowNull: true},
    password: {type: DataTypes.TEXT, allowNull: true},
    category: {type: DataTypes.STRING, allowNull: false},
  	provider: {type: DataTypes.STRING, allowNull: false},
  	id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
  	customerId: {type: DataTypes.STRING, allowNull: true},
  	displayName: {type: DataTypes.STRING, allowNull: false},
  	email: {type: DataTypes.STRING, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false},
    photos:{type: DataTypes.STRING, allowNull: true},
    salt: {type: DataTypes.TEXT, allowNull: true},
    hash: {type: DataTypes.TEXT, allowNull: true}
  });
};  