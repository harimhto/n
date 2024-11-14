const User = require('../models/User');
const CommonModel = require('../models/CommonModel');
const StatusModel = require('../models/StatusModel'); // Ensure this path is correct
const SpaceModel = require('../models/SpaceModel'); // Ensure this path is correct
const socket = require('../socket'); // Import socket.js


exports.statusList = (req, res) => {
    StatusModel.getAll((err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
};


// exports.creatStatus = (req, res) => {

//     StatusModel.store(req,(err, results) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 status: '500',
//                 data: null
//             });
//         }
//         res.status(202).json({
//             success: true,
//             status: '202',
//             data: results
//         });
//     });
// };


exports.creatStatus = (req, res) => {
    StatusModel.store(req, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                status: '500',
                data: null
            });
        }

        // Emit the new status creation event
       // Inside creatStatus method in CommonController.js
 try {
        const io = socket.getIO();  // Get the Socket.IO instance
            io.emit('statusCreated', results);  // Emit event
            console.log("Socket.IO event emitted: statusCreated");
        } catch (error) {
            console.error("Socket.IO instance is undefined, event not emitted.", error);
        }


        res.status(202).json({
            success: true,
            status: '202',
            data: results
        });
    });
};


exports.getAssigneeList = (req, res) => {
    const userId = req.userId; // Assuming userId is set by middleware

    if (userId) {

        CommonModel.getInviteOwnerById(userId, (err, userData) => {
            if (err) {
                console.error('Error fetching invite owner:', err);
                return res.status(500).json({
                    success: false,
                    status: '500',
                    error: 'Internal server error',
                });
            }

            // const inviteOwner = userData ? userData.user_id : null;
            
            if (userData && Array.isArray(userData) && userData.length > 0) {

    // Extract email addresses from the userData array
    const userEmails = userData.map(user => user.invite_email);
    
    CommonModel.getUsersByIds(userEmails, (err, userList) => {
        if (err) {
            console.error('Error fetching user list:', err);
            return res.status(500).json({
                success: false,
                status: '500',
                error: 'Internal server error',
            });
        }

        return res.json({
            success: true,
            status: '200',
            data: userList || [],
        });
    });
} else {
    return res.json({
        success: true,
        status: '200',
        data: [],
    });
}

            /*if (userData) {
                const userIds = JSON.parse(userData); // Decode the JSON string
                CommonModel.getUsersByIds(userIds, (err, userList) => {
                    if (err) {
                        console.error('Error fetching user list:', err);
                        return res.status(500).json({
                            success: false,
                            status: '500',
                            error: 'Internal server error',
                        });
                    }

                    return res.json({
                        success: true,
                        status: '200',
                        data: userList || [],
                    });
                });
            } else {
                return res.json({
                    success: true,
                    status: '200',
                    data: [],
                });
            }*/
        });
    } else {
        return res.status(400).json({
            success: false,
            status: '400',
            error: 'User ID not provided',
        });
    }
};


exports.spaceList = (req, res) => {
    const userId = req.userId; // Assuming userId is set by middleware

    SpaceModel.getSpacesByUserId(userId, (err, data) => {
        if (err) {
            console.error('Error fetching spaces:', err);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }

        return res.json({
            success: true,
            data: data,
        });
    });
};