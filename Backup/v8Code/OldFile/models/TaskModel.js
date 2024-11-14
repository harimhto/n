const connection = require('../config/db');

class TaskModel {




static listTasks(filters, spaceId, projectId, callback) {
    let query = `
        SELECT tasklist.*, taskstatus.status_name, taskstatus.color, ts2.name AS assignee_name, taskpriority.color as prColor, taskpriority.priority_name
        FROM tasklist
        LEFT JOIN taskstatus ON taskstatus.id = tasklist.status
        LEFT JOIN taskpriority ON taskpriority.id = tasklist.priority
        LEFT JOIN users ON FIND_IN_SET(users.id, tasklist.assignee) > 0
        LEFT JOIN users ts2 ON ts2.id = tasklist.user_id
        WHERE tasklist.space_id = ? AND tasklist.project_id = ?
    `;

    const queryParams = [spaceId, projectId];

    // Apply filters
    if (filters.status) {
        query += ' AND tasklist.status = ?';
        queryParams.push(filters.status);
    }

    if (filters.assignee && filters.assignee.length > 0) {
        const placeholders = filters.assignee.map(() => '?').join(',');
        query += ` AND tasklist.assignee IN (${placeholders})`;
        queryParams.push(...filters.assignee);
    } else {
        console.log("No assignees provided for filtering. Skipping the assignee filter.");
    }

    if (filters.due_date) {
        query += ' AND DATE(tasklist.due_date) = ?';
        queryParams.push(filters.due_date);
    }

    // Debugging: Log the query and parameters
    console.log("Query:", query);
    console.log("Parameters:", queryParams);

    // Execute query
    connection.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Error fetching tasks:", err);
            return callback(err, null);
        }

        // If tasks are fetched, process to get assignee names
        if (results.length > 0) {
            const assigneeIds = results.flatMap(task => {
                // Check if assignee is valid (not null or empty)
                if (task.assignee) {
                    try {
                        return JSON.parse(task.assignee) || []; // If JSON parse is valid
                    } catch (error) {
                        console.error("Error parsing assignee:", error);
                        // Fallback to split if JSON parsing fails
                        console.log('my type',typeof task.assignee);
                        return typeof task.assignee === 'string' ? task.assignee.split(',') : [];
                    }
                }
                return []; // Return empty array if assignee is null or undefined
            });

            console.log('s',assigneeIds);


            // Get unique assignee IDs
            const uniqueAssigneeIds = [...new Set(assigneeIds)];

            // Fetch assignee names
            this.getAssigneeNames(uniqueAssigneeIds, (err, names) => {

                if (err) return callback(err, null);

                // Attach assignee names to each task
                results.forEach(task => {
                    task.assignee_names = []; // Default to empty array

                    if (task.assignee) {
                        try {
                            const ids = JSON.parse(task.assignee) || [];
                            task.assignee_names = ids.map(id => names.find(name => name.id === id)?.name || '');
                        } catch (error) {
                            console.error("Error parsing task assignee:", error);
                        }
                    }
                });

                callback(null, results);
            });
        } else {
            callback(null, results);
        }
    });
}




static listTasksAfterInsert(lastInsertedId, callback) {
    let query = `
        SELECT tasklist.*, taskstatus.status_name, taskstatus.color, ts2.name AS assignee_name, taskpriority.priority_name
        FROM tasklist
        LEFT JOIN taskstatus ON taskstatus.id = tasklist.status
        LEFT JOIN taskpriority ON taskpriority.id = tasklist.priority
        LEFT JOIN users ON FIND_IN_SET(users.id, tasklist.assignee) > 0
        LEFT JOIN users ts2 ON ts2.id = tasklist.user_id
        WHERE tasklist.id = ?
    `;


    const queryParams = [lastInsertedId];
    // Execute query
    connection.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Error fetching tasks:", err);
            return callback(err, null);
        }

        // If tasks are fetched, process to get assignee names
        if (results.length > 0) {
            const assigneeIds = results.flatMap(task => {
                // Check if assignee is valid (not null or empty)
                if (task.assignee) {
                    try {
                        return JSON.parse(task.assignee) || []; // If JSON parse is valid
                    } catch (error) {
                        console.error("Error parsing assignee:", error);
                        // Fallback to split if JSON parsing fails
                        console.log('my type',typeof task.assignee);
                        return typeof task.assignee === 'string' ? task.assignee.split(',') : [];
                    }
                }
                return []; // Return empty array if assignee is null or undefined
            });

            // Get unique assignee IDs
            const uniqueAssigneeIds = [...new Set(assigneeIds)];

            // Fetch assignee names
            this.getAssigneeNames(uniqueAssigneeIds, (err, names) => {
                if (err) return callback(err, null);

                // Attach assignee names to each task
                results.forEach(task => {
                    task.assignee_names = []; // Default to empty array

                    if (task.assignee) {
                        try {
                            const ids = JSON.parse(task.assignee) || [];
                            task.assignee_names = ids.map(id => names.find(name => name.id === id)?.name || '');
                        } catch (error) {
                            console.error("Error parsing task assignee:", error);
                        }
                    }
                });

                callback(null, results);
            });
        } else {
            callback(null, results);
        }
    });
}


    static getAssigneeNames(assigneeIds, callback) {
        if (assigneeIds.length === 0) {
            return callback(null, []);
        }

        const query = 'SELECT id, name FROM users WHERE id IN (?)';
        connection.query(query, [assigneeIds], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    }


    static viewTask(taskId, callback) {

         const query = `
            SELECT tasklist.*, task_space.space_name, task_space_projects.project_name
            FROM tasklist
            LEFT JOIN task_space ON CAST(task_space.id AS CHAR(255)) = tasklist.space_id
            LEFT JOIN task_space_projects ON CAST(task_space_projects.id AS CHAR(255)) = tasklist.project_id
            WHERE tasklist.id = ?
        `;


        const queryParams = [taskId];

        connection.query(query, queryParams, (err, results) => {
            if (err) {
                console.error("Error fetching task:", err);
                return callback(err, null);
            }

            const taskdata = results.length > 0 ? results[0] : null;

            const response = {
                success: true,
                status: '',
                data: taskdata,
            };

            callback(null, response);
        });
    }






static listTasksDashboard(filters, spaceId, projectId, callback) {
    let query = `
        SELECT tasklist.*, taskstatus.status_name, taskstatus.color, ts2.name AS assignee_name, taskpriority.priority_name
        FROM tasklist
        LEFT JOIN taskstatus ON taskstatus.id = tasklist.status
        LEFT JOIN taskpriority ON taskpriority.id = tasklist.priority
        LEFT JOIN users ON FIND_IN_SET(users.id, tasklist.assignee) > 0
        LEFT JOIN users ts2 ON ts2.id = tasklist.user_id
        WHERE tasklist.space_id = ? AND tasklist.project_id = ?
    `;

    const queryParams = [spaceId, projectId];

    // Apply filters
    if (filters.status) {
        query += ' AND tasklist.status = ?';
        queryParams.push(filters.status);
    }

    if (filters.assignee && filters.assignee.length > 0) {
        const placeholders = filters.assignee.map(() => '?').join(',');
        query += ` AND tasklist.assignee IN (${placeholders})`;
        queryParams.push(...filters.assignee);
    } else {
        console.log("No assignees provided for filtering. Skipping the assignee filter.");
    }

    if (filters.due_date) {
        query += ' AND DATE(tasklist.due_date) = ?';
        queryParams.push(filters.due_date);
    }

    // Debugging: Log the query and parameters
    console.log("Query:", query);
    console.log("Parameters:", queryParams);

    // Execute query
    connection.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Error fetching tasks:", err);
            return callback(err, null);
        }

        // If tasks are fetched, process to get assignee names
        if (results.length > 0) {
            const assigneeIds = results.flatMap(task => {
                // Check if assignee is valid (not null or empty)
                if (task.assignee) {
                    try {
                        return JSON.parse(task.assignee) || []; // If JSON parse is valid
                    } catch (error) {
                        console.error("Error parsing assignee:", error);
                        // Fallback to split if JSON parsing fails
                        console.log('my type',typeof task.assignee);
                        return typeof task.assignee === 'string' ? task.assignee.split(',') : [];
                    }
                }
                return []; // Return empty array if assignee is null or undefined
            });

            // Get unique assignee IDs
            const uniqueAssigneeIds = [...new Set(assigneeIds)];

            // Fetch assignee names
            this.getAssigneeNames(uniqueAssigneeIds, (err, names) => {
                if (err) return callback(err, null);

                // Attach assignee names to each task
                results.forEach(task => {
                    task.assignee_names = []; // Default to empty array

                    if (task.assignee) {
                        try {
                            const ids = JSON.parse(task.assignee) || [];
                            task.assignee_names = ids.map(id => names.find(name => name.id === id)?.name || '');
                        } catch (error) {
                            console.error("Error parsing task assignee:", error);
                        }
                    }
                });

                callback(null, results);
            });
        } else {
            callback(null, results);
        }
    });
}

}

module.exports = TaskModel;



