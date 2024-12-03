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

app.get('/hostEvent', (req, res) => { 
    res.render("hostEvent")
});

app.get('/volunteer', async (req, res) => {
    try {
        // Fetch all event data from the turtleshelter table
        const events = await knex.select('*').from('hosts');
        // Render the EJS template and pass the data
        res.render('volunteer', { events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error retrieving events from the database');
    }
});

app.get('/partner', (req, res) => { 
    res.render("partner")
});

app.get('/accomplishments', (req, res) => { 
    res.render("accomplishments")
});

app.post('/hostEvent', (req, res) => {
    const DirFirstName = req.body.DirFirstName; // Default to empty string if not provided
  const DirLastName = req.body.DirLastName; // Convert to integer
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
      console.error('Error adding Host:', error);
      res.status(500).send('Internal Server Error');
  });
  
});

app.post('/volunteer', async (req, res) => {
    try {
        // Extract volunteer details from the form
        const VolFirstName = req.body.VolFirstName || ''; // Default to empty string if not provided
        const VolLastName = req.body.VolLastName || ''; // Default to empty string if not provided
        const VolEmail = req.body.VolEmail || ''; // Default to empty string if not provided
        const SewingLevel = req.body.SewingLevel || ''; // Default to empty string if not provided
        const ReferralType = req.body.ReferralType || 'U'; // Default to 'U' for Unknown
        const VolunteerHoursMonthly = req.body.VolunteerHoursMonthly || 0; // Default to 0 if not provided

        // Extract ParticipateEvent as an array; ensure it is always an array for consistency
        const participateEvents = Array.isArray(req.body.ParticipateEvent)
            ? req.body.ParticipateEvent
            : req.body.ParticipateEvent
            ? [req.body.ParticipateEvent]
            : [];

        // Insert volunteer into the 'volunteers' table and capture the inserted row
        const [volunteer] = await knex('volunteers')
            .insert({
                volfirstname: VolFirstName,
                vollastname: VolLastName,
                volemail: VolEmail,
                sewinglevel: SewingLevel,
                referraltype: ReferralType,
                volunteerhoursmonthly: VolunteerHoursMonthly,
            })
            .returning('*'); // This returns the inserted volunteer data

        // Check if there are any selected events
        if (participateEvents.length > 0) {
            // Insert a row for each selected event
            const eventVolunteers = participateEvents.map((dirid) => ({
                volunteerid: parseInt(volunteer.volunteerid), // Use the volunteerid from the inserted row
                dirid: parseInt(dirid), // Parse dirid to ensure it's an integer
            }));

            await knex('event_volunteers').insert(eventVolunteers);
        }

        // Send a success message or redirect
        res.redirect('/');

    } catch (error) {
        console.error('Error inserting volunteer:', error);
        res.status(500).send('Error processing your volunteer information.');
    }
});

app.listen(port, () => console.log(`Node.js is listening`));