/* Object/Relational mapping for instances of the Email class.
     - classes correspond to tables
     - instances correspond to rows
    - fields correspond to columns
In other words, this code defines how a row in the postgres Email table
maps to the JS Order object.
*/
module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Email", {
    email: {type: DataTypes.STRING, unique: true, allowNull: false}
  });
};