const Processats = require('../../models/Process');
const ProcessTaskModel = require('../../models/ProcessTaskModel');
const Demoview = require('../../models/Demoview'); // Ensure this path is correct
const db = require('../../config/db.js'); // Adjust the path
const socket = require('../../socket'); // Import socket.js
const sendEmail = require('../../sendEmail');

exports.createProcessTeam = async (req, res) => {
    try {
        // Extract userId and body from the request
        const teams = { ...req.body, userId: req.userId };

        // Create the team and wait for the result
        const createResult = await Processats.createTeam(teams);


        // Check if the team was created successfully
        if (!createResult || createResult.affectedRows === 0) {
            return res.status(404).send('Process not found');
        }

        // Retrieve the created record

    const recordResult = await Processats.getrecordTeams(createResult.insertId);


       if (recordResult.length === 0) {
            return res.status(404).send('Record not found');
        }

        const data = {
            id: recordResult[0].id,
            team_name: recordResult[0].team_name,
            description: recordResult[0].description,
            user_id: recordResult[0].userId,
            name: recordResult[0].name,
        };

        // Emit the data using Socket.IO

        // console.log(recordResult);

        const io = socket.getIO();
        if (io) {
            io.emit(`addTeamSocket${teams.userId}`, data);
            console.log(`addTeamSocket${teams.userId}`);
        } else {
            console.error("Socket.IO instance is Teams undefined.");
        }

        return res.status(200).json({ success: true, data: recordResult });
    } catch (error) {
        console.error("Error Teams request:", error);
        return res.status(500).send('Internal Server Error');
    }
};

exports.createTeamMebers = async (req, res) => {

        try {
        // Extract userId and body from the request
        const teamsMember = { ...req.body, userId: req.userId };

        // Prepare an array to hold promises for all insert operations
        const insertPromises = teamsMember.addUser.map(email => {
            // Create a new object for each insertion
            const memberData = {
                teamMembname: teamsMember.teamMembname,
                teamrollName: teamsMember.teamrollName,
                email: email, // Use the current email from the loop
                userId: teamsMember.userId,
                description_name: teamsMember.description_name,
            };

            callMailfunction(email);
            // Call createTeamMember and return the promise
            return Processats.createTeamMember(memberData);
        });

        // Wait for all insertions to complete
        const results = await Promise.all(insertPromises);

        // Handle the results as needed
            // console.log('All team members created successfully:', results);
            res.status(201).json({ message: 'Team members added successfully', results });
        } catch (error) {
            // console.error('Error adding team members:', error);
         res.status(500).json({ message: 'Error adding team members', error });
        }

};



exports.ProcessCreate = (req, res) => {
    
    const task = { ...req.body, userId: req.userId };

    Processats.create(task, (err, results) => {
    
        
        if (err) {
            // console.error('Error Insert Process data:', err);
            return res.status(200).send('Error fetching Process data');
        }

        if (results.length === 0) {
            return res.status(200).send('Process not found');
        }

            // Return the structured data in the response

        
        Processats.getrecord(results.insertId, (err, results) => {

    if (results.length > 0) {
        

        try {
            
            const io = socket.getIO();
            const data = {
                id: results[0].id,
                process_name: results[0].process_name,
                description: results[0].description_name,
                user_id: results[0].userId,
                name: results[0].name
            }

            console.log(`addProcessSocket${task.userId}`);
            io.emit(`addProcessSocket${task.userId}`, data); 

        } catch (error) {
            console.error("Socket.IO instance is undefined,  taskController page event not emitted.", error);
        }

    }

        return res.status(200).json(
            { 
                success: true,
                data: results
            }
            );
        });

    });
};


exports.ProcessList =  (req, res) => {

    // console.log(req.userId)
    
    const data = { userId: req.userId };

    Processats.view(data, (err, results) => {

        if (err) {
            // console.error('Error Process data:', err);
            return res.status(200).send('Error fetching user data');
        }

        if (results.length === 0) {
            return res.status(200).send('Process not found');
        }

            // Return the structured data in the response
        return res.status(200).json(
            { 
                success: true,
                data: results
            }
            );
    });
};



exports.listProcess = (req, res) => {
    const filters = req.body; // Assuming filters are sent in the request body
    const processId = req.body.processId;
    const userId = req.userId; // Assuming userId is set by middleware

    ProcessTaskModel.listProcessModel(filters, userId, processId, (err, tasks) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }

         return res.json({
                success: true,
                data: tasks
            });

    });
};


exports.ProcessTeamList = async (req, res) => {

    
    const userId = req.userId;

    const recordResult = await Processats.viewTeams(userId);

    if (recordResult.length === 0) {
            return res.status(404).send('Record not found');
    }

        return res.status(200).json(
            { 
                success: true,
                data: recordResult
            }
            );

};


exports.viewTeamMebers = async (req, res) => {
    
    
    const userId = req.userId;
    const recordResult = await Processats.viewTeamsMembers(userId);

    if (recordResult.length === 0) {
            return res.status(404).send('Record not found');
    }

    return res.status(200).json(
        { 
            success: true,
            data: recordResult
        }
    );

};


exports.viewTeamMebersview = async (req, res) => {
    
   // console.log(req.query) 
    const viewId = req.query.id;

    const userId = req.userId;
    const recordResult = await Processats.viewTeamsMembersview(viewId);

    if (recordResult.length === 0) {

            return res.status(200).send('Record not found');
    }


     return res.json({
            success: true,
            data: recordResult
        });
};



function callMailfunction(email, res) {
    // Prepare SQL query for multiple IDs
    const sql = 'SELECT * FROM users WHERE email = ?'; 

    let store_error = '';
    // Use db.query with a question mark and array for parameterized queries
    db.query(sql, [email], (err, results) => {
        if (err) {
            store_error = err;
        }

        if (results.length > 0) {
            store_error += 'exiting users';
        } else {
            store_error += 'New Users';
        }
        // Send emails to each user
        
        // const email = 'karthikeyan971108@gmail.com'; // Assuming users have an 'email' field
        const subject = 'Task Assignment Notification';
        const body = `
            <p>Hello ${email},</p>
            <p>INvited</p>`;

        const getmaillog = sendEmail(email, subject, body, { html: true }) // Pass options for HTML email
                .then(() => {
                    store_error += `Email sent successfully to ${email}`;
                    console.log(`Email sent successfully to ${email}`);
                })
                .catch(err => {
                    store_error += `Failed to send email to ${email}`;
                    console.log(`Failed to send email to ${email}`);
                });

            const memberDataLog = {
                member_email: email,
                status: 'Pending',
                msg_error: store_error, // Use the current email from the loop
            };

        Processats.createLogSendMail(memberDataLog, (err, results) => {
            console.log(results);
        });
    });
}



exports.ProcessTaskDelete = (req, res) => {
    const entries = Object.entries(req.body);
    

    entries.forEach(([key, { checked }]) => {
        
    if (checked && key) {
    
    const query = 'DELETE FROM task_process_task WHERE id = ?';
    
    db.query(query, [key], (err, results) => {
        if (err) {
            console.error('Error deleting task:', err);
            return;
        }
        
        if (results.affectedRows > 0) {
            console.log(`Task with ID ${key} deleted successfully.`);

            try {
                const io = socket.getIO();  // Get the Socket.IO instance

                io.emit('ProcesstaskDelete', { 
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

};
    