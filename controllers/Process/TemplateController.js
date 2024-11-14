const User = require('../../models/User');
const ProcessTaskModel = require('../../models/ProcessTaskModel');
const ProcessTemplate = require('../../models/ProcessTemplate');
const Demoview = require('../../models/Demoview'); // Ensure this path is correct
const db = require('../../config/db.js'); // Adjust the path
const socket = require('../../socket'); // Import socket.js
const sendEmail = require('../../sendEmail');
const moment = require('moment-timezone');
 


function getdatetimefun()
{
    return moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
}

const generateRandomInteger = (length) => {
    return Math.floor(Math.random() * Math.pow(10, length));
};


exports.ProcessTemplateCheck = async (req, res) => {
    

    try {
        // Extracting ID from request params
        const reqId = req.query.id;

        // Await the result from the database call
        const recordResult = await ProcessTemplate.checkTemplate(reqId);

        // Respond with the result
        return res.json({
            success: true,
            data: recordResult
        });
    } catch (error) {
        // Handle any errors (e.g., database issues, invalid input, etc.)
        
        return res.json({
            success: false,
            message: 'An error occurred while fetching the template data.',
            error: error.message
        });
    }

};

exports.storeTask = (req, res) => {

    const userId = req.userId; // Assuming you have middleware to set user
    const { issueName, assignee, description, dueDate, status, getpriority, processId, estimate } = req.body;

    const finalPriority = getpriority ? getpriority : 4;
    const finalStatus = status ? status : 1;


    let pa_taskID = null;

    if (pa_taskID != undefined || pa_taskID != null || pa_taskID != '') {
        pa_taskID = req.body.taskID;
    }


    let spaceId = null;
    let projectId = null;

    // if (spaceId && issueName && userId) {
    if (processId && userId) {

    const jsonAssignee = JSON.stringify(assignee);
    const randomInteger = generateRandomInteger(7);
    const taskId = randomInteger;
    const getdVal = getdatetimefun();

    const storeTaskQuery = `
            INSERT INTO task_process_task (user_id, task_category, task_id, owner_id, status, process_id, description, assignee, due_date, priority, parentId, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    db.query(storeTaskQuery, [userId, issueName, taskId, userId, finalStatus, processId, description, jsonAssignee, dueDate, finalPriority, pa_taskID, getdVal], (err, result) => {
            if (err) {
                console.log(err);
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

            ProcessTaskModel.listTasksAfterInsert(lastInsertedId, (err, tasks) => {
           
            if (err) {
                console.error('Error fetching tasks:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                });
            }
          
            try {
                const io = socket.getIO();  // Get the Socket.IO instance
                
                const process_id = tasks[0].process_id;

                io.emit(`taskProcessCreated${process_id}`, tasks);  // Emit event

            } catch (error) {
                console.error("Socket.IO instance is undefined,  Process Task Create page event not emitted.", error);
            }

                return res.json({
                    success: true,
                    data: 'eventBase'
                });


            });

           
    });



    } else {
        res.status(400).json({ success: false, error: 'Invalid input' });
    }
};


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

            // // Wait for all email promises to complete
            // Promise.all(emailPromises)
            //     .then(() => {
            //         // console.log('All emails have been processed.');
            //     })
            //     .catch(err => {
            //         // console.error('Error in sending some emails:', err);
            //     });
        } else {
            // console.log('No users found for the given IDs.');
        }
    });
}
