module.exports = (sequelize, DataTypes) => {
    const News = sequelize.define('News', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        thumbnail: {
            type: DataTypes.STRING,
            allowNull: true
        },
        category: {
            type: DataTypes.ENUM('announcement', 'policy', 'event', 'training', 'report', 'other'),
            defaultValue: 'other'
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true
    });

    return News;
};
