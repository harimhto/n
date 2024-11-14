const db = require('../config/db');


class SpaceModel {
    static async getUserSpaces(userId) {
        const sql = `
            SELECT 
                task_space.user_id,
                task_space.space_name,
                task_space.space_description,
                task_space.space_display,
                task_space.created_at,
                task_space.id AS uniquSpaceid,
                task_space_projects.project_name,
                task_space_projects.id AS project_id
            FROM task_space
            LEFT JOIN task_space_projects 
                ON CAST(task_space.id AS CHAR) = task_space_projects.space_id
            WHERE task_space.user_id = ? 
                OR JSON_CONTAINS(task_space.assignee, ?) 
                OR JSON_CONTAINS(task_space_projects.assignee, ?);
        `;
        const [rows] = await db.query(sql, [userId, JSON.stringify(userId), JSON.stringify(userId)]);
        return rows;
    }

    static getSpacesByUserId(userId, callback) {
        const query = 'SELECT * FROM task_space WHERE user_id = ? AND space_display = 1';
        db.query(query, [userId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    }
}




module.exports = SpaceModel;
