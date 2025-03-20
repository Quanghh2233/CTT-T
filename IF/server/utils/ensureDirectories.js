const fs = require('fs');
const path = require('path');

// Make sure all upload directories exist
const ensureDirectories = () => {
    const dirs = [
        path.join(__dirname, '../../uploads'),
        path.join(__dirname, '../../uploads/avatars'),
        path.join(__dirname, '../../uploads/documents'),
        path.join(__dirname, '../../uploads/thumbnails'),
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(`Creating directory: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Add .gitkeep files to keep directories in git
    dirs.slice(1).forEach(dir => {
        const gitkeepFile = path.join(dir, '.gitkeep');
        if (!fs.existsSync(gitkeepFile)) {
            fs.writeFileSync(gitkeepFile, '');
        }
    });
};

module.exports = ensureDirectories;
