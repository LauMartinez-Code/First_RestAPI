const express = require('express');
const app = express();
const morgan = require('morgan');
const router = require('../routes/index');

//send and recieve json type data
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(morgan('dev'));
app.use(router);

// npm run app
app.listen(3000, () => {
    console.log(`Server listen on port ${3000}`);
});
