'use strict'

//const mysql = require('mysql')
const connection = require('./db_setup')

module.exports = {

	createDatabase : async () => {
		await connection.query('CREATE DATABASE IF NOT EXISTS matcha');
		await connection.query('USE matcha');
		await connection.query('CREATE TABLE IF NOT EXISTS User('
		// Default fields
			+ 'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,'
			+ 'firstname VARCHAR(30) NOT NULL,'
			+ 'lastname VARCHAR(30) NOT NULL,'
			+ 'username VARCHAR(30) NOT NULL UNIQUE,'
			+ 'email VARCHAR(100) NOT NULL UNIQUE,'
			+ 'password VARCHAR(100) NOT NULL,'
		// Reset password
			+ 'token VARCHAR(100),'
		// Last connection
			+ 'lastCon TIMESTAMP DEFAULT 0,'
		// Complete profile
			+ 'birthdate DATE,'
			+ 'gender ENUM(\'Man\',\'Women\',\'Other\'),'//change by ENUM(MAN, WOMEN, OTHER)
			+ 'orientation ENUM(\'Straight\',\'Gay\',\'Bisexual\'),'//change by ENUM(STRAIGHT, GAY, BISEXUAL)
			+ 'bio VARCHAR(280),'
			+ 'score INT DEFAULT 0,'
		// Verifications
			+ 'isVerified INT DEFAULT 0,'
			+ 'isCompleted INT DEFAULT 0,'
		// Geoloc information
			+ 'latitude FLOAT(10,6) NULL,'
			+ 'longitude FLOAT(10,6) NULL,'
			+ 'address VARCHAR(100) NULL,'
		// Report fake user
			+ 'fake INT DEFAULT 0,' 
		// 42 OAuth
			+ 'id42 INT DEFAULT NULL'
			+  ')', err => { if (err) throw err; 
				console.log('Table \'User\' has been created')
		});

		await connection.query('CREATE TABLE IF NOT EXISTS SocketInfo('
		// SocketInfo fields
			+ 'userid INT NOT NULL,'
			+ 'socketid VARCHAR(42)'
			+  ')', err => { if (err) throw err; 
				console.log('Table \'SocketInfo\' has been created')
		})

		await connection.query('CREATE TABLE IF NOT EXISTS Messages('
		// Messages fields
			+ 'text VARCHAR(280),'
			+ 'senderid INT NOT NULL,'
			+ 'receiverid INT NOT NULL,'
			+ 'sendTime TIMESTAMP DEFAULT 0,'
			+ 'isRead INT DEFAULT 0'
			+  ')', err => { if (err) throw err; 
				console.log('Table \'Messages\' has been created')
		})

		await connection.query('CREATE TABLE IF NOT EXISTS Blacklist('
		// Blacklist fields
			+ 'userid INT NOT NULL,'
			+ 'blockid INT NOT NULL'
			+  ')', err => { if (err) throw err; 
				console.log('Table \'Blacklist\' has been created')
		})

		await connection.query('CREATE TABLE IF NOT EXISTS Popularity('
		// Popularity fields
			+ 'userid INT NOT NULL,'
			+ 'seenbyid INT NOT NULL,'
			+ 'love INT,'
			+ 'seenTime TIMESTAMP DEFAULT 0,'
			+ 'loveTime TIMESTAMP DEFAULT 0'
			+  ')', err => { if (err) throw err; 
				console.log('Table \'Popularity\' has been created')
		});

		await connection.query('CREATE TABLE IF NOT EXISTS Photo('
		// Photo fields
			+ 'userid INT NOT NULL,'
			+ 'srcimg VARCHAR(150) UNIQUE NOT NULL,'
			+ 'profile INT'
			+  ')', err => { if (err) throw err; 
				console.log('Table \'Photo\' has been created')
		});

		await connection.query('CREATE TABLE IF NOT EXISTS Tag('
		// Tag fields
			+ 'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,'
			+ 'tagname VARCHAR(30) UNIQUE'
			+  ')', err => { if (err) throw err; 
				console.log('Table \'Tag\' has been created')
		});

		await connection.query('CREATE TABLE IF NOT EXISTS Usertag('
		// Usertag fields
			+ 'userid INT NOT NULL,'
			+ 'tagid INT NOT NULL'
			+  ')', err => { if (err) throw err; 
				console.log('Table \'Usertag\' has been created')
		});

		await connection.query('CREATE TABLE IF NOT EXISTS Matched('
		// Matched fields
			+ 'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,'
			+ 'userone INT NOT NULL,'
			+ 'usertwo INT NOT NULL,'
			+ 'matchTime TIMESTAMP DEFAULT 0'
			+  ')', err => { if (err) throw err; 
				console.log('Table \'Matched\' has been created')
		});

		await connection.query('CREATE TABLE IF NOT EXISTS Notifications('
		// Notifications fields
			// + 'id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,'
			+ 'senderid INT NOT NULL,'
			+ 'receiverid INT NOT NULL,'
			+ 'notitype VARCHAR(32) NOT NULL,'
			+ 'notitime TIMESTAMP DEFAULT 0,'
			+ 'isRead INT NOT NULL DEFAULT 0'
			+  ')', err => { if (err) throw err; 
				console.log('Table \'Notifications\' has been created')
		});
	}
}