const { Router } = require('express');
const router = Router();
const _ = require('lodash');
const authors = require('../authors.json');


router.get('/authors', (req, res) => {
    res.json(authors);
});


router.post('/authors', (req, res) => {
    const {id, name, lastname} = req.body;

    if (id && name && lastname) {
        const newAuthor = req.body;
        authors.push(newAuthor);
        res.json({'added': 'ok'});         
    } else {
        res.status(400).json({ 'statusCode': 'Bad Request'});
    }
});

router.delete('/authors/:id', (req, res) => {
    console.log(req.params);
    const id = req.params.id;
    
    _.remove(authors, (author) => {
        return author.id == id;
    });

    res.json(authors);
});

router.put('/authors/:id', (req, res) => {
    const id = req.params.id;
    const {name, lastname} = req.body;

    _.each(authors, (author) => {
        if (author.id == id) {
            author.id = id;
            author.name = name;
            author.lastname = lastname;
        }
    });
    res.json({'modified': 'ok'});
});

module.exports = router;


/*
json de prueba q se envia con post/put desde postman

*/