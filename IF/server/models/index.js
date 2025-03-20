const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const config = require('../config/config');

// Initialize Sequelize
const sequelize = new Sequelize({
    dialect: config.database.dialect,
    storage: config.database.storage,
    logging: false
});

// Import models
const User = require('./user.model')(sequelize, DataTypes);
const Department = require('./department.model')(sequelize, DataTypes);
const News = require('./news.model')(sequelize, DataTypes);
const Document = require('./document.model')(sequelize, DataTypes);

// Define associations
User.belongsTo(Department);
Department.hasMany(User);

News.belongsTo(User, { as: 'author', foreignKey: 'UserId' });
User.hasMany(News);

Document.belongsTo(User, { as: 'uploader', foreignKey: 'UserId' });
User.hasMany(Document);

Document.belongsTo(Department);
Department.hasMany(Document);

// Export models and sequelize instance
module.exports = {
    sequelize,
    User,
    Department,
    News,
    Document
};
