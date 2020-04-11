const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.verifyToken = (req, res, next) => {

    let token;
    if (req.headers.authorization) token = req.headers.authorization.split(' ')[1];

    if (!token || token == 'null') return res.status(401).send({ error: 'Unauthorized request' });

    try {
        const vfToken = jwt.verify(token, process.env.jwtKey);
        if (!vfToken) return res.status.send({ error: 'invalid token' });
        next();
    } catch (e) {
        res.status(401).send({ error: 'invalid token' });
    }
};

module.exports.generateToken = (payload) => {
    return jwt.sign(payload, process.env.jwtKey);
};