/* Object/Relational mapping for instances of the Classified class.
     - classes correspond to tables
     - instances correspond to rows
     - fields correspond to columns
In other words, this code defines how a row in the postgres Classified table
maps to the JS Classified object.
*/
module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Classified", {
	id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
  	userId: {type: DataTypes.INTEGER, allowNull: true},
  	chargeId: {type: DataTypes.STRING, allowNull: true},
    ownerOrRealtor: {type: DataTypes.STRING, allowNull: false},
    fullNameOwner: {type: DataTypes.STRING, allowNull: true},
    emailOwner: {type: DataTypes.STRING, allowNull: true},
    phoneOwner: {type: DataTypes.STRING, allowNull: true},
    fullNameRealtor: {type: DataTypes.STRING, allowNull: true},
    emailRealtor: {type: DataTypes.STRING, allowNull: true},
    phoneRealtor: {type: DataTypes.STRING, allowNull: true},
    createAccount: {type: DataTypes.STRING, allowNull: true},
    neighborhood: {type: DataTypes.STRING, allowNull: false},
    address: {type: DataTypes.STRING, allowNull: false},
    town: {type: DataTypes.STRING, allowNull: false},
    stateOwner: {type: DataTypes.STRING, allowNull: true},
    zipcode: {type: DataTypes.STRING, allowNull: true},
    longitud: {type: DataTypes.STRING, allowNull: true},
    latitude: {type: DataTypes.STRING, allowNull: true},
    sellOrRent: {type: DataTypes.STRING, allowNull: false},
    property: {type: DataTypes.STRING, allowNull: false},
    year: {type: DataTypes.STRING, allowNull: true},
    bedrooms: {type: DataTypes.DECIMAL, allowNull: false},
    bathrooms: {type: DataTypes.DECIMAL, allowNull: false},
    sqft: {type: DataTypes.INTEGER, allowNull: true},
    storie: {type: DataTypes.STRING, allowNull: true},
    parking: {type: DataTypes.STRING, allowNull: true},
    price: {type: DataTypes.DECIMAL(19, 4) , allowNull: false},
    fees: {type: DataTypes.DECIMAL(19, 4) , allowNull: true},
    accessories: {type: DataTypes.STRING, allowNull: true},
    description: {type: DataTypes.TEXT, allowNull: false},
    extras: {type: DataTypes.STRING, allowNull: true},
    photo1: {type: DataTypes.STRING, allowNull: true},
    photo2: {type: DataTypes.STRING, allowNull: true},
    photo3: {type: DataTypes.STRING, allowNull: true},
    photo4: {type: DataTypes.STRING, allowNull: true},
    photo5: {type: DataTypes.STRING, allowNull: true},
    highlight: {type: DataTypes.STRING, allowNull: true},
    terms: {type: DataTypes.STRING, allowNull: false},
    totalSale: {type: DataTypes.DECIMAL(19, 4) , allowNull: true},
    stripeToken: {type: DataTypes.STRING, allowNull: true},
    endDate: {type: DataTypes.DATE, allowNull: false},
    visible: {type: DataTypes.INTEGER, allowNull: false}
  });
};  