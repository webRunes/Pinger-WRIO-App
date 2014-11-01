"use strictk";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    facebookID: {
      type:DataTypes.STRING
    }, 
    profileURI: {
      type:DataTypes.STRING,
      defaultValue: 'n/a'
    },
    signInDate: {
      type: DataTypes.DATE
    },
    lastVisitDate: {
      type: DataTypes.DATE
    },
    invitedBy: {
      type: DataTypes.STRING,
      defaultValue: 'n/a'
    },
    userID: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    lastName: {
      type: DataTypes.STRING
    },
    firstName: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: false,
    tableName: 'webRunes_Login-Facebook'
  });

  return User;
}
