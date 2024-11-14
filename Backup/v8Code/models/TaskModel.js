const connection = require('../config/db');

class TaskModel {


 static getspace(userId, callback) {
    console.log('userid',userId);

   const queryUsers = `
    SELECT 
        ts.user_id,
        ts.space_display,
        ts.id AS uniquSpaceid,
        tsp.id AS project_id,
        ts.assignee AS space_assignee,
        tsp.assignee AS project_assignee
    FROM 
        task_space ts
    LEFT JOIN 
        task_space_projects tsp ON CAST(ts.id AS CHAR(255)) = CAST(tsp.space_id AS CHAR(255))
    WHERE 
        ts.user_id = ? OR JSON_CONTAINS(ts.assignee, ?) OR JSON_CONTAINS(tsp.assignee, ?)
    GROUP BY 
        ts.id  -- Grouping by the unique space ID
`;


        
        connection.query(queryUsers,  [userId, JSON.stringify(userId), JSON.stringify(userId)], (err, results) => {
            if (err) {
                console.error("Error fetching spaces:", err);
                return callback(err, null);
            }
            // Return the results through the callback
            callback(null, results);
        });
    }

// Old

// static listTasks(filters, spaceId, projectId, callback) {


//     const userId = filters.getuserId;
//     let query = `
//         SELECT tasklist.*, taskstatus.status_name, taskstatus.color, ts2.name AS assignee_name, taskpriority.color as prColor, taskpriority.priority_name
//         FROM tasklist
//         LEFT JOIN taskstatus ON taskstatus.id = tasklist.status
//         LEFT JOIN taskpriority ON taskpriority.id = tasklist.priority
//         LEFT JOIN users ON FIND_IN_SET(users.id, tasklist.assignee) > 0
//         LEFT JOIN users ts2 ON ts2.id = tasklist.user_id
//         Where tasklist.taskshow = 0
//     `;

// console.log('filter Name',filters);
//     // const queryParams = [spaceId, projectId];
//     const queryParams = [];

//     // Apply filters

//     if (spaceId && projectId) {

//     }else{

//     }

//     if (spaceId) {
//         query += ' And tasklist.space_id = ?';
//         queryParams.push(spaceId);
//     }else{
        
//     }

//     if (projectId) {
//         query += ' AND tasklist.project_id = ?';
//         queryParams.push(projectId);
//     }else{
        
//     }

//     if (filters.getPriority) {
//         query += ' AND tasklist.priority = ?';
//         queryParams.push(filters.getPriority);
//     }


//     if (filters.status) {
//         query += ' AND tasklist.status = ?';
//         queryParams.push(filters.status);
//     }

//     if (filters.assignee && filters.assignee.length > 0) {
//         const placeholders = filters.assignee.map(() => '?').join(',');
//         query += ` AND tasklist.assignee IN (${placeholders})`;
//         queryParams.push(...filters.assignee);
//     } else {
//         console.log("No assignees provided for filtering. Skipping the assignee filter.");
//     }

//     if (filters.due_date) {
//         query += ' AND DATE(tasklist.due_date) = ?';
//         queryParams.push(filters.due_date);
//     }

//     // Debugging: Log the query and parameters
//     console.log("Query:", query);
//     // console.log("Parameters:", queryParams);

//     // Execute query
//     connection.query(query, queryParams, (err, results) => {
//         if (err) {
//             console.error("Error fetching tasks:", err);
//             return callback(err, null);
//         }

//         // If tasks are fetched, process to get assignee names
//         if (results.length > 0) {
//             const assigneeIds = results.flatMap(task => {
//                 // Check if assignee is valid (not null or empty)
//                 if (task.assignee) {
//                     try {
//                         return JSON.parse(task.assignee) || []; // If JSON parse is valid
//                     } catch (error) {
//                         console.error("Error parsing assignee:", error);
//                         // Fallback to split if JSON parsing fails
//                         console.log('my type',typeof task.assignee);
//                         return typeof task.assignee === 'string' ? task.assignee.split(',') : [];
//                     }
//                 }
//                 return []; // Return empty array if assignee is null or undefined
//             });

//             console.log('s',assigneeIds);


//             // Get unique assignee IDs
//             const uniqueAssigneeIds = [...new Set(assigneeIds)];

//             // Fetch assignee names
//             this.getAssigneeNames(uniqueAssigneeIds, (err, names) => {

//                 if (err) return callback(err, null);

//                 // Attach assignee names to each task
//                 results.forEach(task => {
//                     task.assignee_names = []; // Default to empty array

//                     if (task.assignee) {
//                         try {
//                             const ids = JSON.parse(task.assignee) || [];
//                             task.assignee_names = ids.map(id => names.find(name => name.id === id)?.name || '');
//                         } catch (error) {
//                             console.error("Error parsing task assignee:", error);
//                         }
//                     }
//                 });

//                 callback(null, results);
//             });
//         } else {
//             callback(null, results);
//         }
//     });
// }




static listTasks(filters, spaceId, projectId, callback) {
    const userId = filters.getuserId;
    

    // Fetch spaces for the user first
    this.getspace(userId, (err, spaces) => {
        if (err) return callback(err, null);

        // Prepare the task query
        let query = `
            SELECT tasklist.*, taskstatus.status_name, taskstatus.color, 
                   ts2.name AS assignee_name, taskpriority.color AS prColor, 
                   taskpriority.priority_name
            FROM tasklist
            LEFT JOIN taskstatus ON taskstatus.id = tasklist.status
            LEFT JOIN taskpriority ON taskpriority.id = tasklist.priority
            LEFT JOIN users ON FIND_IN_SET(users.id, tasklist.assignee) > 0
            LEFT JOIN users ts2 ON ts2.id = tasklist.user_id
            WHERE tasklist.taskshow = 0
        `;

        const queryParams = [];

if (filters.filterData) {
    query += ` AND (tasklist.user_id = ? OR JSON_CONTAINS(tasklist.assignee, JSON_QUOTE(?), '$.id'))`;
    queryParams.push(userId, userId); // Push userId for both placeholders
}



        // Handle spaceId and projectId filtering
        if (spaceId && projectId) {
            // Both spaceId and projectId are provided
            query += ' AND tasklist.space_id = ?';
            queryParams.push(spaceId);
            query += ' AND tasklist.project_id = ?';
            queryParams.push(projectId);
        } else if (spaceId) {
            // Only spaceId is provided
            query += ' AND tasklist.space_id = ?';
            queryParams.push(spaceId);
        } else if (projectId) {
            // Only projectId is provided
            query += ' AND tasklist.project_id = ?';
            queryParams.push(projectId);
        } else {
            
            // If both spaceId and projectId are not provided, filter by user's spaces
            if (spaces.length > 0) {
                const spaceIds = spaces.map(space => space.uniquSpaceid);
                const placeholders = spaceIds.map(() => '?').join(',');
                query += ` AND tasklist.space_id IN (${placeholders})`;
                queryParams.push(...spaceIds);
            } else {
                // No spaces found for the user, return no tasks
                return callback(null, []);
            }
        }

        // Apply additional filters


        if (filters.filterData && ( filters.filterData['value2'] == 'priority' ) && filters.filterData['value'] ) {
            query += ' AND tasklist.priority = ?';
            queryParams.push(filters.filterData['value']);
        }


         if (filters.filterData && ( filters.filterData['value2'] == 'status' ) && filters.filterData['value'] ) {
            query += ' AND tasklist.status = ?';
            queryParams.push(filters.filterData['value']);
        }

        if (filters.status) {
            query += ' AND tasklist.status = ?';
            queryParams.push(filters.status);
        }

        if (filters.assignee && filters.assignee.length > 0) {
            const placeholders = filters.assignee.map(() => '?').join(',');
            query += ` AND tasklist.assignee IN (${placeholders})`;
            queryParams.push(...filters.assignee);
        }

        if (filters.due_date) {
            query += ' AND DATE(tasklist.due_date) = ?';
            queryParams.push(filters.due_date);
        }

        // Log the query and parameters for debugging
        console.log("Query:", query);
        console.log("Parameters:", queryParams);

        // Execute the main query
        connection.query(query, queryParams, (err, results) => {
            if (err) {
                console.error("Error fetching tasks:", err);
                return callback(err, null);
            }

            // Process results to get assignee names
            if (results.length > 0) {
                const assigneeIds = results.flatMap(task => {
                    if (task.assignee) {
                        try {
                            return JSON.parse(task.assignee) || [];
                        } catch (error) {
                            console.error("Error parsing assignee JSON:", error);
                            return typeof task.assignee === 'string' ? task.assignee.split(',') : [];
                        }
                    }
                    return [];
                });

                // Get unique assignee IDs
                const uniqueAssigneeIds = [...new Set(assigneeIds)];

                // Fetch assignee names
                this.getAssigneeNames(uniqueAssigneeIds, (err, names) => {
                    if (err) return callback(err, null);

                    // Attach assignee names to each task
                    results.forEach(task => {
                        task.assignee_names = [];
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
                callback(null, results); // No tasks found, return empty results
            }
        });
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



