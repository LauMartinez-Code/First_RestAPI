const { Router } = require('express');
const router = Router();
const books = require('../books.json');
const _ = require('lodash');
const bookDomain = require('../domain/book.domain');

router.get('/books/:options', (req, res) => {   // param= 0: return only books,  1: books w/author
    const op = req.params.options;
    
    if (op == 0) {
        res.json(books);
    }
    else if(op == 1){
        (async function() {
            res.json( await bookDomain.BuildAuthorsAndBooksJSON(books) );
        })();
    }
    else {
        res.status(400).json({'statusCode': 'Bad Request. Only parameters parameters 1 or 0 are accepted for this request'});
    }
});


router.post('/books', (req, res) => {
    
    (async function() {
        const response = await bookDomain.checkBeforePOST(books, req.body);     //return array= valor0: status code, valor1: json

        res.status(response[0]).json(response[1]);
    })();

});


router.delete('/books/:id', (req, res) => {
    const id = req.params.id;
    let flag = true;
    
    if (!isNaN(id)) {     //verifica tener un parametro valido
        _.remove(books, (book) => {
            if (book.id == id) {
                flag = false;
                return true;
            }        
        });
    }
    else{
        res.status(404).json({'statusCode': 'Error 404! Cannot DELETE /api/books/ Page not found :( Try another Id'});
    }

    if (flag) {
        res.status(404).json({'statusCode': 'Error 404! Book not found :( Try another Id'});
    }
    else{ res.json(books); }
});


router.put('/books/:id', (req, res) => {
    const id = req.params.id;
    // req.body; => id, name, authorId
    console.log('request body: ', req.body);
    
    if (!isNaN(id)) { //verifica tener un parametro valido
        (async function() {
            const response = await bookDomain.checkBeforePUT(books, id, req.body);  //return array= valor0: status code, valor1: json

            res.status(response[0]).json(response[1]); 
        })();
    }
    else{
        res.status(404).json({'statusCode': 'Error 404! Cannot PUT /api/books/ Page not found :( Try another Id'});
    }

});

module.exports = router;
