const express = require('express');
const router = express.Router();
const { mysql } = require('../db_connect');


router.get('/', (req, res) => {
    const pageSize = req.query.page_size || 30;
    const pageNumber = req.query.page || 1;
    const type = req.query.type;
    if (!type) {
        mysql.query(`SELECT * FROM movie ORDER BY release_date DESC LIMIT ? OFFSET ?`, [+pageSize, +pageNumber], (err, data) => {
            if (err) return res.status(400).send({ error: 'Error' });
            res.status(200).send(data);
        });
    } else {
        mysql.query(`SELECT * FROM movie WHERE type = ? ORDER BY release_date DESC LIMIT ? OFFSET ?`, [type, +pageSize, +pageNumber], (err, data) => {
            if (err) return res.status(400).send({ error: 'Error' });
            res.status(200).send(data);
        });
    }
});


module.exports = router;