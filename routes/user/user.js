const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { mysql } = require('../db_connect');
const { verifyToken, generateToken } = require('../../middlewares/jwt');

// register new user
router.post('/register', (req, res) => {
    const { username, email, password, gander } = req.body;
    mysql.query(`INSERT INTO users (username, email, password, gander) VALUES (?,?,?,?)`, [username, email, password, gander],
        (err, result) => {
            if (err) return res.status(400).send({ error: 'Error' });
            if (result) {
                const token = generateToken({ userId: result.insertId, username });
                res.status(200).send({ success: 'user registerd successfully', token });
            }
        });
});

// login user
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    mysql.query('SELECT id FROM users WHERE username = ? AND password = ?', [username, password],
        (err, result) => {
            if (err) return res.status(400).send({ error: 'user not registerd' });
            if (result.length > 0) {
                const token = generateToken({ userId: result[0].id, username });
                res.status(200).send({ token });
            } else {
                res.status(400).send({ error: 'user not registerd' });
            }
        });
});


// user rate

router.post('/rate', verifyToken, (req, res) => {

    // get token and decode it 
    const headerToken = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.decode(headerToken);

    const { movieId, rate } = req.body;

    // if user already rate this movie going to update it if first time rate insert new record in db
    mysql.query(`SELECT movie_id FROM rating WHERE user_id = ? AND movie_id = ?`,
        [decodedToken.userId, movieId], (selectError, selectResult) => {
            if (selectError) return res.status(400).send({ error: 'error' });
            // check if user aleady rate this movie
            if (selectResult.length > 0) {
                mysql.query(`UPDATE rating SET user_rate=? WHERE user_id = ? AND movie_id = ?`,
                    [rate, decodedToken.userId, movieId], (updateError, updateResult) => {
                        if (updateError) return res.status(400).send({ error: 'Error Rating' });
                        if (updateResult) res.status(200).send({ success: 'rating success' });
                    });
            } else {
                // if user first rate to this movie then insert new record in db
                mysql.query(`INSERT INTO rating(user_id, user_rate, movie_id) VALUES (?,?,?)`,
                    [decodedToken.userId, rate, movieId], (insertError, insertResult) => {
                        if (insertError) return res.status(400).send({ error: 'Error Rating' });
                        if (insertResult) res.status(200).send({ success: 'rating success' });
                    });
            }
        });


});
module.exports = router;