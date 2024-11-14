const db = require('../config/db');
const User = require('../models/User');
const socket = require('../socket'); // Import socket.js
const sendEmail = require('../sendEmail');

exports.Inviteusers = (req, res) => {

    const userId = req.userId; // Assuming user info is populated through authentication middleware
    const getInviteUser = req.body.adduser; // Array of user emails
    const usertype = req.body.usertype;
    const spacevalue = req.body.spacevalue;

    const spacevalue3 = JSON.stringify(spacevalue)

    
// Separate IDs into taskSpaceIds and taskSpaceProjectIds
// const groupedIds = spacevalue.reduce((acc, [taskSpaceId, taskSpaceProjectId]) => {
//   if (taskSpaceId !== undefined) acc.taskSpaceIds.push(taskSpaceId);
//   if (taskSpaceProjectId !== undefined) acc.taskSpaceProjectIds.push(taskSpaceProjectId);
//   return acc;
// }, { taskSpaceIds: [], taskSpaceProjectIds: [] });

// console.log("Task Space IDs:", groupedIds.taskSpaceIds);
// console.log("Task Space Project IDs:", groupedIds.taskSpaceProjectIds);

    // return false;

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
            LEFT JOIN users ON CAST(users.id AS CHAR(255)) = CAST(account_invite_users.user_id AS CHAR(255))
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

            const sName = inviteResults[0].space_name;
            const uName = inviteResults[0].name;
            const uEmail = inviteResults[0].email;


                const email = value; // Assuming users have an 'email' field
                const subject = `Join Our New Space ${sName}`;
                const body = `
                    <p>Hi,</p>
                    <p>We’re excited to invite you to our new space : <strong>${sName}</strong></p>
                    <p>Click here to join <a href="https://work.digilogy.co/#/inbox-kjsjUyj6UHJEue77872873kJJHi7iu">${sName}</a> </p>
                `;

                sendEmail(email, subject, body, { html: true }) // Pass options for HTML email
                    .then(() => {
                        console.log(`Email sent successfully to ${email}!`);
                    })
                    .catch(err => {
                        console.error(`Failed to send email to ${email}:`, err);
                    });


        try {

    User.findByUsername(email,(err, results) => {

        if (err) {
            console.error('Database Error Invite email DB:', err);
            return res.status(500).send('Error fetching DB data 2s32093');
        }

        if (results.length === 0) {
            return res.status(404).send('User Register 091k39');
        }
        const resultsUSerid = results[0].id;


            const io = socket.getIO();  // Get the Socket.IO instance
            console.log(`InboxAddesItems${resultsUSerid}`);

            io.emit(`InboxAddesItems${resultsUSerid}`, { 
                updatedField: 'Inbox', 
                inviteResults: inviteResults[0]
            });

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
        // console.log(email);
        // Prepare the second query to find invited users based on the email
        const getInviteUsersQuery = `
            SELECT account_invite_users.*, users.name, users.email, task_space.space_name 
            FROM account_invite_users 
            LEFT JOIN task_space ON CAST(task_space.id AS CHAR) = CAST(account_invite_users.space_id AS CHAR)
            LEFT JOIN users ON CAST(users.id AS CHAR(255)) = CAST(account_invite_users.user_id AS CHAR(255))
            WHERE account_invite_users.invite_email = ? order by id desc
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

            // console.log(inviteResults);
            const acceptedEntries = inviteResults.filter(entry => entry.status !== 'Accepted');
            // console.log(acceptedEntries);

// Get the total count of accepted entries
const acceptedCount = acceptedEntries.length;
            return res.json({
                success: true,
                status: '200',
                data: inviteResults, // Return the retrieved invited users
                count: acceptedCount, // Return the retrieved invited users
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




exports.messageCommonds = (req, res) => {
    const user_id = req.userId; // Assuming user info is populated through authentication middleware
      const messagesVal = req.body.value;
      const selectedMentions = req.body.selectedMentions;
    
    const subject = JSON.stringify(req.body); 
    const task_id = req.body.task_id; 
    const SpaceName = req.body.spaceName; 
    const ProjectName = req.body.projectName; 

      const FinalselectedMentions = JSON.stringify(selectedMentions);

      // console.log(typeof(selectedMentions))
      // Validate inputs
      if (!user_id || !messagesVal) {
        return res.status(400).json({ error: 'user_id and messages are required' });
      }

      const createdAt = new Date(); // Get the current date and time

      const query = `INSERT INTO taskchatbox (user_id, messages, mentions, created_at, task_id, subject) VALUES (?, ?, ?, ?, ?, ?)`;

      db.query(query, [user_id, messagesVal, FinalselectedMentions, createdAt, task_id, subject], (err, results) => {
        if (err) {
          console.error('Error inserting message:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }


        const latesId = results.insertId;
        // res.status(201).json({ message: 'Message inserted successfully', id: results.insertId });


         // Prepare the second query to find invited users based on the email

    const queryList = `
        SELECT taskchatbox.*, users.name,users.color
        FROM taskchatbox 
        LEFT JOIN users ON CAST(users.id AS CHAR) = CAST(taskchatbox.user_id AS CHAR)
        WHERE taskchatbox.id = ?`; 



        selectedMentions.map(value => {

              const email = value.email; // Assuming users have an 'email' field
                const subject = `${SpaceName} / ${ProjectName}`;
                const body = `
                    <p>Hi,</p>
                    <p>${messagesVal}</p>
                `;


                sendEmail(email, subject, body, { html: true }) // Pass options for HTML email
                    .then(() => {
                        console.log(`Email sent successfully to ${email}!`);
                    })
                    .catch(err => {
                        console.error(`Failed to send email to ${email}:`, err);
                    });
        
            });


        // Execute the second query

        db.query(queryList, [latesId], (err2, inviteResults) => {
            if (err2) {
                console.error('Error insert msg:', err2);
                return res.status(500).json({
                    success: false,
                    status: '500',
                    message: 'Error 10923.',
                });
            }


            try {

                const io = socket.getIO();  // Get the Socket.IO instance

                io.emit(`taskCmdMsgSocket${task_id}`, { 
                    success: true,
                    data: inviteResults[0]
                });

            } catch (error) {
                console.error("Socket.IO instance is undefined, INser msg event not emitted.", error);
            }

            return res.status(200).json({
                    success: true,
            });

        });

      });

};


exports.GetUserListCommon = (req, res) => {

    const getTaskID = req.body.TaskId;
    console.log(getTaskID);

     try {
        // Prepare the select query to get messages from taskchatbox
      const query = `
    SELECT taskchatbox.*, users.name, users.color
    FROM taskchatbox 
    LEFT JOIN users ON CAST(users.id AS CHAR) = CAST(taskchatbox.user_id AS CHAR)
    WHERE taskchatbox.task_id = ?`; 


        // Execute the query
        db.query(query, [getTaskID], (err, results) => {
            if (err) {
                console.error('Error retrieving messages:', err);
                return res.status(500).json({
                    success: false,
                    status: '500',
                    message: 'Error retrieving messages.',
                });
            }

            // If results are found, return them
            if (results.length > 0) {
                return res.status(200).json({
                    success: true,
                    data: results,
                });
            } else {
                return res.status(200).json({
                    success: false,
                    message: 'No messages found.',
                });
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(200).json({
            success: false,
            message: 'An unexpected error occurred.',
        });
    }


}

exports.ChangeRoleUser = (req, res) => {

const userId = req.userId; 

    // const query = `
    //         SELECT 
    //             task_space.id AS tsId, 
    //             task_space.space_name, 
    //             task_space_projects.id AS tspID
    //         FROM task_space
    //         LEFT JOIN task_space_projects ON CAST(task_space.id AS CHAR(255)) = CAST(task_space_projects.space_id AS CHAR(255)) 
    //         WHERE JSON_CONTAINS(task_space.assignee, ?) OR task_space.user_id = ?
    //     `;


const query = `
    SELECT 
        task_space.id AS tsId, 
        task_space.user_id AS RoleuserId, 
        task_space.space_name, 
        task_space_projects.id AS tspID,
        account_invite_users.user_type
    FROM task_space
    LEFT JOIN task_space_projects 
        ON CAST(task_space.id AS CHAR(255)) = CAST(task_space_projects.space_id AS CHAR(255)) 
    LEFT JOIN account_invite_users 
        ON account_invite_users.user_id = ? 
        AND account_invite_users.space_id = task_space.id
    WHERE JSON_CONTAINS(task_space.assignee, ?) OR task_space.user_id = ?
`;



 
// {
// value: "1",
// label: "Collaboration",
// },
// {
// value: "2",
// label: "Admin",
// },
// {
// value: "3",
// label: "Viewer",
// },
const getRoleName = {
    1 : 'Collaboration',
    2 : 'Admin',
    3 : 'Viewer'
}


const getrollePermissionName = {
    1 : ['read','update','create'],
    2 : ['read','update','delete','show','create'],
    3 : ['read','show'],
}
        db.query(query, [userId, userId, userId], (err, results2) => {
            if (err) {
                console.error("Error executing query", err);
                return res.status(500).send('Error fetching Chnage role spaces and projects');
            }

            console.log(results2);
            
            // Initialize the result object
            const structuredData = {
                user_id: userId,
                spaces: {}
            };

            // Transform the results into the desired structure
            results2.forEach(row => {
                const { tsId, space_name, tspID, user_type, RoleuserId } = row;

                // Check if the space already exists
                if (!structuredData.spaces[tsId]) {
                    structuredData.spaces[tsId] = {
                        projects: {}
                    };
                }

                // Add project details
                structuredData.spaces[tsId].projects[tspID] = {
                    roleType: getRoleName[user_type] || (RoleuserId === userId ? 'Admin' : 'Unknown'),
                    role: getRoleName[user_type]    || (RoleuserId === userId ? 'Admin' : 'Unknown'),
                    actions: getrollePermissionName[user_type] || (RoleuserId === userId ? ['read','update','delete','show','create'] : []),
                };
            });

            // Log the structured data
            // console.log("Structured Data:", structuredData);

        res.json({status: 'success', data:structuredData });
    });
        

}
exports.GetUserList = (req, res) => {


    const sapceId = req.body.space_id;
    const projectId = req.body.projectId;


    let success = true;

   try {
  // Prepare the select query to get assignees
  // const query = `SELECT assignee FROM task_space`;
  const query = `SELECT assignee FROM task_space WHERE id = ?`;

  // Execute the query
  // db.query(query, (err, results) => {
  db.query(query, sapceId, (err, results) => {
    if (err) {
      console.error('Error retrieving invited users:', err);
      return res.status(500).json({
        success: false,
        status: '500',
        message: 'Error 2983 retrieving users.',
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        status: '404',
        message: 'No task space found.',
      });
    }

    // Parse the assignee string into an array
    const assignees = JSON.parse(results[0].assignee);
    
    // Prepare the select query to get user details
    const userQuery = `SELECT id, name, email FROM users WHERE id IN (?)`;

    // Execute the user query
    db.query(userQuery, [assignees], (err, userResults) => {
      if (err) {
        console.error('Error retrieving users:', err);
        return res.status(500).json({
          success: false,
          status: '500',
          message: 'Error retrieving msg 2983kdu details.',
        });
      }

      return res.json({
        success: true,
        status: '200',
        data: userResults, // Return the list of users
      });
    });
  });
} catch (error) {
  console.error('Unexpected error:', error);
  return res.status(500).json({
    success: false,
    status: '500',
    message: 'An unexpected error occurred.',
  });
}

};

