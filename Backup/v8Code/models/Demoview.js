const db = require('../config/db');

const Task = {
    create: (task, callback) => {
        const sql = 'INSERT INTO tasks (title, description, userId, status) VALUES (?, ?, ?, ?)';
        db.execute(sql, [task.title, task.description, task.userId, task.status], callback);
    },
    
    getAll: (filters, userId, spaceId, projectId, callback) => {
        // Base query with left joins
        let sql = `
            SELECT 
                tasklist.*, 
                taskstatus.status_name, 
                taskstatus.color, 
                taskpriority.priority_name,
                GROUP_CONCAT(users.name) AS assignee_names
            FROM tasklist
            LEFT JOIN taskstatus ON taskstatus.id = tasklist.status
            LEFT JOIN taskpriority ON taskpriority.id = tasklist.priority
            LEFT JOIN users ON FIND_IN_SET(users.id, tasklist.assignee) > 0
            WHERE tasklist.space_id = ? AND tasklist.project_id = ?
            AND (tasklist.owner_id = ? OR JSON_CONTAINS(tasklist.assignee, ?) OR tasklist.assignee = ?)
            GROUP BY tasklist.id
        `;

        const params = [spaceId, projectId, userId, JSON.stringify(userId), userId];

        // Apply filters
        if (filters.status) {
            sql += ' AND tasklist.status = ?';
            params.push(filters.status);
        }

        if (filters.assignee) {
            sql += ' AND tasklist.assignee LIKE ?';
            params.push(`%${filters.assignee}%`);
        }

        if (filters.due_date) {
            sql += ' AND DATE(tasklist.due_date) = ?';
            params.push(filters.due_date);
        }

        // Execute the query
        db.execute(sql, params, (err, results) => {
            if (err) {
                return callback(err, null); // Handle error
            }
            callback(null, results); // Return results
        });
    },

    getById: (id, callback) => {
        const sql = 'SELECT * FROM tasks WHERE id = ?';
        db.execute(sql, [id], callback);
    },

    getAlle: (callback) => {
        const sql = 'SELECT * FROM tasklist WHERE id = 114';
        db.execute(sql, callback);
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
