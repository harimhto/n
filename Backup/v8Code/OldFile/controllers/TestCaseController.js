const connection = require('../config/db.js'); // Adjust the path
const TaskModel = require('../models/TaskModel'); // Adjust the path

exports.demoList = (req, res) => {

  const query = `
    SELECT tasklist.*, task_space.space_name, task_space_projects.project_name
    FROM tasklist
    LEFT JOIN task_space ON CAST(task_space.id AS CHAR(255)) = tasklist.space_id
    LEFT JOIN task_space_projects ON CAST(task_space_projects.id AS CHAR(255)) = tasklist.project_id
  `;

  const queryParams = [1];  // You can make this dynamic by taking from req.params or req.query.

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching task:", err);
      return res.status(500).json({ success: false, message: 'Error fetching task', error: err });
    }

    const taskdata = results;

    const response = {
      success: true,
      status: 'Data fetched successfully',
      data: taskdata,
    };

    // Send the response as JSON
    return res.status(200).json(response);
  });

};

exports.demoList2 = (req, res) => {

	const filters = req.body; // Assuming filters are sent in the request body
    const spaceId = 4;
    const projectId = 4;
    const userId = 4; // Assuming userId is set by middleware

    TaskModel.listTasksDashboard(filters, spaceId, projectId, (err, tasks) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }

        // Process tasks to get assignee names
        const tasksWithAssigneeNames = tasks.map(task => {
            // const assigneeIds = JSON.parse(task.assignee) || task.assignee.split(',');

            const assigneeIds = (task.assignee && task.assignee.length > 0) 
            ? JSON.parse(task.assignee) || task.assignee.split(',')
            : [];
            return {
                ...task,
                assignee_names: []
            };
        });

        const allAssigneeIds = [...new Set(tasksWithAssigneeNames.flatMap(task => task.assignee_ids))];

        TaskModel.getAssigneeNames(allAssigneeIds, (err, names) => {
            if (err) {
                console.error('Error fetching assignee names:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                });
            }

            tasksWithAssigneeNames.forEach(task => {
                task.assignee_names = names.filter((name, index) => allAssigneeIds.includes(task.assignee_ids[index]));
            });

            return res.json({
                success: true,
                data: tasksWithAssigneeNames
            });
        });
        
    });

};
exports.tasklistCount = (req, res) => {
    // Assuming `user_id` and `assignee` are coming from the request body
const user_id =  req.userId;  // Fallback to '1' if not provided
const project_id = req.body.valprojectId; 
const space_id = req.body.spaceId; 
const myRoll = req.body.myRoll || 'admin';  // Role of the user


// let query = `
//     SELECT tl.assignee, ts.status_name, tl.user_id, COUNT(tl.id) as totalTask
//     FROM tasklist tl
//     LEFT JOIN taskstatus ts ON ts.id = tl.status
// `;

// // Add a conditional WHERE clause based on the role
// if (myRoll !== 'admin') {
//     query += `
//         WHERE tl.user_id = ? 
//         AND JSON_CONTAINS(tl.assignee, '1')
//     `;
// }

// // Finalize query by adding GROUP BY clause
// query += `
//     GROUP BY ts.status_name;
// `;


// let query = `
//     SELECT tl.assignee, ts.status_name, tl.status, ts.color, tl.user_id, COUNT(tl.id) as totalTask
//     FROM tasklist tl
//     LEFT JOIN taskstatus ts ON ts.id = tl.status
//     WHERE tl.user_id = ? 
// `;


// // if (valprojectId) {
// //     query += ` 
// //         AND tl.space_id = ? 
// //         AND tl.project_id = ? 
// //     `; 
// // }

// // Add a conditional check for assignee JSON array if the role is not admin
// if (myRoll !== 'admin') {
//     query += ` 
//         OR JSON_CONTAINS(tl.assignee,'[${user_id}]')
//     `;
// }


// // Finalize query by adding GROUP BY clause
// query += `
//     GROUP BY ts.status_name;
// `;



// let query = `
//     SELECT tl.assignee, ts.status_name, tl.status, ts.color, tl.user_id, COUNT(tl.id) as totalTask
//     FROM tasklist tl
//     LEFT JOIN taskstatus ts ON ts.id = tl.status
// `;
// // Add a conditional check for assignee JSON array if the role is not admin
// if (myRoll !== 'admin') {
    
// }


// if (valprojectId) {

//     query += `WHERE tl.space_id = ? 
//     AND tl.project_id = ?
//     AND (JSON_CONTAINS(tl.assignee, '[${user_id}]') OR tl.user_id = ?)
//     `;
// }else{

//     // query += `WHERE tl.user_id = ?
//     // OR JSON_CONTAINS(tl.assignee,'[${user_id}]')
//     // `;

// }
// console.log('qyery',query);


    // Execute the query with the dynamic user_id and assignee
    // connection.query(query, [user_id, spaceId, valprojectId], (err, results) => {

let query = `
    SELECT 
        tl.assignee, 
        ts.status_name, 
        ts.color, 
        tl.user_id,
        COUNT(tl.id) as totalTask,
        SUM(CASE WHEN CAST(tl.priority AS UNSIGNED) = 2 THEN 1 END) as totalPriority
    FROM 
        tasklist tl
    LEFT JOIN 
        taskstatus ts ON ts.id = tl.status
`;

// Add a conditional check for assignee JSON array if the role is not admin
// if (myRoll !== 'admin') {
// }
    // Continue building the query only if the role is not admin
    if (project_id) {
        query += ` 
        WHERE tl.space_id = ? 
        AND tl.project_id = ? 
        AND (
            JSON_CONTAINS(tl.assignee, '[${user_id}]') 
            OR tl.user_id = ?
        )
        `;
    } else {
        query += ` 
        WHERE tl.user_id = ? 
        OR JSON_CONTAINS(tl.assignee, '[${user_id}]')
        `;
    }


// Add GROUP BY clause
query += `
    GROUP BY ts.status_name;
`;

// Prepare parameters for query execution
const parameters = project_id 
    ? [space_id, project_id, user_id] 
    : [user_id];

// Execute the query
connection.query(query, parameters, (err, results) => {
        if (err) {
            console.error('Error retrieving tasks:', err);
            return res.status(500).json({
                success: false,
                status: '500',
                message: 'Error retrieving tasks.',
            });
        }

        // Return the list of tasks

const setTotalPriority = results
    .filter(row => row.totalPriority !== null) // Filter out null values
    .reduce((total, row) => total + row.totalPriority, 0);

        const totalStatusCount = results.reduce((total, row) => total + row.totalTask, 0);

        return res.json({
            success: true,
            status: '200',
            data: results,
            totalStatusCount:totalStatusCount,
            totalPriority:setTotalPriority,
        });
    });
};
