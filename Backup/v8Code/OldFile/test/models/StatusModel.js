const db = require('../config/db');

const User = {

    getAll: (callback) => {
        const sql = 'SELECT * FROM taskstatus';
        db.execute(sql, callback);
    },

    store: (data,callback) => {
        
        const sql = 'INSERT INTO taskstatus (status_name, user_id, color) VALUES (?, ?, ?)';
        db.query(sql, [data.body.staus_name, data.userId, data.body.color], (err, results) => {
            if (err) {
                console.error('Error inserting status:', err);
                return;
            }
        console.log('User inserted with ID:', results.insertId);
        callback(null, {
                user_id: data.user_id,
                status_name: data.body.staus_name,
                color: data.body.color
            });
        });

    },

};

module.exports = User;

