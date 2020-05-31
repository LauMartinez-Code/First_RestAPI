const { Router } = require('express');
const router = Router();
const books = require('../books.json');
const _ = require('lodash');
const {BuildAuthorsAndBooksJSON, checkBeforePUT } = require('../domain/book.domain');

router.get('/books/:options', (req, res) => {   // param= 0: return only books,  1: books w/author
    const op = req.params.options;
    
    if (op == 0) {        
        res.json(books);
    }
    else if(op == 1){
        (async function() {
            res.json( await BuildAuthorsAndBooksJSON(books) );
        })();
    }
    else {
        res.status(400).json({'statusCode': 'Bad Request. Only parameters parameters 1 or 0 are accepted for this request'});
    }
});


router.post('/books', (req, res) => {
    const {id, name, authorId} = req.body;

    if (id && name && authorId) {   //validar que el author id exista
        let flag = true;

        for (const b of books) {    //valida que no se agregue un libro con un Id existente
            if (b.id == id) {
                flag = false;
                res.status(400).json({'statusCode': `Bad Request. The book with Id=${id} already exists`});
            }
        }

        if (flag) {
            const newBook = req.body;
            books.push(newBook);
            res.status(201).json({'added': 'ok'});
        }

    } else { res.status(400).json({'statusCode': 'Bad Request. Not all properties given'}); }
});

router.delete('/books/:id', (req, res) => {
    const id = req.params.id;
    let flag = true;
    
    _.remove(books, (book) => {
        if (book.id == id) {
            flag = false;
            return true;
        }        
    });


    if (flag) {
        res.status(404).json({'statusCode': 'Error 404! Book not found :( Try another Id'});
    }
    else{ res.json(books); }
});

router.put('/books/:id', (req, res) => {
    const id = req.params.id;
    const reqBody = req.body;
    console.log(reqBody);
    
    (async function() {
        let response = await checkBeforePUT(books, id, reqBody);  //return array: valor0 = status code, valor1 = json
        
        res.status(response[0]).json(response[1]); 
    })();

});

module.exports = router;