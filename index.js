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
        password : "1000Kilometer$",
        database : "turtleshelter",
        port : 5432
    }
})

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

app.post('/ownEvent', (req, res) => {
    const DirFirstName = req.body.DirFirstName; // Default to empty string if not provided
  const DirLastName = req.body.base_total; // Convert to integer
  const DirEmail = req.body.DirEmail; // Default to today
  const EventDate = req.body.EventDate; // Checkbox returns true or undefined
  const EventStartTime = req.body.EventStartTime; // Default to 'U' for Unknown
  const EventStrAddress = req.body.EventStrAddress; // Convert to integer
  const EventCity = req.body.EventCity;
  const EventState = req.body.EventState;
  const EventZip = req.body.EventZip;
  const ServiceType = req.body.ServiceType;
  const Attendance = req.body.Attendance;
  const EventName = req.body.EventName;
  const DirPhone = req.body.DirPhone;
  const JenShareStory = req.body.JenShareStory;

  knex('hosts')
  .insert({
    dirfirstname: DirFirstName, // Ensure description is uppercase
    dirlastname: DirLastName,
    diremail: DirEmail,
    eventdate: EventDate,
    eventstarttime: EventStartTime,
    eventstraddress: EventStrAddress,
    eventcity: EventCity,
    eventstate: EventState,
    eventzip: EventZip,
    servicetype: ServiceType,
    attendance: Attendance,
    eventname: EventName,
    dirphone: DirPhone,
    jensharestory: JenShareStory,
  })
  .then(() => {
      res.redirect('/'); // Redirect to the Pokémon list page after adding
  })
  .catch(error => {
      console.error('Error adding Pokémon:', error);
      res.status(500).send('Internal Server Error');
  });
  
});
// Add similar routes for partner, volunteer, ownEvent, accomplishments, admin

app.listen(port, () => console.log(`Node.js is listening`));