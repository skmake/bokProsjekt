/*
Sortering av sjanger

Det ligger ingen rute for å vise alle bøker basert på en sjanger. 
Du kan lage en rute med en variant av denne spørringen for få info om bøker som hører til en spesifikk sjanger:



SELECT bibliography.name, bibliography.img, bibliography.author, bibliography.pages, bibliography.summary, author.author, genre.genre FROM bibliography
INNER JOIN author ON bibliography.author = author.id
INNER JOIN genrebooks ON genrebooks.book = bibliography.id
INNER JOIN genre on genrebooks.genre = genre.id
WHERE genre.genre = "Thriller"


*/ 


const express = require("express");
const db = require("better-sqlite3")("db.db", {verbose: console.log})
const path = require("path")
const multer = require('multer');

const app = express()

app.use(express.static(path.join(__dirname + "/public")))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get("/", (req,res) => {
    res.redirect("/velkommen.html")
})


// Gir deg all info om alle forfattere.
app.get("/forfattere", (req, res) => {
    res.json(db.prepare("SELECT * FROM author").all())
})

// Gir deg all info om en forfatter. Id refererer til forfatterens id i author-tabellen. 
app.get("/forfattere/:id", (req, res) => {
    res.json(db.prepare("SELECT * FROM author WHERE id = ?").get(req.params.id))
})

// Gir deg id til forfatteren basert på navn. Name refererer til forfatterens navn i author-tabellen.
app.get("/forfatterId/:name", (req, res) => {
    function checkForAuthor(authorName) {
        const authorExists = db.prepare("SELECT * FROM author WHERE author LIKE ?").get('%' + authorName + '%');
        if (authorExists) {
            console.log("Found an author containing '" + authorName + "'");
            console.log(authorExists);
            return authorExists;
        } else {
            console.log("No author found containing '" + authorName + "'");
            return { message: "No author found containing '" + authorName + "'" };
        }
    }
    
    const result = checkForAuthor(req.params.name);
    res.json(result);
})

// Gir deg alle bøkene en forfatter har skrevet. Id refererer til forfatterens id i author-tabellen.
app.get("/forfatterBoker/:id", (req, res) => {
    res.json(db.prepare("SELECT * FROM bibliography WHERE author = ?").all(req.params.id))
})


app.get("/forfatterBok/:id", (req, res) => {
    res.json(db.prepare("SELECT bibliography.name, author.author, bibliography.img, pages, summary, country FROM bibliography INNER JOIN author ON author.id = bibliography.author WHERE bibliography.id = ? ").get(req.params.id))
});

// Gir deg all info om en bok. Id refererer til bokens id i bibliography-tabellen.
app.get("/boker/:id", (req, res) => {
    res.json(db.prepare("SELECT name, author.author, bibliography.img, pages, summary, country FROM bibliography INNER JOIN author ON author.id = bibliography.author WHERE bibliography.id = ? ").get(req.params.id))
})

// Gir deg alle blurbs om en gitt bok. Du får forfatter som har skrevet blurben, samt selve blurben. Id refererer til bokens id i bibliography-tabellen.
app.get("/blurbs/:id", (req, res) => {
    res.json(db.prepare("SELECT blurb, author FROM blurbs INNER JOIN author ON author.id = blurbs.blurb_author WHERE book_id = ?").all(req.params.id))
})

// Gir deg alle blurbs om en gitt bok. Du får forfatter som har skrevet blurben, samt selve blurben. Id refererer til bokens id i bibliography-tabellen.
app.get("/blubs/:id", (req, res) => {
    res.json(db.prepare("SELECT * FROM blurbs WHERE book_id = ?").all(req.params.id))
})

// Gir deg alle sjangrene til en bok. Id refererer til bokens id i bibliography-tabellen.
app.get("/sjangre/:id", (req, res) => {
    res.json(db.prepare("SELECT genre.genre FROM genrebooks INNER JOIN genre ON genrebooks.genre = genre.id  WHERE book = ?").all(req.params.id))
})

// Gir deg alle bøkene til alle sjangrene.
app.get("/sjanger", (req, res) => {
    res.json(db.prepare("SELECT * FROM genre").all())
})

// Gir deg all info om alle bøkene
app.get("/boker", (req, res) => {
    res.send(db.prepare("SELECT * FROM bibliography").all())
})

// Gir deg all info om en bok. Name refererer til bøkenes navn i bibliography-tabellen.
app.get("/bok/:name", (req, res) => {

    function checkForBook(bookName) {
        const bookExists = db.prepare("SELECT * FROM bibliography WHERE name LIKE ?").get('%' + bookName + '%');
        if (bookExists) {
            console.log("Found a book containing '" + bookName + "'");
            console.log(bookExists);
            return bookExists;
        } else {
            console.log("No book found containing '" + bookName + "'");
            return "error";
        }
    }
    
    const result = checkForBook(req.params.name);
    res.json(result);
})

app.get("/boks/:id", (req, res) => {
    res.json(db.prepare("SELECT * FROM bibliography WHERE id = ?").get(req.params.id))
})

// Gir deg alle bøkene til en gitt sjanger. Genre refererer til sjangeren i genre-tabellen.
app.get("/bokSjanger/:genre", (req, res) => {
    res.json(db.prepare("SELECT * FROM genrebooks WHERE genre = ?").all(req.params.genre))
})



app.get("/alleSjangre", (req, res) => {
    res.json(db.prepare("SELECT * FROM genrebooks"))
})

// Bruker multer for å laste opp bilder til serveren.
const storageBooks = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '/public/img/books'))
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })

  const storageAuthors = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '/public/img/authors'))
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })

    const uploadAuthors = multer({ storage: storageAuthors })

  
  const uploadBooks = multer({ storage: storageBooks })

  
  app.post('/upload/books', uploadBooks.single('file'), (req, res, next) => {
    console.log(`Received book file ${req.file.originalname}`);
    res.sendStatus(200);
}, (error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'An error occurred on the server.' });
});
  
app.post('/upload/authors', uploadAuthors.single('file'), (req, res, next) => {
    console.log(`Received author file ${req.file.originalname}`);
    res.sendStatus(200);
}, (error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'An error occurred on the server.' });
});



    app.post("/addBok", (req, res) => {
     try{
        const {name,img,pages,author,summary} = req.body
        checkBookAdded(name,img,pages,author,summary)
        

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred on the server.');
    }
    });

    async function checkBookAdded(theName, theImg, thePages, theAuthor, theSummary) {
        const book = db.prepare("SELECT * FROM bibliography WHERE name = ?").get(theName)
        if (book) {
            console.log("Book already exists: ", theName)
        } else {
            console.log("Book added: ", theName)
            db.prepare("INSERT INTO bibliography (name, img, pages, author, summary) VALUES (?, ?, ?, ?, ?)").run(theName, theImg, thePages, theAuthor, theSummary)

        }
    }


  app.post("/addAuthor", (req, res) => {
    try {
        const {name,bday,img,country,biography} = req.body
        checkAuthorAdded(name,bday,img,country,biography)

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred on the server.');
    }
});

  async function checkAuthorAdded(theName, theBday, theImg, theCountry, theBiography) {
    const author = db.prepare("SELECT * FROM author WHERE author = ?").get(theName)
    if (author) {
        console.log("Author already exists: ", theName)
    } else {
        console.log("Author added: ", theName)
        db.prepare("INSERT INTO author (author, bday, img, country, biography) VALUES (?, ?, ?, ?, ?)").run(theName, theBday, theImg, theCountry, theBiography)

    }
}

app.post("/addBlurb", (req, res) => {
    try {
        const {book_id, blurb, blurb_author} = req.body
        console.log(book_id, blurb, blurb_author)
        db.prepare("INSERT INTO blurbs (book_id, blurb, blurb_author) VALUES (?, ?, ?)").run(book_id, blurb, blurb_author)
        res.redirect("/")
        
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred on the server.');
    }});

app.post("/addGenre", (req, res) => {
    try {
        const {genre,book} = req.body
        
         if (newCheckGenreAdded(genre,book)=="Genre already exists") {
            console.log("Genre already exists", genre)
            addGenreToBook(genre,book)
        }
        else {
            console.log("Genre added")
            addGenreToBook(genre,book)
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred on the server.');
    }});

async function newCheckGenreAdded(theGenre, theBook) {
    const genre = db.prepare("SELECT * FROM genre WHERE genre = ?").get(theGenre)
    console.log("genre: ", genre)
    if (genre) {
        return "Genre already exists"
        
    } else {
        
        db.prepare("INSERT INTO genre (genre) VALUES (?)").run(theGenre)
        return "Genre added"
    }
}

async function addGenreToBook(theGenre, theBook) {
    const theGenreId = db.prepare("SELECT id FROM genre WHERE genre = ?").get(theGenre)
    console.log("theGenreId: ", theGenreId)
    db.prepare("INSERT INTO genrebooks (genre, book) VALUES (?, ?)").run(theGenreId.id, theBook)
}


// Det var et problem med genrebooks, fisket det med å lage en ny tabell og kopiere over dataen.
// Så slettet jeg den gamle tabellen og endret navnet på den nye tabellen til det den gamle het.
// Så slettet jeg de to radene som var feil i genre-tabellen.
function createNewGenre(){
    db.prepare(`
        CREATE TABLE IF NOT EXISTS genre2 (
            id INTEGER PRIMARY KEY,
            genre INTEGER,
            book INTEGER
        )
    `).run();

    let rows = db.prepare("SELECT COUNT(*) as count FROM genre2").all();
    if (rows[0].count === 0) {
        db.prepare("INSERT INTO genre2 (id, genre, book) SELECT id, genre, book FROM genrebooks").run();
        db.prepare("DROP TABLE IF EXISTS genrebooks;").run();
        db.prepare("ALTER TABLE genre2 RENAME TO genrebooks;").run();
    }

    db.prepare("DELETE FROM genre WHERE id = 13 AND genre = 'Memoir'").run();

    db.prepare("DELETE FROM genre WHERE id = 14 AND genre = 'Non-fiction'").run();
}

createNewGenre();




app.listen(3000, () => {
    console.log("Up!")
})