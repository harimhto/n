const Task = require('../models/Task'); // Ensure this path is correct
const User = require('../models/User'); // Ensure this path is correct
const Demoview = require('../models/Demoview'); // Ensure this path is correct
const TaskModel = require('../models/TaskModel'); // Adjust the path
const TaskActivity = require('../models/TaskActivity');
const db = require('../config/db');
const socket = require('../socket'); // Import socket.js
const sendEmail = require('../sendEmail');

exports.getUser = (req, res) => {
    const userId = req.userId;

    User.getById(userId, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching user data');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        res.status(200).json({ success: true, data: results[0] });
    });
};

exports.createTask = (req, res) => {
    const task = { ...req.body, userId: req.userId };
    Task.create(task, (err) => {
        if (err) {
            return res.status(500).send('Error creating task');
        }
        res.status(201).send('Task created');
    });
};

exports.getAllTasks = (req, res) => {
    Task.getAll((err, results) => {
        if (err) {
            return res.status(500).send('Error fetching tasks');
        }
        res.json(results);
    });
};

exports.updateTask = (req, res) => {
    const taskId = req.params.id;
    const task = req.body;
    Task.update(taskId, task, (err) => {
        if (err) {
            return res.status(500).send('Error updating task');
        }
        res.send('Task updated');
    });
};

exports.deleteTask = (req, res) => {
    const taskId = req.params.id;
    Task.delete(taskId, (err) => {
        if (err) {
            return res.status(500).send('Error deleting task');
        }
        res.send('Task deleted');
    });
};

exports.getAllTasksdemo = (req, res) => {
    
    Demoview.getAll((err, results) => {
        if (err) {
            return res.status(500).send('Error fetching tasks');
        }
        res.json(results);
    });
};


exports.getAllTasksUser = (req, res) => {
    
    Demoview.getAlle((err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
};




exports.listTask = (req, res) => {
    const filters = req.body; // Assuming filters are sent in the request body
    const spaceId = req.body.spaceId;
    const projectId = req.body.projectId;
    const userId = req.userId; // Assuming userId is set by middleware

    TaskModel.listTasks(filters, spaceId, projectId, (err, tasks) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }

        // Process tasks to get assignee names

        // const tasksWithAssigneeNames = tasks.map(task => {
        //     // const assigneeIds = JSON.parse(task.assignee) || task.assignee.split(',');

        //     const assigneeIds = (task.assignee && task.assignee.length > 0) 
        //     ? JSON.parse(task.assignee) || task.assignee.split(',')
        //     : [];

        //     return {
        //         ...task,
        //         assignee_names: []
        //     };
        // });

        // console.log('amy',tasksWithAssigneeNames);

        // const allAssigneeIds = [...new Set(tasksWithAssigneeNames.flatMap(task => task.assignee))];
        // // console.log('list',allAssigneeIds);
        // TaskModel.getAssigneeNames(allAssigneeIds, (err, names) => {
        //     if (err) {
        //         console.error('Error fetching assignee names:', err);
        //         return res.status(500).json({
        //             success: false,
        //             error: 'Internal server error',
        //         });
        //     }

        //     tasksWithAssigneeNames.forEach(task => {
        //         task.assignee_names = names.filter((name, index) => allAssigneeIds.includes(task.assignee[index]));
        //     });

        //     return res.json({
        //         success: true,
        //         data: tasksWithAssigneeNames
        //     });
        // });
        

         return res.json({
                success: true,
                data: tasks
            });

    });
};


exports.listTaskModal = (req, res) => {

    const taskId = req.query.id;
    
    TaskModel.viewTask(taskId, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(result);
    });
};




exports.taskActivityList = (req, res) => {

    const userId = req.userId

    const taskId = req.query.id;

    TaskActivity.getTaskActivities(taskId, (err, records) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            const changes = [];

            for (let i = 1; i < records.length; i++) {
                const currentRecord = records[i];
                const previousRecord = records[i - 1];
                const recordChanges = {};

                if (previousRecord.up_status !== currentRecord.up_status) {
                    recordChanges.status = {
                        user_name: previousRecord.name,
                        old: previousRecord.status_name,
                        new: currentRecord.status_name,
                    };
                }

                if (previousRecord.up_priority !== currentRecord.up_priority) {
                    recordChanges.priority = {
                        user_name: previousRecord.name,
                        old: previousRecord.priority_name,
                        new: currentRecord.priority_name,
                    };
                }

                if (previousRecord.up_assignee !== currentRecord.up_assignee) {
                    recordChanges.assignee = {
                        user_name: previousRecord.name,
                        old: previousRecord.up_assignee,
                        new: currentRecord.up_assignee,
                    };
                }

                if (previousRecord.up_due_date !== currentRecord.up_due_date) {
                    recordChanges.due_date = {
                        user_name: previousRecord.name,
                        old: previousRecord.up_due_date,
                        new: currentRecord.up_due_date,
                    };
                }

                if (Object.keys(recordChanges).length > 0) {
                    changes.push({
                        user_name: previousRecord.name,
                        version: currentRecord.version,
                        changes: recordChanges,
                    });
                }
            }

            return res.json({
                success: true,
                status: '',
                data: changes,
            });
        });

};


const generateRandomInteger = (length) => {
    return Math.floor(Math.random() * Math.pow(10, length));
};

exports.storeTask = (req, res) => {
    const userId = req.userId; // Assuming you have middleware to set user
    const { issueName, assignee, description, dueDate, status, getpriority, space, estimate } = req.body;

    const finalPriority = getpriority ? getpriority : 4;
    const finalStatus = status ? status : 1;


let pa_taskID = null;

if (pa_taskID != undefined || pa_taskID != null || pa_taskID != '') {
    pa_taskID = req.body.taskID;
}

    



    let spaceId = null;
    let projectId = null;

    if (Array.isArray(space) && space.length >= 2) {
        spaceId = space[0];
        projectId = space[1];
    }

    if (spaceId && issueName && userId) {

        const jsonAssignee = JSON.stringify(assignee);
        const randomInteger = generateRandomInteger(7);
        const taskId = randomInteger;

        
        const storeTaskQuery = `
            INSERT INTO tasklist (user_id, task_category, task_id, owner_id, status, project_id, space_id, description, assignee, due_date, priority, estimateminutes, parentId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(storeTaskQuery, [userId, issueName, taskId, userId, finalStatus, projectId, spaceId, description, jsonAssignee, dueDate, finalPriority, estimate, pa_taskID], (err, result) => {
            if (err) {
                
                return res.status(500).json({ success: false, error: 'Database error' });
            }

   // Get the last inserted ID (if `task_id` is auto-incremented)

    User.getById(userId, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching user data');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        if(results[0].name){
            callMailfunction(assignee, issueName, results[0].name, res);
        }

    });


    const lastInsertedId = result.insertId;


            TaskModel.listTasksAfterInsert(lastInsertedId, (err, tasks) => {
            if (err) {
                console.error('Error fetching tasks:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                });
            }

            // // Process tasks to get assignee names
            // const tasksWithAssigneeNames = tasks.map(task => {
            //     // const assigneeIds = JSON.parse(task.assignee) || task.assignee.split(',');

            //     const assigneeIds = (task.assignee && task.assignee.length > 0) 
            //     ? JSON.parse(task.assignee) || task.assignee.split(',')
            //     : [];
            //     return {
            //         ...task,
            //         assignee_names: []
            //     };
            // });

            // const allAssigneeIds = [...new Set(tasksWithAssigneeNames.flatMap(task => task.assignee_ids))];

            // TaskModel.getAssigneeNames(allAssigneeIds, (err, names) => {
            //     if (err) {
            //         console.error('Error fetching assignee names:', err);
            //         return res.status(500).json({
            //             success: false,
            //             error: 'Internal server error',
            //         });
            //     }

            //     tasksWithAssigneeNames.forEach(task => {
            //         task.assignee_names = names.filter((name, index) => allAssigneeIds.includes(task.assignee_ids[index]));
            //     });

  


            // });

              try {
        const io = socket.getIO();  // Get the Socket.IO instance
        
        const spaceId = tasks[0].space_id;
        const projectId = tasks[0].project_id;

        io.emit(`taskCreated${projectId}to${spaceId}`, tasks);  // Emit event
    
    } catch (error) {
        console.error("Socket.IO instance is undefined,  taskController page event not emitted.", error);
    }
        

                return res.json({
                    success: true,
                    data: 'eventBase'
                });


            });


    // Now, retrieve the full inserted record by querying it
    // const selectTaskQuery = `
    //     SELECT * FROM tasklist WHERE id = ?
    // `;

    // Fetch the inserted task based on `lastInsertedId`
//     db.query(selectTaskQuery, [lastInsertedId], (err, taskResult) => {
//         if (err) {
//             return res.status(500).json({ success: false, error: 'Database retrieval error' });
//         }

//         // Return the full inserted record
 




// res.status(200).json({ success: true, data: taskResult[0] });
//         });
           
    });



    } else {
        res.status(400).json({ success: false, error: 'Invalid input' });
    }
};

const updateAssignees = (spaceId, projectId, jsonAssignee) => {
    return new Promise((resolve, reject) => {
        // Update Space
        const updateSpaceQuery = `UPDATE task_space SET assignee = ? WHERE id = ?`;
        db.query(updateSpaceQuery, [jsonAssignee, spaceId], (err) => {
            if (err) return reject(err);

            // Update Project
            const updateProjectQuery = `UPDATE task_space_projects SET assignee = ? WHERE id = ?`;
            db.query(updateProjectQuery, [jsonAssignee, projectId], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
};

exports.listTaskDelete = (req, res) => {
    const entries = Object.entries(req.body);
    

    entries.forEach(([key, { checked }]) => {
        
    if (checked && key) {
    
    const query = 'DELETE FROM tasklist WHERE id = ?';
    
    db.query(query, [key], (err, results) => {
        if (err) {
            console.error('Error deleting task:', err);
            return;
        }
        
        if (results.affectedRows > 0) {
            console.log(`Task with ID ${key} deleted successfully.`);

            try {
                const io = socket.getIO();  // Get the Socket.IO instance

                io.emit('taskDelete', { 
                    taskId: key, 
                });

            } catch (error) {
                console.error("Socket.IO instance is undefined, Delet Task", error);
            }


        } else {
            console.log(`No task found with ID ${key}.`);
        }
    });
    
    }
});
    
}
exports.updatetaskinfo = (req, res) => {
    let success = false;
    let status = '';
    

    const user_id = req.userId; // Assuming user info is populated through authentication middleware
    let value = req.body.value;
    const column = req.body.column;
    const task_id = req.body.taskid;



     if(column == 'assignee'){
        value = JSON.stringify(value);
     }



    const query = 'SELECT * FROM tasklist WHERE id = ?';
    
    db.query(query, [task_id], (err, results) => {
        if (err) {
            console.error('Error retrieving task status:', err);
            return res.status(500).json({ success, status: '500' });
        }

        if (results.length > 0) {
            
            const taskStatus = results[0];
            const pre_assing = results[0].assignee;
            const taskName = results[0].task_category;
            const userId = results[0].user_id;
            taskStatus[column] = value; // Update the specified column
            // Assuming you have a method to update the record
            const updateQuery = `UPDATE tasklist SET ${column} = ? WHERE id = ?`;
            db.query(updateQuery, [value, task_id], (err) => {

                if (err) {
                    console.error('Error updating task status:', err);
                    return res.status(500).json({ success, status: '500' });
                }

            if(column == 'status'){
                return callFunctionStatus(value, task_id, res);
            }

            if(column == 'due_date'){
                try {
                    const io = socket.getIO();  // Get the Socket.IO instance
                    io.emit('taskupdateDueDate', { 
                        taskId: task_id, 
                        updatedField: 'due_date', 
                        newValue: value,
                        taskDueDate: value
                    });
                } catch (error) {
                    console.error("Socket.IO instance is undefined, taskController update status page event not emitted.", error);
                }
            }

            if(column == 'priority'){
                return callFunctionPriority(value, task_id, res);
            }

            if(column == 'task_category'){
                return callFunctiontaskNameChange(value, task_id, res);
            }

            if(column == 'assignee'){
                return callFunctiontaskNameAssignee(value, taskName, pre_assing, userId, task_id, res);
            }


                success = true;
                status = '200'; // Success status
                return res.json({ success, status });
            });
        } else {
            status = '404'; // Task not found
            return res.status(404).json({ success, status });
        }
    });

};

function callFunctionStatus(value, task_id, res) {
    const sql = 'SELECT * FROM taskstatus WHERE id = ?'; 

    db.query(sql, [value], (err, results2) => {
        if (err) {
            console.error('Status Not Found:', err);
            return res.status(500).json({ success: false, status: '500' });
        }

        if (results2.length > 0) {
            const statusName = results2[0].status_name;
            const statusColor = results2[0].color;

            try {
                const io = socket.getIO();  // Get the Socket.IO instance
                io.emit('statusUpdated', { 
                    taskId: task_id, 
                    updatedField: 'status', 
                    newValue: value, 
                    status_name: statusName, 
                    statusColor: statusColor 
                });
            } catch (error) {
                console.error("Socket.IO instance is undefined, taskController update status page event not emitted.", error);
            }
        } else {
            console.error('No status found for the given id');
            return res.status(404).json({ success: false, status: '404' });
        }
    });
}

function callFunctionPriority(value, task_id, res) {
    const sql = 'SELECT * FROM taskpriority WHERE id = ?'; 

    db.query(sql, [value], (err, results2) => {
        if (err) {
            console.error('Status Not Found:', err);
            return res.status(500).json({ success: false, status: '500' });
        }

        if (results2.length > 0) {
            const taskPriority = results2[0].priority_name;
            const taskColor = results2[0].color;

            try {
                const io = socket.getIO();  // Get the Socket.IO instance
                io.emit('taskPriority', { 
                    taskId: task_id, 
                    updatedField: 'priority', 
                    newValue: value, 
                    taskPriority: taskPriority, 
                    taskColor: taskColor 
                });
            } catch (error) {
                console.error("Socket.IO instance is undefined, taskController update status page event not emitted.", error);
            }
        } else {
            console.error('No status found for the given id');
            return res.status(404).json({ success: false, status: '404' });
        }
    });
}


function callFunctiontaskNameChange(value, task_id, res) {
    const sql = 'SELECT * FROM tasklist WHERE id = ?'; 

    db.query(sql, [task_id], (err, results2) => {
        if (err) {
            console.error('Status Not Found:', err);
            return res.status(500).json({ success: false, status: '500' });
        }

        if (results2.length > 0) {
            const taskCategory = results2[0].task_category;

            try {
                const io = socket.getIO();  // Get the Socket.IO instance
                io.emit('taskNameChange', { 
                    taskId: task_id, 
                    updatedField: 'task_category', 
                    newValue: value, 
                    taskCategory: taskCategory
                });
            } catch (error) {
                console.error("Socket.IO instance is undefined, taskController update status page event not emitted.", error);
            }
        } else {
            console.error('No status found for the given id');
            return res.status(404).json({ success: false, status: '404' });
        }
    });
}

function callFunctiontaskDuedate(task_id, res) {
    // const sql = `SELECT * FROM tasklist 
    // LEFT JOIN user ON CAST(user.id AS CHAR(255)) IN = tasklist.user_id
    // WHERE id = ?`; 

   const sql = `
    SELECT assignee FROM tasklist
    WHERE id = ?`;

    db.query(sql, [task_id], (err, results2) => {
        if (err) {
            console.error('Status Not Found:', err);
            return res.status(500).json({ success: false, status: '500' });
        }

        if (results2.length > 0) {

            const taskAssign = results2[0].assignee;

let assigneeArray = [];
try {
    assigneeArray = JSON.parse(taskAssign);
} catch (error) {
    console.error('Error parsing assignee:', error);
}


if(assigneeArray.length == 0 && assigneeArray){
try {
                const io = socket.getIO();  // Get the Socket.IO instance

                io.emit('taskAssignupdate', { 
                    taskId: task_id, 
                    updatedField: 'assignee', 
                    newValue: 'value', 
                    taskAssignTask: []
                });

            } catch (error) {
                console.error("Socket.IO instance is undefined, taskController assing update status page event not emitted.", error);
            }

return res.status(200).json({ success: true, status: '200' });   
}

 
    const sql3 = `
              SELECT name FROM users WHERE id IN (?) `;

    db.query(sql3, [assigneeArray], (err, results3) => {

        if (err) {
            console.error('Assing Not Found:', err);
            return res.status(500).json({ success: false, status: '500' });
        }

        console.log(results3);
        if (results3.length > 0) {

            try {
                const io = socket.getIO();  // Get the Socket.IO instance

                io.emit('taskAssignupdate', { 
                    taskId: task_id, 
                    updatedField: 'assignee', 
                    newValue: 'value', 
                    taskAssignTask: results3
                });

            } catch (error) {
                console.error("Socket.IO instance is undefined, taskController assing update status page event not emitted.", error);
            }
}
            });

        } else {
            console.error('No status found for the given id');
            return res.status(404).json({ success: false, status: '404' });
        }


    });
}



const safeJsonParse = (jsonString) => {
    try {
        return JSON.parse(jsonString) || []; // Return parsed array or empty array if null
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return []; // Return an empty array on error
    }
};


function callFunctiontaskNameAssignee(assignees, task_category, prevTaskAssing, userName, task_id, res) {
 


const array1 = safeJsonParse(prevTaskAssing);
const array2 = safeJsonParse(assignees);


// Function to find differences
const findDifferences = (arr1, arr2) => {
    const missingInArr2 = arr1.filter(item => !arr2.includes(item)); // Items in arr1 not in arr2
    const missingInArr1 = arr2.filter(item => !arr1.includes(item)); // Items in arr2 not in arr1

    return {
        missingInArr2,
        missingInArr1,
    };  
};

// Find and log differences
const result = findDifferences(array1, array2);
// console.log('Missing in remove:', result.missingInArr2); // Items in ass1 not in ass2

if(result.missingInArr1.length > 0){
     
     User.getById(userName, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching user data');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found For mail');
        }

        callMailfunction(result.missingInArr1[0], task_category, results[0].name, res);
    });
}


return callFunctiontaskDuedate(task_id, res);


}

function callMailfunction(assignees, task_category, userName, res) {
    // Prepare SQL query for multiple IDs
    const sql = 'SELECT * FROM users WHERE id IN (?)'; 

    // Use db.query with a question mark and array for parameterized queries
    db.query(sql, [assignees], (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ success: false, status: '500' });
        }

        // Check if users were found
        if (results.length > 0) {
            // Send emails to each user
            const emailPromises = results.map(user => {

                 const email = user.email; // Assuming users have an 'email' field
                // const email = 'karthikeyan971108@gmail.com'; // Assuming users have an 'email' field
                const subject = 'Task Assignment Notification';
                const body = `
                    <p>Hello ${user.name},</p>
                    <p>You have been assigned a new task by <strong>${userName}</strong> : <strong>${task_category}</strong>.</p>
                `;

                return sendEmail(email, subject, body, { html: true }) // Pass options for HTML email
                    .then(() => {
                        console.log(`Email sent successfully to ${email}!`);
                    })
                    .catch(err => {
                        console.error(`Failed to send email to ${email}:`, err);
                    });
            });

            // Wait for all email promises to complete
            Promise.all(emailPromises)
                .then(() => {
                    console.log('All emails have been processed.');
                })
                .catch(err => {
                    console.error('Error in sending some emails:', err);
                });
        } else {
            console.log('No users found for the given IDs.');
        }
    });
}
