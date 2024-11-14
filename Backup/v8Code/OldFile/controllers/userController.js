const User = require('../models/User');
const Demoview = require('../models/Demoview'); // Ensure this path is correct


exports.getUser = (req, res) => {
    const userId = req.userId; // This should be set by the verifyToken middleware

    User.getById(userId,(err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send('Error fetching user data');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        res.status(200).json({ success: true, data: results[0] });
    });
};

exports.getAllTasksUser = (req, res) => {
    const userId = req.userId; // This should be set by the verifyToken middleware
    console.log('run app:',userId); // Log the token
    
    Demoview.getAlle((err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
};


exports.updateUser = (req, res) => {
    
    const userId = req.userId;
    const data = req.body;
    User.update(userId, data, (err) => {
        if (err) {
            return res.status(500).send('Error updating task');
        }
        res.send('Task updated');
    });
};