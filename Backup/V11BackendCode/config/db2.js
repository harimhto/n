const dotenv = require('dotenv');

dotenv.config();


module.exports = {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_PASSWORD,
    host: process.env.DB_PASSWORD,
    dialect: process.env.DB_DIALECT,
};