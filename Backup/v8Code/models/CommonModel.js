const db = require('../config/db');


class CommonModel {
    static getInviteOwnerByIdold(userId, callback) {
        const query = 'SELECT invite_owner FROM users WHERE id = ?';
        db.query(query, [userId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]);
        });
    }

    static getUsersByIdsold(userIds, callback) {
        const query = 'SELECT * FROM users WHERE id IN (?)';
        db.query(query, [userIds], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    }

// new code
    static getInviteOwnerById(userId, callback) {
        const query = 'SELECT invite_email FROM account_invite_users WHERE status = "Accepted" and user_id = ? GROUP BY invite_email';
        db.query(query, [userId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    }

    static getUsersByIds(userIds, callback) {
        const query = 'SELECT * FROM users WHERE email IN (?)';
        db.query(query, [userIds], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    }
}

module.exports = CommonModel;
