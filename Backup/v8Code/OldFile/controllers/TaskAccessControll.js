const db = require('../config/db');
const socket = require('../socket'); // Import socket.js
const sendEmail = require('../sendEmail');




exports.GetInvitedUsersSugg = (req, res) => {
    const userId = req.userId; // Assuming user info is populated through authentication middleware

    let success = true;

    try {
        // Validate user ID
        if (!userId) {
            return res.status(400).json({
                success: false,
                status: '400',
                message: 'User ID is required.',
            });
        }

        // Prepare the select query
        const query = `SELECT users.id,users.email FROM users`;

        // Execute the query
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error retrieving invited users:', err);
                success = false;
                return res.status(500).json({
                    success,
                    status: '500',
                    message: 'Error retrieving users.',
                });
            }

            return res.json({
                success,
                status: '200',
                data: results, // Return the retrieved users
            });
        });
    } catch (error) {
        success = false;
        console.error('Unexpected error:', error);
        return res.status(500).json({
            success,
            status: '500',
            message: 'An unexpected error occurred.',
        });
    }
};



exports.Inviteusers = (req, res) => {

    const userId = req.userId; // Assuming user info is populated through authentication middleware
    const getInviteUser = req.body.adduser; // Array of user emails
    const usertype = req.body.usertype;
    const spacevalue = req.body.spacevalue;

    let success = true;
    let alreadyEmail = []; // Initialize an array to hold already invited emails

    try {
        // Prepare the query for bulk insert


        const invitePromises = getInviteUser.map(value => {

        const getEmailQuery = `SELECT invite_email FROM account_invite_users WHERE invite_email = ? and space_id = ?`;

        db.query(getEmailQuery, [value, spacevalue], (err, results) => {
        
        if (err) {
            console.error('Error retrieving user email:', err);
            return res.status(500).json({
                        success: false,
                        status: '500',
                        message: 'Error retrieving user email.',
                    });
            }

        if (results && results.length > 0) {
    
            alreadyEmail.push(results[0].invite_email);
            
        }else{

            if (value) {
                console.log('1');
                return new Promise((resolve, reject) => {
                    const query = 'INSERT INTO account_invite_users (user_id, invite_email, space_id, user_type) VALUES (?, ?, ?, ?)';
                    db.query(query, [userId, value, spacevalue, usertype], (err, resultsSd) => {
                        if (err) {
                            console.error('Error saving invited user:', err);
                            reject(err);
                        } else {


        const InviteId = resultsSd.insertId; // Extract the user's email
        // Prepare the second query to find invited users based on the email
        const getInviteUsersQuery = `
            SELECT account_invite_users.*, users.name, users.email, task_space.space_name 
            FROM account_invite_users 
            LEFT JOIN task_space ON CAST(task_space.id AS CHAR) = CAST(account_invite_users.space_id AS CHAR)
            LEFT JOIN users ON users.email COLLATE utf8mb4_unicode_ci = account_invite_users.invite_email COLLATE utf8mb4_unicode_ci
            WHERE account_invite_users.id = ?
        `;

        // Execute the second query
        db.query(getInviteUsersQuery, [InviteId], (err2, inviteResults) => {
            if (err2) {
                console.error('Error retrieving invited users:', err2);
                return res.status(500).json({
                    success: false,
                    status: '500',
                    message: 'Error retrieving invited users.',
                });
            }

             sendEmail(value, 'Test Subject', 'Hello from Node.js!')
                            .then(() => {
                                console.log('Email sent successfully!');
                            })
                            .catch(err => {
                                console.error('Failed to send email:', err);
                            });

                            try {
                const io = socket.getIO();  // Get the Socket.IO instance

                io.emit('InboxAddesItems', { 
                    updatedField: 'Inbox', 
                    inviteResults: inviteResults[0]
                });

            } catch (error) {
                console.error("Socket.IO instance is undefined, taskController assing update status page event not emitted.", error);
            }


            resolve();

        });



                           
                        }
                    });
                });
            }
            return Promise.resolve(); // Skip null or undefined values

        }


        });

        });

        Promise.all(invitePromises)
            .then(() => {
                return res.json({
                    success,
                    alreadyEmail,
                    status: '200',
                });
            })
            .catch(() => {
                success = false;
                return res.status(500).json({
                    success,
                    alreadyEmail,
                    status: '500',
                });
            });

    } catch (error) {
        success = false;
        return res.status(500).json({
            success,
            status: '500',
        });
    }
};



// exports.GetInvitedUsers = (req, res) => {
//     const userId = req.userId; // Assuming user info is populated through authentication middleware

//     let success = true;

//     try {
//         // Validate user ID
//         if (!userId) {
//             return res.status(400).json({
//                 success: false,
//                 status: '400',
//                 message: 'User ID is required.',
//             });
//         }

//         // Prepare the select query
//         const query = `
//         SELECT account_invite_users.*,users.name FROM account_invite_users WHERE user_id = ?
//         LEFT JOIN users ON users.id = account_invite_users.user_id
//         `;

//         console.log(query);


//         // Execute the query
//         db.query(query, [userId], (err, results) => {
//             if (err) {
//                 console.error('Error retrieving invited users:', err);
//                 success = false;
//                 return res.status(500).json({
//                     success,
//                     status: '500',
//                     message: 'Error retrieving users.',
//                 });
//             }

//             return res.json({
//                 success,
//                 status: '200',
//                 data: results, // Return the retrieved users
//             });
//         });
//     } catch (error) {
//         success = false;
//         console.error('Unexpected error:', error);
//         return res.status(500).json({
//             success,
//             status: '500',
//             message: 'An unexpected error occurred.',
//         });
//     }
// };

exports.GetInvitedUsers = (req, res) => {
    const userId = req.userId; // Assuming user info is populated through authentication middleware

    let success = true;

    try {
        // Validate user ID
        if (!userId) {
            return res.status(400).json({
                success: false,
                status: '400',
                message: 'User ID is required.',
            });
        }

        // Prepare the select query
        const query = `
        SELECT account_invite_users.*, users.name 
        FROM account_invite_users 
        LEFT JOIN users ON users.id = account_invite_users.user_id 
        WHERE account_invite_users.user_id = ?`;

        // Execute the query
        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error retrieving invited users:', err);
                success = false;
                return res.status(500).json({
                    success,
                    status: '500',
                    message: 'Error retrieving users.',
                });
            }

            return res.json({
                success,
                status: '200',
                data: results, // Return the retrieved users
            });
        });
    } catch (error) {
        success = false;
        console.error('Unexpected error:', error);
        return res.status(500).json({
            success,
            status: '500',
            message: 'An unexpected error occurred.',
        });
    }
};

exports.GetInvitedUsersInbox = (req, res) => {
    const userId = req.userId; // Assuming user info is populated through authentication middleware

    // Validate user ID
    if (!userId) {
        return res.status(400).json({
            success: false,
            status: '400',
            message: 'User ID is required.',
        });
    }

    // Prepare the first query to get the user's email
    const getUserEmailQuery = `
        SELECT email FROM users WHERE id = ?
    `;

    // Execute the first query to get the email
    db.query(getUserEmailQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving user email:', err);
            return res.status(500).json({
                success: false,
                status: '500',
                message: 'Error retrieving user email.',
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                status: '404',
                message: 'User not found.',
            });
        }

        const email = results[0].email; // Extract the user's email
        console.log(email);
        // Prepare the second query to find invited users based on the email
        const getInviteUsersQuery = `
            SELECT account_invite_users.*, users.name, users.email, task_space.space_name 
            FROM account_invite_users 
            LEFT JOIN task_space ON CAST(task_space.id AS CHAR) = CAST(account_invite_users.space_id AS CHAR)
            LEFT JOIN users ON users.email COLLATE utf8mb4_unicode_ci = account_invite_users.invite_email COLLATE utf8mb4_unicode_ci
            WHERE account_invite_users.invite_email = ?
        `;

        // Execute the second query
        db.query(getInviteUsersQuery, [email], (err2, inviteResults) => {
            if (err2) {
                console.error('Error retrieving invited users:', err2);
                return res.status(500).json({
                    success: false,
                    status: '500',
                    message: 'Error retrieving invited users.',
                });
            }

            return res.json({
                success: true,
                status: '200',
                data: inviteResults, // Return the retrieved invited users
            });
        });
    });
};

exports.GetInvitedUsersInboxAccepted = (req, res) => {

    const userId = req.userId; // Assuming user info is populated through authentication middleware
    const inboxId = req.body.inviteUser
    
    // Validate user ID
    if (!inboxId) {
        return res.status(400).json({
            success: false,
            status: '400',
            message: 'Inbox ID is required.',
        });
    }

     const getUserEmailQuery = `
    SELECT 
        account_invite_users.*,
        users.id AS wnoUserId,
        users.name AS userName
    FROM 
        account_invite_users 
    LEFT JOIN 
        users ON CAST(users.email AS CHAR) = CAST(account_invite_users.invite_email AS CHAR)
    WHERE 
        account_invite_users.id = ?
`;

     db.query(getUserEmailQuery, [inboxId], (err,results) => {
            
         
   if (err) {
                console.error('Error updating Invite email:', err);
                return res.status(500).json({
                    success: false,
                    status: '500',
                    message: 'Error',
                });
            }



            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    status: '404',
                    message: 'data not found.',
                });
            }

    console.log('fils',results);

const sapceId = results[0].space_id;

  if (!sapceId) {
        return res.status(400).json({
            success: false,
            status: '400',
            message: 'sapce ID is required.',
        });
    }



   const taskquery = `SELECT assignee FROM task_space WHERE id = ?`;



   db.query(taskquery, sapceId, (err, results) => {
            if (err) {
                console.error('Error updating Invite email:', err);
                return res.status(500).json({
                    success: false,
                    status: '500',
                    message: 'Error updating Invite email.',
                });
            }
console.log('cjekc',results);
    const assignees = results[0].assignee; // Assuming assignees is stored as a JSON string
    let assigneeArray = [];

    // Check if assignees is not null or an empty string
    if (assignees && typeof assignees === 'string') {
      try {
        assigneeArray = JSON.parse(assignees); // Parse the JSON string to an array
      } catch (error) {
        console.error('Error parsing assignees:', error);
        return; // Handle the error as needed
      }
    }

    // Condition 1: If assignee list is empty, add your user ID
    if (assigneeArray.length === 0) {
      assigneeArray.push(userId);
      console.log(`Assignee list was empty. Added user ID: ${userId}`);
    } 
    // Condition 2: If user ID is not already in the assignee list, add it
    else if (!assigneeArray.includes(userId)) {
      assigneeArray.push(userId);
      console.log(`User ID: ${userId} added to the assignee list.`);
    } else {
      console.log(`User ID: ${userId} is already in the assignee list.`);
    }

    // Update the database with the new assignee list
    const updatedAssignees = JSON.stringify(assigneeArray);

    const updateQuery = `UPDATE task_space SET assignee = ? WHERE id = ?`;

 db.query(updateQuery, [updatedAssignees, sapceId], (err) => {

        // Proceed to update the user email
        const updateUserEmailQuery = `
            UPDATE account_invite_users SET status = ? WHERE id = ?
        `;

        db.query(updateUserEmailQuery, ['Accepted', inboxId], (err) => {
            if (err) {
                console.error('Error updating Invite email:', err);
                return res.status(500).json({
                    success: false,
                    status: '500',
                    message: 'Error updating Invite email.',
                });
            }

            return res.json({
                success: true,
                status: '200',
                message: 'Invite updated successfully.',
            });
        });
        });
   });
   });

}