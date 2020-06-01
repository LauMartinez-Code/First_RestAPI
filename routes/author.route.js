const { Router } = require('express');
const router = Router();
const _ = require('lodash');
const authors = require('../authors.json');
const authorDomain = require('../domain/author.domain');


router.get('/authors', (req, res) => {
    res.json(authors);
});


router.post('/authors', (req, res) => {

    const response = authorDomain.checkBeforePOST(authors, req.body);

    res.status(response[0]).json(response[1]);

});

router.delete('/authors/:id', (req, res) => {
    const id = req.params.id;

    if (!isNaN(id)) {   //verifica tener un parametro valido
        (async function() {
            const response = await authorDomain.checkBeforeDELETE(authors, id);
    
            res.status(response[0]).json(response[1]); 
        })();

    }
    else{ res.status(404).json({'statusCode': 'Error 404! Cannot DELETE /api/authors/ Page not found :( Try another Id'});}
});

router.put('/authors/:id', (req, res) => {
    const id = req.params.id;

    if (!isNaN(id)) {
        (async function() {
            const response = await authorDomain.checkBeforePUT(authors, id, req.body);
    
            res.status(response[0]).json(response[1]); 
        })();
    }
    else{
        res.status(404).json({'statusCode': 'Error 404! Cannot PUT /api/authors/ Page not found :( Try another Id'});
    }
});

module.exports = router;
