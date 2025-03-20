const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');

const resetDatabase = async () => {
    try {
        console.log('Closing any existing database connections...');
        await sequelize.close();

        console.log('Deleting database file...');
        const dbPath = path.join(__dirname, '../../database.sqlite');

        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
            console.log('Database file deleted successfully.');
        } else {
            console.log('Database file does not exist. Nothing to delete.');
        }

        console.log('Database reset complete.');
        console.log('Now you can run "npm run init-db" to initialize the database with fresh data.');

    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }

    process.exit(0);
};

// Run the reset process
resetDatabase();
