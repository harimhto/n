const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connection = require('./config/db'); // Your database connection
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRouter');
const SpaceRoutes = require('./routes/SpaceRouter');
const commonRoutes = require('./routes/commonRoutes');
const StatusRoutes = require('./routes/StatusRoutes');
const RollAcceessRoutes = require('./routes/RollAcceessRoutes');
const TestRoutes = require('./routes/TestRoutes');
const ProcessRoutes = require('./routes/ProcessRoutes');
const socketIo = require('socket.io');
const cors = require('cors');

const socket = require('./socket'); // Import socket.js

const {
    getAllTasksdemo,getAllTasksUser
} = require('./controllers/taskController');


dotenv.config();
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/user', userRoutes);
app.use('/api/userdemo', getAllTasksdemo);
app.use('/api/user1', userRoutes);
app.use('/api/list-space-project', SpaceRoutes);
app.use('/api/space', SpaceRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/status-list', commonRoutes);
app.use('/api/assignee', commonRoutes);
app.use('/api/status', StatusRoutes);
app.use('/api/roll', RollAcceessRoutes);


// process starts
app.use('/api/process/', ProcessRoutes);
// process end



app.use('/dashboard', TestRoutes);


let users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
];


// app.get('/userskk', (req, res) => {
//     res.json(users);
// });



// Create HTTP server
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const io = socket.init(server);


// Initialize Socket.IO
// const io = socketIo(server, {
//     cors: {
//         origin: "http://localhost:5173", // Update with your client origin
//         methods: ["GET", "POST", "PUT", "DELETE"]
//     }
// });



// // Create HTTP server
// const server = app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

// // Initialize Socket.IO
// const io = socketIo(server, {
//     cors: {
//         origin: "http://localhost:5173", // Update with your client origin
//         methods: ["GET", "POST", "PUT", "UPDATE", "DELETE"]
//     }
// });



// // Socket.IO connection
// io.on('connection', (socket) => {
//     console.log('A user connected');

//     // Example event for receiving messages
//     socket.on('sendMessage', (message) => {
//         io.emit('receiveMessage', message); // Broadcast to all clients
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// });


// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // // Emit the user list to the newly connected client
    // socket.emit('updateUserList', users);

    // // Listen for user updates
    // socket.on('editUser', (updatedUser) => {
    //     // Update the user in the users array
    //     users = users.map(user => (user.id === updatedUser.id ? updatedUser : user));
        
    //     // Broadcast the updated user list to all connected clients
    //     io.emit('updateUserList', users);
    // });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

console.log("Socket.IO initialized"); // Log to ensure io is initialized


module.exports.io = io;