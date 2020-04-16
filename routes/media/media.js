const express = require('express');
const router = express.Router();
const { mysql } = require('../db_connect');

// get all data
router.get('/', (req, res) => {
    const { page_size, page, type } = req.query;
    const customType = `%${type || ''}%`;
    mysql.query(`SELECT movie.*, AVG(rating.user_rate) as users_rate FROM movie LEFT JOIN rating ON movie.id = rating.movie_id Where type Like ? GROUP BY movie.id ORDER BY users_rate DESC LIMIT ? OFFSET ?`,
        [customType, +page_size || 30, +page || 1],
        (err, data) => {
            if (err) return res.status(400).send({ error: 'Error' });
            const searchResult = data.map(result => {
                result.genre_ids = result.genre_ids.split(',').map(num => +num);
                return result;
            });
            res.status(200).send(searchResult);
        });
});

// get heigh rate "rateflix"
router.get('/heigh-rate', (req, res) => {
    const { limit } = req.query;
    mysql.query(`SELECT movie.*, AVG(rating.user_rate) as users_rate FROM movie LEFT JOIN rating ON movie.id = rating.movie_id GROUP BY movie.id ORDER BY users_rate DESC LIMIT ?`,
        [+limit],
        (err, data) => {
            if (err) return res.status(400).send({ error: 'Error' });
            const searchResult = data.map(result => {
                if (result.genre_ids) {
                    result.genre_ids = result.genre_ids.split(',').map(num => +num);
                }
                return result;
            });
            res.status(200).send(searchResult);
        });
});

// get single item
router.get('/single_item', (req, res) => {
    const { id, title } = req.query;
    mysql.query(`SELECT movie.*, AVG(rating.user_rate) as users_rate FROM movie LEFT JOIN rating ON movie.id = rating.movie_id WHERE movie.id = ? AND original_title = ? `, [id, title], (err, result) => {
        if (err) return res.status(400).send({ error: 'Error' });
        if (result[0].genre_ids !== null && result[0].genre_ids.length > 0) {
            result[0].genre_ids = result[0].genre_ids.split(',').map(num => +num);
            res.status(200).send(result);
        }
    });
});

// searching
router.post('/search', (req, res) => {
    const { title, type, genreIds, limit } = req.body;
    const customTitle = `%${title || ''}%`;
    const customGenere = `%${genreIds || ''}%`;
    const customType = `%${type || ''}%`;

    if (!title || title.length < 2) return res.status(200).send([]);
    mysql.query(`SELECT id, movie.genre_ids, movie.original_title, movie.title, movie.type, AVG(rating.user_rate) as users_rate FROM movie LEFT JOIN rating ON movie.id = rating.movie_id WHERE original_title Like ? AND type LIKE ? AND genre_ids LIKE ? GROUP BY movie.id ORDER BY rating.user_rate DESC LIMIT ? `, [customTitle, customType, customGenere, +limit || 50], (err, data) => {
        if (err) return res.status(400).send({ error: 'Error' });

        const searchResult = data.map(result => {
            if (result.genre_ids !== null && result.genre_ids.length > 0) {
                result.genre_ids = result.genre_ids.split(',').map(num => +num);
            }
            return result;
        });
        res.status(200).send(searchResult);
    });
});

// search multi options
router.post('/multi-search', (req, res) => {
    const { type, after, befor, rateFlix, imdb, ageRestriction, limit, genreIds } = req.body;
    const customGenere = `%${genreIds || ''}%`;

    mysql.query(`SELECT movie.*, rating.user_rate AS users_rate FROM movie LEFT JOIN rating ON movie.id = rating.movie_id WHERE type = ? AND (release_date > ? AND release_date < ? ) AND (rating.user_rate > ?) AND (imdb_rate > ? ) ORDER BY rating.user_rate DESC LIMIT ? `,
        [type, +after || 1950, +befor || 2030, +rateFlix || 1, +imdb || 1, +limit || 50],
        (err, data) => {
            if (err) return res.status(400).send({ error: 'Error' });
            const searchResult = data.map(result => {
                if (result.genre_ids !== null && result.genre_ids.length > 0) {
                    result.genre_ids = result.genre_ids.split(',').map(num => +num);
                }
                return result;
            });
            res.status(200).send(searchResult);
        });
});

// get movie category

router.get('/category', (req, res) => {
    const { category, limit, page } = req.query;

    mysql.query(`SELECT movie.*, AVG(rating.user_rate) as users_rate FROM movie LEFT JOIN rating ON movie.id = rating.movie_id WHERE find_in_set(?, movie.genre_ids) GROUP BY movie.id ORDER BY rating.user_rate DESC LIMIT ? OFFSET ?`,
        [+category, +limit || 25, +page || 1],
        (err, data) => {
            if (err) return res.status(400).send({ error: 'Error' });
            const searchResult = data.map(result => {
                if (result.genre_ids !== null && result.genre_ids.length > 0) {
                    result.genre_ids = result.genre_ids.split(',').map(num => +num);
                }
                return result;
            });
            res.status(200).send(searchResult);
        });
});

module.exports = router;

// to get movies categories
// SELECT * FROM `movie` WHERE FIND_IN_SET('12', genre_ids) AND FIND_IN_SET('13', genre_ids)