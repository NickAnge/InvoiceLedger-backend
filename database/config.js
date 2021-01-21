const Sequelize = require('sequelize');

//Connectoion with database
module.exports = new Sequelize('mydb', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres',/* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});


