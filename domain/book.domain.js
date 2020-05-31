const _ = require('lodash');
const fetch = require('node-fetch');

async function GetAuthors() {   //para que resuelva la request en el momento 
    try {
        let response = await fetch('http://localhost:3000/api/authors');
        
        const authors = await response.json();
        
        return authors;
        
    } catch (error) {
        return 'Error al consultar el API Authors';
    }
}

async function BuildAuthorsAndBooksJSON(books) {

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
            else { aux.author_full_name = "author not found"; }
        }

        BookWithAuthor.push(aux);
    }

    return BookWithAuthor;
}

async function checkBeforePUT(books, id, reqBody) {
    
    let response = [];  //valor0 = status code, valor1 = status json
    let flag = false;
    
    for (const b of books) {    //verifica que exista un libro con ese id(url param)
        if (b.id == id) {
            flag = true;
        }
    }
    console.log('VALIDATION 1 COMPLETE');

    if (flag) {
        for (const b of books) {    //valida que el nuevo id del libro no exista en otro libro, pero permite que el libro q posee ese id, lo pise x el mismo valor
    
            if(b.id == reqBody.id && id != reqBody.id) 
            {
                response[0] = 400;
                response[1] = {'statusCode': `Bad Request. The Id=${reqBody.id} you are trying to assign already exists in another book`};
                flag = false;
                break;
            }
        }
        console.log('VALIDATION 2 COMPLETE');
    }
    else {
        response[0] = 400;
        response[1] = {'statusCode': `Bad Request. There aren\'t books with Id=${id}`};     //no se puede modificar un libro que no existe
    }

    if (flag) {
        let authors = await GetAuthors();
        console.log(authors);
                
        let internFlag = true;
    
        for (const a of authors) {              //valida que el authorId nuevo pertenezca a un author existente
            if (a.id == reqBody.authorId) {
                internFlag = false;
                break;
            }
            console.log('CHECKING AUTORS');
        }
    
        if (internFlag) {
            response[0] = 400;
            response[1] = {'statusCode': `Bad Request. The author Id=${reqBody.authorId} you are trying to assign does not match any author`};
            flag = false;
        }        
        console.log('VALIDATION 3 COMPLETE');      
    }
    
    if (flag) {     //si llego hasta aca es porque esta todo ok y hace la modificacion
        _.each(books, (book) => {
            if (book.id == id) {
                book.id = reqBody.id;
                book.name = reqBody.name;
                book.authorId = reqBody.authorId;
                response[0] = 200;
                response[1] = {'modified': 'ok'};
                console.log('VALIDATION 4 COMPLETE - Successful modification');
            }
        });
    }

    return response;
} 


module.exports = {BuildAuthorsAndBooksJSON, checkBeforePUT};
//module.exports = checkBeforePUT;


/*
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
            else { aux.author_full_name = "author not found"; }
        }

        BookWithAuthor.push(aux);
    }

    return BookWithAuthor;   // no es necesario el JSON.parse(BookWithAuthor) pq ya es un json
*/