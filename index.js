//This code is dne by BYU students as mentioned in the package.json file.
//Code may become property of Turtle Shelter Project 501(c)-3 upon request.

let express = require("express");

let app = express();

let path = require("path");

const port = 3000;

let security = false;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views")); //assigns views folder for index.js to point to

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true}));



//Connect to pgAdmin
const knex = require("knex") ({
    client : "pg",
    connection : {
        host : "localhost",
        user : "postgres",
        password : "password", //My password
        database : "database", //selecting the database I want
        port : 3207 //change this to 3207!! (can find port in pg admin under properties, then connection)
    }
});


//Stuff here

//goes to index.ejs upon website load
app.get('/', (req, res) => { 
    res.render("index")
});

// Add these to your existing index.js
app.get('/admin', (req, res) => { 
    res.render("admin")
});

app.get('/hostForm', (req, res) => { 
    res.render("hostForm")
});

app.get('/jen', (req, res) => { 
    res.render("jen")
});

app.get('/volunteerForm.ejs', (req, res) => { 
    res.render("volunteerForm.ejs")
});

app.get('/difference', (req, res) => { 
    res.render("difference")
});

app.get('/donate', (req, res) => { 
    res.render("donate")
});

app.get('/ownEvent', (req, res) => { 
    res.render("ownEvent")
});

app.get('/volunteer', (req, res) => { 
    res.render("volunteer")
});

app.get('/partner', (req, res) => { 
    res.render("partner")
});

app.get('/accomplishments', (req, res) => { 
    res.render("accomplishments")
});

// Add similar routes for partner, volunteer, ownEvent, accomplishments, admin

app.listen(port, () => console.log(`Node.js is listening`));