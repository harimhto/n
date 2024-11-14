const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const sendEmail = require('../sendEmail');

exports.login = (req, res) => {
    const { email, password } = req.body;


    User.findByUsername(email, (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send('Invalid credentials');
        }

        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).send('Invalid credentials 094');
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        const query = `
            SELECT 
                task_space.id AS tsId, 
                task_space.space_name, 
                task_space_projects.id AS tspID
            FROM task_space
            LEFT JOIN task_space_projects ON CAST(task_space.id AS CHAR(255)) = CAST(task_space_projects.space_id AS CHAR(255)) 
            WHERE JSON_CONTAINS(task_space.assignee, ?) OR task_space.user_id = ?
        `;

        db.query(query, [user.id, user.id], (err, results2) => {
            if (err) {
                console.error("Error executing query", err);
                return res.status(500).send('Error fetching spaces and projects');
            }

            // Initialize the result object
            const structuredData = {
                user_id: user.id,
                spaces: {}
            };

            // Transform the results into the desired structure
            results2.forEach(row => {
                const { tsId, space_name, tspID } = row;

                // Check if the space already exists
                if (!structuredData.spaces[tsId]) {
                    structuredData.spaces[tsId] = {
                        projects: {}
                    };
                }

                // Add project details
                structuredData.spaces[tsId].projects[tspID] = {
                    role: "admin" , // Replace with actual role logic
                    actions: ['read','update','delete','show','create'] // Replace with actual actions if available
                };
            });

            // Log the structured data
            // console.log("Structured Data:", structuredData);

        res.json({ token, data:structuredData });
    });
        });
};

exports.register = (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    User.create(username, hashedPassword, (err) => {
        if (err) {
            return res.status(500).send('Error registering user');
        }
        res.status(201).send('User registered');
    });
};


exports.forgetPassword = (req, res) => {

    const email = req.body.email;
    
    User.findByUsername(email, (err, userEmail) => {

        if (err) {
            return res.status(200).send('Error registering user');
        }
        const tokenReset = generateRandomToken(32);
    User.createReset(email, tokenReset, (err, storeReset) => {

    

        if(userEmail && userEmail.length > 0){

              const email = userEmail[0].email; // Assuming users have an 'email' field
                // const email = 'karthikeyan971108@gmail.com'; // Assuming users have an 'email' field
                const subject = 'Digilogy Reset Password Link';
                const body = `
                    <p>Hello ${userEmail[0].name},</p>
                    <p>Reset Password  :</p>
                    <a href="https://work.digilogy.co/#/restore/token/${tokenReset}">Reset</a>
                `;

            sendEmail(email, subject, body, { html: true }) // Pass options for HTML email
                    .then(() => {
                        console.log(`Email sent successfully to ${email}!`);
                    })
                    .catch(err => {
                        // console.error(`Failed to send email to ${email}:`, err);
            });
            return res.status(200).json({ success: true, msgCode: '200' });


        }else{
            return res.status(200).json({ success: true, msgCode: '2013' });
        }

    });

});

};



function generateRandomToken(length = 32) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters[randomIndex];
    }
    return token;
}



function generateRandomInteger(length) {
    return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
}


exports.RigisterEmail = (req, res) => {

    const email = req.body.email;
    const token = req.body.token;

    // Check if the user already exists
    const userQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(userQuery, [email], (err, userResults) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).json({ success: false, token, msg: 'Error checking user' });
        }

        if (userResults.length > 0) {
            return res.json({ token, success: true, msg: 1 });
        }

        // Check if the email already exists in TaskinviteusersModel
        const inviteQuery = 'SELECT * FROM taskinviteusers WHERE tt_user_email = ? AND tt_token = ?';
        db.query(inviteQuery, [email, token], (err, inviteResults) => {
            if (err) {
                console.error('Error checking invite:', err);
                return res.status(500).json({ success: false, token, msg: 'Error checking invite' });
            }

            if (inviteResults.length === 0) {
                // Create new entry in TaskinviteusersModel
                const createEmailQuery = 'INSERT INTO taskinviteusers (tt_owner, tt_user_email, tt_token, otp_verify) VALUES (?, ?, ?, ?)';
                const otp = generateRandomInteger(6);
                const ownerId = '200';

                db.query(createEmailQuery, [ownerId, email, token, otp], (err) => {
                    if (err) {
                        console.error('Error creating email entry:', err);
                        return res.status(500).json({ success: false, token, msg: 'Error creating email entry' });
                    }

                    sendEmail(email, `OTP: ${otp}`, 'Verify OTP!')

                });
            }

            return res.json({ token, success: true, msg: 0 });
        });
    });

};
exports.verifyotp = (req, res) => {
    
    let success = false;
    const token = req.body.token;
    const otp = req.body.otp;

    const query = 'SELECT * FROM taskinviteusers WHERE tt_token = ? AND otp_verify = ?';
    
    db.query(query, [token, otp], (err, results) => {
        if (err) {
            console.error('Error verifying token:', err);
            return res.status(500).json({ success, token });
        }

        if (results.length > 0) {
            const verifyToken = results[0];
            verifyToken.otp_status = 'success'; // Update status
            const updateQuery = 'UPDATE taskinviteusers SET otp_status = ? WHERE id = ?';

            db.query(updateQuery, ['success', verifyToken.id], (err) => {
                if (err) {
                    console.error('Error updating OTP status:', err);
                    return res.status(500).json({ success, token });
                }

                success = true;
                return res.json({ success, token });
            });
        } else {
            return res.json({ success, token });
        }
    });
};


exports.Setprofile = (req, res) => {

let success = false;
    const username = req.body.username;
    const password = req.body.password; // You would typically hash this before checking
    const token = req.body.token;
    

    // Check for the token and OTP in TaskinviteusersModel
    const verifyQuery = 'SELECT * FROM taskinviteusers WHERE tt_token = ? AND otp_status = ?';
    db.query(verifyQuery, [token, 'success'], (err, results) => {
        if (err) {
            console.error('Error verifying token:', err);
            return res.status(500).json({ success, token, code:'' });
        }

        // if (results.length > 0) {
        //     success = true; // Token is valid
        // }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const emailIn   = results[0].tt_user_email;
        const bcryptPsw = bcrypt.hashSync(password, 8)


         const storeTaskQuery = `
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `;

        db.query(storeTaskQuery, [username, emailIn, bcryptPsw], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, error: 'Database error', code: err.errno});
            }

            
            return res.status(200).json({ 
                success: true, 
                message: 'User created successfully'
            });
 
        }); 

    });

}

exports.updatePassword = (req, res) => {
    const token = req.body.token;
    const password = req.body.password;

    User.checkTokenReset(token, password, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, dberror: 'Database error' });
        }
console.log(results);

        if (results) {
            return res.status(200).json({
                message: results.message,
                success: 'ok'
            });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid token or expired' });
        }
    });
};