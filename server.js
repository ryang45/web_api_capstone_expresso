const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const cors = require('cors');

const apiRouter = require('./api/api');

const app = express();
const PORT = process.env.PORT || 4000;

//middleware helpers
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
