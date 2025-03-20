module.exports = (sequelize, DataTypes) => {
    const Document = sequelize.define('Document', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        filePath: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fileSize: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fileType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.ENUM('regulation', 'report', 'form', 'plan', 'official', 'other'),
            defaultValue: 'other'
        },
        downloadCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true
    });

    return Document;
};
