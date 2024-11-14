const connection = require('../config/db');

class TaskActivity {
    static getTaskActivities(taskId, callback) {
        const query = `
            SELECT taskactivitydetails.*, 
                   taskstatus.status_name, 
                   taskstatus.color, 
                   taskpriority.priority_name, 
                   users.name, users.color
            FROM taskactivitydetails
            LEFT JOIN taskstatus ON CAST(taskstatus.id AS CHAR(255)) = taskactivitydetails.up_status
            LEFT JOIN taskpriority ON CAST(taskpriority.id AS CHAR(255)) = taskactivitydetails.up_priority
            LEFT JOIN users ON CAST(users.id AS CHAR(255)) = 
                CASE 
                    WHEN taskactivitydetails.update_user_id IS NULL
                    THEN taskactivitydetails.up_user_id
                    ELSE taskactivitydetails.update_user_id
                END
            WHERE taskactivitydetails.task_primary_id = ?
            ORDER BY taskactivitydetails.id
        `;

        console.log('Executing Query:', query, taskId); // Debugging step to log the query and taskId

        connection.query(query, [taskId], (err, records) => {
            if (err) return callback(err);
            callback(null, records);
        });
    }
}

module.exports = TaskActivity;
