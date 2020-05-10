const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 4001;
const dbConnect = require('./routes/db_connect');
const user = require('./routes/user/user');
const media = require('./routes/media/media');
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use(express.json());
app.use(dbConnect);
app.use('/user', user);
app.use('/media', media);

app.use(express.static(`${__dirname}/movies`));

// app.get('*', (req, res) => {
//     res.sendFile(`${__dirname}/movies/index.html`);
// });
const server = app.listen(PORT, () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);

});