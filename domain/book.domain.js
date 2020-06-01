const _ = require('lodash');
const fetch = require('node-fetch');

async function GetAuthors() {
    try {
        let response = await fetch('http://localhost:3000/api/authors');
        
        const authors = await response.json();
        
        return authors;
        
    } catch (error) {
        return 'Error al consultar el API Authors';
    }
}

function checkBooksId(books, id) {   // verifica que exista un libro con ese id (el id puede ser el de: url param o request.body )
    result = false;                 //retorna true cuando encuentra un libro con el id a comparar

    for (const b of books) {    
        if (b.id == id) {
            return !result;
        }
    }

    return result;
}


async function checkAuthorsId(authorId) {      //valida que el authorId nuevo pertenezca a un author existente
    result = false;                           //retorna true cuando encuentra un author con el authorId a comparar

    const authors = await GetAuthors();
    console.log(authors);

    for (const a of authors) {
        if (a.id == authorId) {
            return !result;
        }
        console.log('CHECKING AUTORS');
    }

    return result;

}


async function BuildAuthorsAndBooksJSON(books) {    //genera un json que contiene los datos del libro con los nombres de sus respectivos autores

    let authors = await GetAuthors();
    console.log(authors);
    
    let BookWithAuthor = [];
            
    for (let i = 0; i < books.length; i++) {
        
        let aux = {
            "id": books[i].id,
            "name": books[i].name,
            "authorId": books[i].authorId
        };

        for (let j = 0; j < authors.length; j++) {
            if( authors[j].id == books[i].authorId ) {        
                aux.author_full_name =  authors[j].name + ' ' + authors[j].lastname;
                break;
            }  
            else { aux.author_full_name = "author not found"; } //nunca deberia de ocurrir pero nunca digas nunca
        }

        BookWithAuthor.push(aux);
    }

    return BookWithAuthor;
}

async function checkBeforePOST(books, reqBody) {
    
    let response = []; //valor0: status code, valor1: status json
    
    if ( reqBody.id && reqBody.authorId && reqBody.name && !isNaN(reqBody.id) && !isNaN(reqBody.authorId) ) {    // verifica si los datos estan completos y son correctos

        if (checkBooksId(books, reqBody.id)) {  //valida que no exista un libro con ese id
            response.push(400, {'statusCode': `Bad Request. The book with Id=${reqBody.id} already exists`});
            return response;
        }

        if ( !(await checkAuthorsId(reqBody.authorId)) ) { //valida que el Id del author exista
            response.push(400, {'statusCode': `Bad Request. The author Id=${reqBody.authorId} you are trying to assign does not match any author`});
            return response;
        }

        const newBook = reqBody;   //si todo ok crea el nuevo libro
        books.push(newBook);
        response.push(201, {'added': 'ok'});
        return response;
        
    }
    else { 
        response.push(400, {'statusCode': 'Bad Request. Book id or author id are not numbers, or not all properties given'});
        return response;
    }
}

async function checkBeforePUT(books, id, reqBody) {

    let response = [];  //valor0: status code, valor1: status json

    if ( reqBody.id && reqBody.authorId && reqBody.name && !isNaN(reqBody.id) && !isNaN(reqBody.authorId) ) {
        
        if (!checkBooksId(books, id)) {  // verifica que exista un libro con ese id(url param)
            response.push(404, {'statusCode': `Not found :( There aren\'t books with Id=${id}`});   //no se puede modificar un libro que no existe
            return response;
        }
        console.log('VALIDATION 1 COMPLETE');


        if (checkBooksId(books, reqBody.id) && id != reqBody.id) {  //valida que el nuevo id del libro no exista en otro libro, pero permite que el libro q posee ese id, lo pise x el mismo valor

            response.push(400, {'statusCode': `Bad Request. The Id=${reqBody.id} you are trying to assign already exists in another book`} );
            return response;
        }
        console.log('VALIDATION 2 COMPLETE');

        if ( !(await checkAuthorsId(reqBody.authorId)) ) { //verifica que el author exista

            response.push(400, {'statusCode': `Bad Request. The author Id=${reqBody.authorId} you are trying to assign does not match any author`});
            return response;
        }
        console.log('VALIDATION 3 COMPLETE');      
    
        _.each(books, (book) => {   //si llego hasta aca es porque esta todo ok y hace la modificacion
            if (book.id == id) {
                book.id = reqBody.id;
                book.name = reqBody.name;
                book.authorId = reqBody.authorId;
                response.push(200, {'modified': 'ok'} );
                console.log('VALIDATION 4 COMPLETE - Successful modification');
            }
        });

        return response;
    }
    else{
        response.push(400, {'statusCode': 'Bad Request. Book id or author id are not numbers, or not all properties given'});
        return response;
    }
} 

module.exports = {BuildAuthorsAndBooksJSON, checkBeforePUT, checkBeforePOST};
