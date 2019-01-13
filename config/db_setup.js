'use strict'

const mysql = require('mysql')
require('dotenv').config()

let connection = mysql.createConnection({
  host     : process.env.HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : 'matcha'
});

connection.connect();

module.exports = connection