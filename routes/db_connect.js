const express = require('express');
const router = express.Router();
const mysqlDB = require('mysql');
require('dotenv').config();


const mysql = mysqlDB.createConnection({
    host: process.env.dbUrl,
    user: process.env.dbUser,
    password: process.env.dbPass,
    database: process.env.dbName,
    port: 3306
});

mysql.connect((err) => {
    if (err) return console.log(err);
    console.log('connected');
});

module.exports = router;
module.exports.mysql = mysql;