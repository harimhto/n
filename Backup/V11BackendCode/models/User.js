const db = require('../config/db');

const User = {
    create: (username, password, callback) => {
        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.execute(sql, [username, password], callback);
    },
    findByUsername: (email, callback) => {
        // console.log(email);
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.execute(sql, [email], callback);
    },

    getById: (userId, callback) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.execute(sql, [userId], callback);
    },
    getAll: (callback) => {
        const sql = 'SELECT * FROM tasklist';
        db.execute(sql, callback);
    },

    update: (userId, data, callback) => {
        const sql = 'UPDATE users SET name = ? WHERE id = ?';
        db.execute(sql, [data.name, userId], callback);
    },

};

module.exports = User;
