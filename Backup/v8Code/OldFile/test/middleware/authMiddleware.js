const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Token received:', token); // Log the token

    if (!token) {
        console.error('No token provided');
        return res.sendStatus(403);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            return res.sendStatus(403);
        }
        req.userId = decoded.id;
        next();
    });
};



exports.verifyTokenMan = (req, res, next) => {
    const authHeader = req.body.token;
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Token received:', token); // Log the token

    if (!token) {
        console.error('No token provided');
        return res.sendStatus(403);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            return res.sendStatus(403);
        }
        req.userId = decoded.id;
        next();
    });
};
