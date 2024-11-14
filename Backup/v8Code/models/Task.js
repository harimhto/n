const db = require('../config/db');

const Task = {
    create: (task, callback) => {
        const sql = 'INSERT INTO tasks (title, description, userId, status) VALUES (?, ?, ?, ?)';
        db.execute(sql, [task.title, task.description, task.userId, task.status], callback);
    },
    getAll: (callback) => {
        const sql = 'SELECT * FROM tasks';
        db.execute(sql, callback);
    },
    getById: (id, callback) => {
        const sql = 'SELECT * FROM tasks WHERE id = ?';
        db.execute(sql, [id], callback);
    },
    update: (id, task, callback) => {
        const sql = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?';
        db.execute(sql, [task.title, task.description, task.status, id], callback);
    },
    delete: (id, callback) => {
        const sql = 'DELETE FROM tasks WHERE id = ?';
        db.execute(sql, [id], callback);
    },
};

module.exports = Task;
