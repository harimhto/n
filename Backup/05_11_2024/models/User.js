const db = require('../config/db');
const bcrypt = require('bcryptjs');

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

     findByUsernameReset: (email, callback) => {
        // console.log(email);
        const sql = 'SELECT * FROM password_resets WHERE email = ?';
        db.execute(sql, [email], callback);
    },
    

    createReset: (email, getToken, callback) => {
        User.findByUsernameReset(email, (err, results) => {
            if (err) {
                return callback(err);
            }
            if (results.length > 0) {
                // User exists, update the password
                const sql = 'UPDATE password_resets SET token = ? WHERE email = ?';
                db.execute(sql, [getToken, email], callback);
            } else {
                // User doesn't exist, insert a new record
                const sql = 'INSERT INTO password_resets (email, token) VALUES (?, ?)';
                db.execute(sql, [email, getToken], callback);
            }
        });
    },


    validtokenReset: (token, callback) => {
        const sql = 'SELECT * FROM password_resets WHERE token = ?';
        db.execute(sql, [token], callback);
    },


    checkTokenReset: (token, password, callback) => {
        
        User.validtokenReset(token, (err, results) => {
           
            if (err) {
                return callback(err); // Pass the error back to the main function
            }

            if (results && results.length > 0) {
                const email = results[0].email;
                const hashedPassword = bcrypt.hashSync(password, 8);

                const sql = 'UPDATE users SET password = ? WHERE email = ?';
                db.execute(sql, [hashedPassword, email], (updateErr, updateResults) => {
                    if (updateErr) {
                        return callback(updateErr); // Handle any update errors
                    }
                    callback(null, { message: "Updated" }); // Send success message
                });
            } else {
                callback(null, { message: "TokenExpairy" });
            }

        });

    },


};

module.exports = User;
