const _ = require('lodash');
const fetch = require('node-fetch');

async function GetBooks() {
    try {
        let response = await fetch('http://localhost:3000/api/books/0');
        
        const books = await response.json();
        
        return books;
        
    } catch (error) {
        return 'Error al consultar el API Books';
    }
}

function checkAuthorsId(authors, id) {      //valida que el id del author nuevo no pertenezca a un author existente
    result = false;                        //retorna true cuando encuentra un author con el id a comparar

    for (const a of authors) {
        if (a.id == id) {
            return !result;
        }
    }

    return result;
}

 function checkBeforePOST(authors, reqBody) {
    
    let response = []; //valor0: status code, valor1: status json
    
    if ( reqBody.id && reqBody.name && reqBody.lastname && !isNaN(reqBody.id) ) {    // verifica si los datos estan completos y son correctos

        if ( checkAuthorsId(authors, reqBody.id) ) {    //valida que el Id del author no exista

            response.push(400, {'statusCode': `Bad Request. Author Id=${reqBody.id} you are trying to assign already exists`});
            return response;
        }

        const newAuthor = reqBody;  //si esta todo ok crea el nuevo autor
        authors.push(newAuthor);
        response.push(201, {'added': 'ok'});
        return response;
        
    }
    else { 
        response.push(400, {'statusCode': 'Bad Request. Author Id is not a number, or not all properties given'});
        return response;
    }
}

async function checkBeforePUT (authors, id, reqBody) {

    let response = []; //valor0: status code, valor1: status json

    if ( reqBody.id && reqBody.name && reqBody.lastname && !isNaN(reqBody.id) ) {    // verifica si los datos estan completos y son correctos

        if (!checkAuthorsId(authors, id)) {  // verifica que exista un author con ese id(url param)
            response.push(404, {'statusCode': `Not found :( There aren\'t authors with Id=${id}`});   //no se puede modificar un autor que no existe
            return response;
        }
        
        if ( checkAuthorsId(authors, reqBody.id) && id != reqBody.id ) {    //valida que el nuevo id del autor no exista previamente, pero permite que el autor q posee ese id lo pise x el mismo valor

            response.push(400, {'statusCode': `Bad Request. Author Id=${reqBody.id} you are trying to assign already exists`});
            return response;
        }
        
        _.each(authors, (author) => {   //si llego hasta aca es porque esta todo ok y hace la modificacion
            if (author.id == id) {
                author.id = reqBody.id;
                author.name = reqBody.name;
                author.lastname = reqBody.lastname;
            }
        });

        const books = await GetBooks();

        for (const book of books) {    //actualiza los libros con el nuevo authorId
            if (book.authorId == id) {
                let request = {
                    'method': 'PUT',
                    'headers': {'Content-Type': 'application/json'},
                    body: JSON.stringify({"id":`${book.id}`, "name":`${book.name}`, "authorId":`${reqBody.id}`})
                };

                await fetch(`http://localhost:3000/api/books/${book.id}`, request);
            }  
        }
        
        response.push(200, {'modified': 'ok'});
        return response;
    }
    else{
        response.push(400, {'statusCode': 'Bad Request. Author Id is not a number or not all properties given'});
        return response;
    }
}

async function checkBeforeDELETE(authors, id){

    let response = [];
    
    if (checkAuthorsId(authors, id)) {
        
        const books = await GetBooks();
        let count = 0;

        for (const book of books) {     //verifica si el autor tiene libros asociados
            if (book.authorId == id) {
                count++;
            }
        }

        if (!count) {                    //si no tiene libros asociados, puede eliminarse
            _.remove(authors, (author) => {
                return author.id == id;
            });

            response.push(200, authors);
            return response;
        }
        else {
            response.push(412, {'statusCode': `Bad Request. It is not possible delete the author with Id=${id} due to referential integrity. This author has ${count} linked books, please remove them previously and try again`});
            return response;
        }

    } else {
        response.push(404, {'statusCode': 'Error 404! Author not found :( Try another Id'});
        return response;
    }
    
}

module.exports = {checkBeforePOST, checkBeforePUT, checkBeforeDELETE};