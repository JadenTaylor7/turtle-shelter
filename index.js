//This code is dne by BYU students as mentioned in the package.json file.
//Code may become property of Turtle Shelter Project 501(c)-3 upon request.

let express = require("express");

let bcrypt = require("bcryptjs")

let app = express();

let path = require("path");

const port = 3000;

let security = false;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views")); //assigns views folder for index.js to point to

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true}));

const session = require('express-session');

// Middleware for handling sessions
app.use(session({
    secret: 'JensSecretKey', // Replace with a secure secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to `true` if using HTTPS
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

//Connect to pgAdmin
const knex = require("knex") ({
    client : "pg",
    connection : {
        host : "localhost",
        user : "postgres",
        password : "1000Kilometer$", //ChooseTheR1ght! for website
        database : "turtleshelter",
        port : 5432
    }
})
//awd RDS endpoint: turtleshelter.cumdalvhwixf.us-east-1.rds.amazonaws.com

//goes to index.ejs upon website load
app.get('/', (req, res) => { 
    res.render("index")
});

// Add these to your existing index.js
app.get('/admin', (req, res) => { 
    res.render("admin")
});

app.get('/register', (req, res) => { 
    res.render("register")
});

app.get('/login', (req, res) => { 
    res.render("login")
});

app.get('/hostForm', (req, res) => { 
    res.render("hostForm")
});

app.get('/jen', (req, res) => { 
    res.render("jen")
});

app.get('/requested-events', async (req, res) => { 
    try {
        // Fetch all events where approveevent is false or null
        const events = await knex('hosts')
            .select('*')
            .whereNot('approveevent', true); // Filter out events where approveevent is true

        // Render the EJS template and pass the filtered data
        res.render('requested-events', { events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error retrieving events from the database');
    }
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

app.get('/usersettings', (req, res) => { 
    res.render("usersettings")
});

app.get('/teammember', (req, res) => { 
    res.render("teammember")
});

app.get('/volunteer', async (req, res) => {
    try {
        // Fetch all events where approveevent is false or null
        const events = await knex('hosts')
            .select('*')
            .where('approveevent', true) // Filter out events where approveevent is true
            .andWhere('openness', 'public');

        // Render the EJS template and pass the filtered data
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
    const HostFirstName = req.body.HostFirstName; // Default to empty string if not provided
  const HostLastName = req.body.HostLastName; // Convert to integer
  const HostEmail = req.body.HostEmail; // Default to today
  const EventDate = req.body.EventDate; // Checkbox returns true or undefined
  const EventStartTime = req.body.EventStartTime; // Default to 'U' for Unknown
  const EventStrAddress = req.body.EventStrAddress; // Convert to integer
  const EventCity = req.body.EventCity;
  const EventState = req.body.EventState;
  const EventZip = req.body.EventZip;
  const ServiceType = req.body.ServiceType;
  const Attendance = req.body.Attendance;
  const GroupAge = req.body.GroupAge;
  const Openness = req.body.Openness;
  const EventName = req.body.EventName;
  const HostPhone = req.body.HostPhone;
  const JenShareStory = req.body.JenShareStory;

  knex('hosts')
  .insert({
    hostfirstname: HostFirstName, // Ensure description is uppercase
    hostlastname: HostLastName,
    hostemail: HostEmail,
    eventdate: EventDate,
    eventstarttime: EventStartTime,
    eventstraddress: EventStrAddress,
    eventcity: EventCity,
    eventstate: EventState,
    eventzip: EventZip,
    servicetype: ServiceType,
    attendance: Attendance,
    groupage: GroupAge,
    openness: Openness,
    eventname: EventName,
    hostphone: HostPhone,
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
            const eventVolunteers = participateEvents.map((hostid) => ({
                volunteerid: parseInt(volunteer.volunteerid), // Use the volunteerid from the inserted row
                hostid: parseInt(hostid), // Parse hostid to ensure it's an integer
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

app.post('/users/register', async (req, res) => {
    const { username, password, adminkey } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine the role based on the admin key
        const role = adminkey === 'JensAdminKey' ? 'admin' : 'volunteer'; // Replace 'correct-admin-key' with your actual key

        // Insert the user into the database
        const [userId] = await knex('users')
            .insert({
                username: username,
                password: hashedPassword,
                role: role, // Set the role based on the provided admin key
            })
            .returning('userid'); // Returning the ID of the new user

        console.log(`New user created with ID: ${userId} and role: ${role}`);

        // Redirect to login page after successful registration
        res.redirect('/');
    } catch (error) {
        console.error('Error during registration:', error);

        if (error.code === '23505') {
            // Handle duplicate username error (specific to PostgreSQL)
            return res.status(400).send('Username already exists');
        }

        res.status(500).send('Error registering user');
    }
});

app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username in the database
        const user = await knex('users')
            .where({ username: username })
            .first(); // Retrieve the first matching row

        if (!user) {
            return res.status(400).send('Cannot find user');
        }

        // Compare the password entered by the user with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // If the passwords match, store the user ID and role in the session
            req.session.userId = user.userid; // Assuming 'id' is the user's primary key
            req.session.role = user.role; // Store the role in the session

            console.log(`User logged in: ID = ${user.userid}, Role = ${user.role}`);

            // Redirect to the home page after login
            return res.redirect('/');
        } else {
            // If the passwords don't match
            return res.status(400).send('Incorrect password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error logging in');
    }
});

app.post('/requested-events', async (req, res) => {
    try {
        // Extract the array of approved event IDs from the request
        const approvedEventIds = req.body.ApproveEvents || [];

        if (approvedEventIds.length > 0) {
            // Update `approveevent` to true for all selected events
            await knex('hosts')
                .whereIn('hostid', approvedEventIds)
                .update({ approveevent: true });
        }

        // Redirect or send a success response
        res.redirect('/');
    } catch (error) {
        console.error('Error updating events:', error);
        res.status(500).send('Error processing your request.');
    }
});

app.post('/users/change-password', async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).send('All fields are required');
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).send('New passwords do not match');
    }

    try {
        // Get the current user from the session
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        // Fetch the user from the database
        const user = await knex('users').where({ userid: userId }).first();

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Verify the current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).send('Current password is incorrect');
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await knex('users').where({ userid: userId }).update({
            password: hashedPassword,
        });

        res.redirect('/');

    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).send('Error updating password');
    }
});

app.post('/teammember', (req, res) => {
    const VolFirstName = req.body.VolFirstName;
    const VolLastName = req.body.VolLastName;
    const VolUsername = req.body.VolUsername;
    const VolPassword = req.body.VolPassword;
    const VolEmail = req.body.VolEmail;
    const VolPhoneNumber = req.body.VolPhoneNumber;
    const VolStreetAddress = req.body.VolStreetAddress;
    const VolCity = req.body.VolCity;
    const VolState = req.body.VolState;
    const VolZip = req.body.VolZip;
    const Skills = req.body.Skills; // This will be an array of checked values
    const SewingLevel = req.body.SewingLevel;
    const CanTeach = req.body.CanTeach;
    const TakeLead = req.body.TakeLead;
    const VolunteerHoursMonthly = req.body.VolunteerHoursMonthly;
    const VolAreas = req.body.VolAreas; // This will be an array of selected areas
    const ReferralType = req.body.ReferralType;
    const adminkey = req.body.adminkey;
    const role = adminkey === 'JensAdminKey' ? 'admin' : 'volunteer';

    knex('users')
    .insert({
        first_name: VolFirstName,
        last_name: VolLastName,
        username: VolUsername,
        password: VolPassword,  // Consider hashing the password before saving
        email: VolEmail,
        phone_number: VolPhoneNumber,
        street_address: VolStreetAddress,
        city: VolCity,
        state: VolState,
        zip_code: VolZip,
        skills: JSON.stringify(Skills), // Save skills as a JSON string
        sewing_level: SewingLevel,
        can_teach: CanTeach,
        event_lead: TakeLead,
        volunteer_hours_monthly: VolunteerHoursMonthly,
        areas_willing_to_volunteer: JSON.stringify(VolAreas), // Save selected areas as a JSON string
        referral_type: ReferralType,
        role: role,
    })
    .then(() => {
        res.redirect('/'); // Redirect to a thank you or confirmation page after submission
    })
    .catch(error => {
        console.error('Error adding Volunteer:', error);
        res.status(500).send('Internal Server Error');
    });
});

app.listen(port, () => console.log(`Node.js is listening`));