const { Router } = require('express');
const router = Router();
const authors = require('./author.route');
const books = require('./book.route');

router.use('/api', authors);
router.use('/api', books); 

module.exports = router;

