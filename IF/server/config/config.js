require('dotenv').config();

module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'mof-secret-key',
    database: {
        name: process.env.DB_NAME || 'database',
        dialect: 'sqlite',
        storage: './database.sqlite'
    }
};
