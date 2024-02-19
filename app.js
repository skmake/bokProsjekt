const express = require("express");
const db = require("better-sqlite3")("db.db", {verbose: console.log})
const path = require("path")

const app = express()

app.use(express.static(path.join(__dirname + "/public")))
app.use(express.urlencoded({extended: true}))

app.get("/", (req,res) => {
    res.redirect("index.html")
})

// Gir deg all info om alle forfattere.
app.get("/forfattere", (req, res) => {
    res.json(db.prepare("SELECT * FROM author").all())
})

// Gir deg all info om en forfatter. Id refererer til forfatterens id i author-tabellen.
app.get("/forfattere/:id", (req, res) => {
    res.json(db.prepare("SELECT * FROM author WHERE id = ?").get(req.params.id))
})

// Gir deg alle bøkene en forfatter har skrevet. Id refererer til forfatterens id i author-tabellen.
app.get("/forfattere/:id/boker", (req, res) => {
    res.json(db.prepare("SELECT * FROM bibliography WHERE author = ?").all(req.params.id))
})

// Gir deg all info om en bok. Id refererer til bokens id i bibliography-tabellen.
app.get("/boker/:id", (req, res) => {
    res.json(db.prepare("SELECT name, author.author, img, pages, summary, country FROM bibliography INNER JOIN author ON author.id = bibliography.author  WHERE bibliography.id = ? ").get(req.params.id))
})

// Gir deg alle blurbs om en gitt bok. Du får forfatter som har skrevet blurben, samt selve blurben. Id refererer til bokens id i bibliography-tabellen.
app.get("/blurbs/:id", (req, res) => {
    res.json(db.prepare("SELECT blurb, author FROM blurbs INNER JOIN author ON author.id = blurb.blurb_author WHERE book_id = ?").get(req.params.id))
})

// Gir deg alle sjangrene til en bok. Id refererer til bokens id i bibliography-tabellen.
app.get("/sjangre/:id", (req, res) => {
    res.json(db.prepare("SELECT genre.genre FROM genrebooks INNER JOIN genre ON genrebooks.genre = genre.id  WHERE book = ?").get(req.params.id))
})

// Gir deg all info om alle bøkene
app.get("/boker", (req, res) => {
    res.send(db.prepare("SELECT * FROM bibliography").all())
})

app.listen(3000, () => {
    console.log("Up!")
})