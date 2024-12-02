//This code is dne by BYU students as mentioned in the package.json file.
//Code may become property of Turtle Shelter Project 501(c)-3 upon request.

let express = require("express");

let app = express();

let path = require("path");

const port = 3000;

let security = false;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views")); //assigns views folder for index.js to point to

app.use(express.urlencoded({extended: true}));

//Connect to pgAdmin
const knex = require("knex") ({
    client : "pg",
    connection : {
        host : "localhost",
        user : "postgres",
        password : "FatnessEverd33n", //My password
        database : "starwars", //selecting the database I want
        port : 3207 //change this to 3207!! (can find port in pg admin under properties, then connection)
    }
});


//Stuff here

//goes to index.ejs upon website load
app.get('/', (req, res) => { 
    res.render("index")
});

app.listen(port, () => console.log(`Node.js is listening`));