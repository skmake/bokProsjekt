const express = require("express");
const session = require("express-session");
const db = require("better-sqlite3")("db.db", {verbose: console.log})
const path = require("path")

const app = express()

//Lag en nettside viser informasjon om forfattere og bøkene deres. Bruk så mye data fra databsen du klarer. 


app.use(express.static(path.join(__dirname + "/public")))
app.use(express.urlencoded({extended: true}))



app.get("/", (req,res) => {
    res.redirect("index.html")
})


app.get("/forfattere", (req, res) => {
    res.send(db.prepare("SELECT * FROM author").all())
})

app.get("/boker", (req, res) => {
    res.send(db.prepare("SELECT * FROM bibliography").all())
})




app.listen(3000, () => {
    console.log("Up!")
})