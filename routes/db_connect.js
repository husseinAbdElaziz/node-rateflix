const express = require('express');
const router = express.Router();
const mysqlDB = require('mysql');
require('dotenv').config();

let mysql;

function handleDisconnect() {
    mysql = mysqlDB.createPool({
        connectionLimit: 100,
        host: process.env.dbUrl,
        user: process.env.dbUser,
        password: process.env.dbPass,
        database: process.env.dbName,
        port: 3306
    });
    mysql.getConnection(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('db connected');
        }
    });
    mysql.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = router;
module.exports.mysql = mysql;