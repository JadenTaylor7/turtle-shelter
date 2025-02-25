//This code is dne by BYU students as mentioned in the package.json file.
//Code may become property of Turtle Shelter Project 501(c)-3 upon request.

let express = require("express");

let bcrypt = require("bcryptjs")

let app = express();

let path = require("path");

const port = process.env.PORT || 3000;

let security = false;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views")); //assigns views folder for index.js to point to

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true}));

const session = require('express-session');

const moment = require('moment');

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
        host : process.env.RDS_HOSTNAME || "awseb-e-7wj76fmcti-stack-awsebrdsdatabase-84lkxtpjkbgf.cumdalvhwixf.us-east-1.rds.amazonaws.com",
        user : process.env.RDS_USERNAME || "postgres", 
        password : process.env.RDS_PASSWORD || "postgres", 
        database : process.env.RDS_DB_NAME || "ebdb",
        port : process.env.RDS_PORT || 5432,
        ssl: { rejectUnauthorized: false }
    }
});
//awd RDS endpoint: turtleshelter.cumdalvhwixf.us-east-1.rds.amazonaws.com

//goes to index.ejs upon website load
app.get('/', (req, res) => { 
    res.render("index")
});

app.get('/register', (req, res) => { 
    res.render("register")
});

app.get('/login', (req, res) => { 
    res.render('login', { errorMessage: null });
});

app.get('/jen', (req, res) => { 
    res.render("jen")
});

app.get('/tableaudashboard', (req, res) => {

    const teammemberid = req.session.teammemberid; // Get the logged-in teammemberid
    
            // Check if the user is logged in
            if (!teammemberid) {
                return res.redirect('/login'); // Redirect to login if not logged in
            }

    res.render("tableaudashboard")
});

app.get('/requested-events', async (req, res) => { 
    try {
        const teammemberid = req.session.teammemberid; // Get the logged-in teammemberid
    
            // Check if the user is logged in
            if (!teammemberid) {
                return res.redirect('/login'); // Redirect to login if not logged in
            }
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

app.get('/hostEvent', (req, res) => { 
    res.render("hostEvent")
});

app.get('/maintainteammembers', async (req, res) => {
    const teammemberid = req.session.teammemberid;

    // Check if the user is logged in
    if (!teammemberid) {
        return res.redirect('/login');  // Redirect to login if not logged in
    }

    try {
        // Fetch the logged-in user's role
        const teammember = await knex('teammembers')
            .select('role')
            .where('teammemberid', teammemberid)
            .first();

        if (!teammember) {
            return res.status(404).send('User not found');
        }

        // Fetch all team members data from the 'teammembers' table
        const teamMembers = await knex('teammembers').select(
            'teammemberid', 'memfirstname', 'memlastname', 'username', 'mememail', 'memphone',
            'memstraddress', 'memcity', 'memstate', 'memzip', 'memsewinglevel',
            'memskills', 'can_teach', 'event_lead', 'memhoursmonthly', 'memvolunteerlocation',
            'referral_type', 'role'
        );

        // If no team members are found
        if (!teamMembers || teamMembers.length === 0) {
            return res.status(404).send('No team members found');
        }

        // Render the maintainteammembers.ejs view with teamMembers and logged-in user's role
        res.render('maintainteammembers', { teamMembers, role: teammember.role });
    } catch (error) {
        console.error('Error fetching team members data:', error);
        res.status(500).send('Error fetching team members data');
    }
});

app.get('/maintainvolunteers', async (req, res) => {
    const teammemberid = req.session.teammemberid;

    // Check if the user is logged in
    if (!teammemberid) {
        return res.redirect('/login');  // Redirect to login if not logged in
    }

    try {
        // Fetch the logged-in user's role
        const teammember = await knex('teammembers')
            .select('role')
            .where('teammemberid', teammemberid)
            .first();

        if (!teammember) {
            return res.status(404).send('User not found');
        }

        // Debugging line to check role value
        console.log(teammember.role); // This will output the role in your server's console

        // Fetch all volunteer data from the 'volunteers' table
        const volunteers = await knex('volunteers').select(
            'volunteerid', 'volfirstname', 'vollastname', 'volemail', 'sewinglevel', 
            'referraltype', 'createdat'
        );

        // If no volunteers are found
        if (!volunteers || volunteers.length === 0) {
            return res.status(404).send('No volunteers found');
        }

        // Render the maintainvolunteers.ejs view with volunteers and logged-in user's role
        res.render('maintainvolunteers', { volunteers, role: teammember.role });
    } catch (error) {
        console.error('Error fetching volunteer data:', error);
        res.status(500).send('Error fetching volunteer data');
    }
});

app.get('/teammembersettings', async (req, res) => {
    const teammemberid = req.session.teammemberid;

    if (!teammemberid) {
        return res.redirect('/login');  // Redirect to login if not logged in
    }

    try {
        const user = await knex('teammembers')
            .where({ teammemberid })
            .first();  // Fetch the user data

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Render the EJS view and pass the user data
        res.render('teammembersettings', { user });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
});

app.get('/teammember', (req, res) => { 
    res.render("teammember")
});

app.get('/addteammember', (req, res) => { 
    const teammemberid = req.session.teammemberid; // Get the logged-in teammemberid
    
        // Check if the user is logged in
        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

    res.render("addteammember")
});

app.get('/addevent', (req, res) => { 
    const teammemberid = req.session.teammemberid; // Get the logged-in teammemberid
    
            // Check if the user is logged in
        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }
    res.render("addevent")
});

app.get('/addadmin', (req, res) => { 
    const teammemberid = req.session.teammemberid; // Get the logged-in teammemberid
    
            // Check if the user is logged in
        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }
    res.render("addadmin")
});

app.get('/addvolunteer', async (req, res) => {
    try {
        const teammemberid = req.session.teammemberid; // Get the logged-in teammemberid
    
            // Check if the user is logged in
        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }
        // Fetch all events where approveevent is false or null
        const events = await knex('hosts')
            .select('*')
            .where('approveevent', true) // Filter out events where approveevent is true
            .andWhere('openness', 'public');

        // Render the EJS template and pass the filtered data
        res.render('addvolunteer', { events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error retrieving events from the database');
    }
});

// Load the edit page for a team member
app.get('/editteammember/:teammemberid', async (req, res) => {
    try {
        const teammemberid = req.params.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

        const member = await knex('teammembers')
            .where('teammemberid', teammemberid)
            .first();

        res.render('editteammember', { member });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading the edit page');
    }
});

app.get('/editevent/:hostid', async (req, res) => {
    try {
        const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

        const hostid = req.params.hostid;
        const event = await knex('hosts')
            .where('hostid', hostid)
            .first();

        res.render('editevent', { event });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading the edit page');
    }
});

app.get('/volunteer', async (req, res) => {
    try {
        const today = moment().startOf('day'); // Today's date at midnight

        // Fetch events with approveevent true and openness public
        const events = await knex('hosts')
            .select('*')
            .where('approveevent', true)
            .andWhere('openness', 'public');

        // Filter events for today or future dates
        const upcomingEvents = events.filter(event => 
            moment(event.eventdate).isSameOrAfter(today)
        );

        // Render the EJS template with filtered events
        res.render('volunteer', { events: upcomingEvents, moment });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error retrieving events from the database');
    }
});

app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Unable to log out');
        }
        // Redirect to the homepage or login page after logout
        res.redirect('/');
    });
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
  const ApproveEvent = false;
  const CreateDat = new Date();

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
    approveevent: ApproveEvent,
    createdat: CreateDat,
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
        const Newsletter = req.body.newsletter === 'true'; 
        const CreateDat = new Date();

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
                createdat: CreateDat,
                newsletter: Newsletter
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

app.post('/teammembers/register', async (req, res) => {
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
        const [teammemberid] = await knex('teammembers')
            .insert({
                username: username,
                password: hashedPassword,
                role: role, // Set the role based on the provided admin key
            })
            .returning('teammemberid'); // Returning the ID of the new user

        console.log(`New user created with ID: ${teammemberid} and role: ${role}`);

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

app.post('/teammembers/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username in the database
        const user = await knex('teammembers')
            .where({ username: username })
            .first();

        if (!user) {
            return res.render('login', { errorMessage: 'Incorrect username and password' });
        }

        // Compare the password entered by the user with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // If the passwords match, store the user ID and role in the session
            req.session.teammemberid = user.teammemberid;
            req.session.role = user.role;

            console.log(`User logged in: ID = ${user.teammemberid}, Role = ${user.role}`);

            // Redirect to the home page after login
            return res.redirect('/');
        } else {
            // If the passwords don't match
            return res.render('login', { errorMessage: 'Incorrect username and password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error logging in');
    }
});

app.post('/requested-events', async (req, res) => {
    try {
        const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

        // Extract the array of approved event IDs from the request
        const approvedEventIds = req.body.ApproveEvents || [];

        // If no events were approved, exit without doing anything
        if (approvedEventIds.length === 0) {
            return; // Optionally redirect to the same page
        }

        // Update `approveevent` to true for all selected events
        await knex('hosts')
            .whereIn('hostid', approvedEventIds)
            .update({ approveevent: true });

        // Redirect or send a success response
        res.redirect('/');
    } catch (error) {
        console.error('Error updating events:', error);
        res.status(500).send('Error processing your request.');
    }
});


app.post('/teammembers/change-password', async (req, res) => {

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).send('All fields are required');
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).send('New passwords do not match');
    }

    try {
        // Get the current user from the session
        const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.status(401).send('Unauthorized');
        }

        // Fetch the user from the database
        const user = await knex('teammembers').where({ teammemberid: teammemberid }).first();

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
        await knex('teammembers').where({ teammemberid: teammemberid }).update({
            password: hashedPassword,
        });

        res.redirect('/');

    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).send('Error updating password');
    }
});

app.post('/teammember', (req, res) => {
    const MemFirstName = req.body.MemFirstName;
    const MemLastName = req.body.MemLastName;
    const VolUsername = req.body.VolUsername;
    const VolPassword = req.body.VolPassword;
    const MemEmail = req.body.MemEmail;
    const MemPhoneNumber = req.body.MemPhoneNumber;
    const MemStrAddress = req.body.MemStrAddress;
    const MemCity = req.body.MemCity;
    const MemState = req.body.MemState;
    const MemZip = req.body.MemZip;
    const MemSkills = req.body.MemSkills; // This will be an array of checked values
    const MemSewingLevel = req.body.MemSewingLevel;
    const CanTeach = req.body.CanTeach;
    const TakeLead = req.body.TakeLead;
    const MemHoursMonthly = req.body.MemHoursMonthly;
    const MemVolunteerLocation = req.body.MemVolunteerLocation; // This will be an array of selected areas
    const ReferralType = req.body.ReferralType;
    const role = 'teammember';

    // Hash the password using bcrypt
    bcrypt.hash(VolPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send({
                message: 'Internal Server Error',
                error: err.message || err
            });
        }

        try {
            knex('teammembers')
                .insert({
                    memfirstname: MemFirstName,
                    memlastname: MemLastName,
                    username: VolUsername,
                    password: hashedPassword, // Save the hashed password
                    mememail: MemEmail,
                    memphone: MemPhoneNumber,
                    memstraddress: MemStrAddress,
                    memcity: MemCity,
                    memstate: MemState,
                    memzip: MemZip,
                    memskills: MemSkills, // Save skills as a JSON string
                    memsewinglevel: MemSewingLevel,
                    can_teach: CanTeach,
                    event_lead: TakeLead,
                    memhoursmonthly: MemHoursMonthly,
                    memvolunteerlocation: JSON.stringify(MemVolunteerLocation), // Save selected areas as a JSON string
                    referral_type: ReferralType,
                    role: role,
                })
                .then(() => {
                    res.redirect('/'); // Redirect to a thank you or confirmation page after submission
                })
                .catch((error) => {
                    console.error('Error adding Volunteer:', error);
                    res.status(500).send({
                        message: 'Internal Server Error',
                        error: error.message || error
                    });
                });
        } catch (error) {
            console.error('Error handling the request:', error);
            res.status(500).send({
                message: 'Internal Server Error',
                error: error.message || error
            });
        }
    });
});

app.post('/teammembers/edit-account', async (req, res) => {
    try {
        const {
            memfirstname, memlastname, username, mememail,
            memohonenumber, memstraddress, memcity, memstate, memzip, memsewinglevel, memskills, can_teach, event_lead, memhoursmonthly, memvolunteerlocation, referral_type
            // Add other fields
        } = req.body;

        const teammemberid = req.session.teammemberid;  // Assuming you're storing the user ID in the session

        if (!teammemberid) {
            return res.status(401).send('User not logged in');
        }

        // Validate inputs and update the user's details in the database using Knex
        await knex('teammembers')  // Replace with the correct table name
            .where({ teammemberid })  // Use the correct user ID column
            .update({
                memfirstname: memfirstname,
                memlastname: memlastname,
                username: username,
                mememail: mememail,
                memohonenumber: memohonenumber,
                memstraddress: memstraddress,
                memcity: memcity,
                memstate: memstate,
                memzip: memzip,
                memsewinglevel: memsewinglevel,
                memskills: memskills,
                can_teach: can_teach,
                event_lead: event_lead,
                memhoursmonthly: memhoursmonthly,
                memvolunteerlocation: JSON.stringify(memvolunteerlocation),
                referral_type: referral_type,
                // Update other fields if necessary
            });

        res.redirect('/teammembersettings');  // Redirect to the settings page
    } catch (err) {
        console.error('Error updating user details:', err);
        res.status(500).send('Server Error');
    }
});

app.post('/teammembers/add-admin', (req, res) => {
    const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

    const MemFirstName = req.body.MemFirstName;
    const MemLastName = req.body.MemLastName;
    const username = req.body.username;
    const VolPassword = req.body.VolPassword;
    const MemEmail = req.body.MemEmail;
    const MemPhoneNumber = req.body.MemPhoneNumber;
    const MemStrAddress = req.body.MemStrAddress;
    const MemCity = req.body.MemCity;
    const MemState = req.body.MemState;
    const MemZip = req.body.MemZip;
    const MemSkills = req.body.MemSkills; // This will be an array of checked values
    const MemSewingLevel = req.body.MemSewingLevel;
    const CanTeach = req.body.CanTeach;
    const TakeLead = req.body.TakeLead;
    const MemHoursMonthly = req.body.MemHoursMonthly;
    const MemVolunteerLocation = req.body.MemVolunteerLocation; // This will be an array of selected areas
    const ReferralType = req.body.ReferralType;
    const role = 'admin'; // Set the role to admin

    // Hash the password using bcrypt
    bcrypt.hash(VolPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send({
                message: 'Internal Server Error',
                error: err.message || err
            });
        }

        try {
            knex('teammembers')
                .insert({
                    memfirstname: MemFirstName,
                    memlastname: MemLastName,
                    username: username,
                    password: hashedPassword, // Save the hashed password
                    mememail: MemEmail,
                    memphone: MemPhoneNumber,
                    memstraddress: MemStrAddress,
                    memcity: MemCity,
                    memstate: MemState,
                    memzip: MemZip,
                    memskills: MemSkills, // Save skills as a JSON string
                    memsewinglevel: MemSewingLevel,
                    can_teach: CanTeach,
                    event_lead: TakeLead,
                    memhoursmonthly: MemHoursMonthly,
                    memvolunteerlocation: JSON.stringify(MemVolunteerLocation), // Save selected areas as a JSON string
                    referral_type: ReferralType,
                    role: role, // Admin role here
                })
                .then(() => {
                    res.redirect('/'); // Redirect to a thank you or confirmation page after submission
                })
                .catch((error) => {
                    console.error('Error adding Admin:', error);
                    res.status(500).send({
                        message: 'Internal Server Error',
                        error: error.message || error
                    });
                });
        } catch (error) {
            console.error('Error handling the request:', error);
            res.status(500).send({
                message: 'Internal Server Error',
                error: error.message || error
            });
        }
    });
});

// Updating a team member
app.post('/update-teammember/:teammemberid', async (req, res) => {
    try {

        const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

        const memberId = req.params.teammemberid;
        const {
            memfirstname, memlastname, username, mememail,
            memphone, memstraddress, memcity, memstate, memzip,
            memsewinglevel, memskills, can_teach, event_lead,
            memhoursmonthly, memvolunteerlocation, referral_type, role
        } = req.body;

        // Handle memvolunteerlocation to avoid issues with null or undefined
        const volunteerLocations = 
            (memvolunteerlocation && Array.isArray(memvolunteerlocation))  // If it's already an array and not null
            ? memvolunteerlocation
            : (memvolunteerlocation && typeof memvolunteerlocation === 'string') 
                ? memvolunteerlocation.split(',').map(location => location.trim())  // If it's a string, convert to array
                : []; // If it's null or undefined, default to an empty array

        const updatedData = {
            memfirstname, memlastname, username, mememail,
            memphone, memstraddress, memcity, memstate, memzip,
            memsewinglevel, memskills, can_teach, event_lead,
            memhoursmonthly, memvolunteerlocation: JSON.stringify(volunteerLocations), // Ensure to stringify
            referral_type, role
        };

        // Update the database
        await knex('teammembers')
            .where('teammemberid', memberId)
            .update(updatedData);

        res.redirect('/maintainteammembers'); // Redirect after update
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).send('Error updating the team member');
    }
});

// Deleting a team member
app.post('/deleteteammember/:teammemberid', async (req, res) => {
    try {
        // Retrieve the teammemberid from the request parameters
        const teammemberidToDelete = req.params.teammemberid;

        // Check if the user is logged in
        if (!req.session.teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

        // Check if the teammember being deleted is the same as the logged-in admin
        if (teammemberidToDelete === req.session.teammemberid.toString()) {
            return res.redirect('/maintainteammembers'); // Prevent self-deletion and redirect
        }

        // Proceed to delete the team member
        await knex('teammembers')
            .where('teammemberid', teammemberidToDelete)
            .del(); // Deletes the record with the specified ID

        res.redirect('/maintainteammembers'); // Redirect after successful deletion
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).send('Error deleting the team member');
    }
});

app.post('/addteammember', (req, res) => {

    const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

    const MemFirstName = req.body.MemFirstName;
    const MemLastName = req.body.MemLastName;
    const VolUsername = req.body.VolUsername;
    const VolPassword = req.body.VolPassword;
    const MemEmail = req.body.MemEmail;
    const MemPhoneNumber = req.body.MemPhoneNumber;
    const MemStrAddress = req.body.MemStrAddress;
    const MemCity = req.body.MemCity;
    const MemState = req.body.MemState;
    const MemZip = req.body.MemZip;
    const MemSkills = req.body.MemSkills; // This will be an array of checked values
    const MemSewingLevel = req.body.MemSewingLevel;
    const CanTeach = req.body.CanTeach;
    const TakeLead = req.body.TakeLead;
    const MemHoursMonthly = req.body.MemHoursMonthly;
    const MemVolunteerLocation = req.body.MemVolunteerLocation; // This will be an array of selected areas
    const ReferralType = req.body.ReferralType;
    const role = 'teammember';

    // Hash the password using bcrypt
    bcrypt.hash(VolPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send({
                message: 'Internal Server Error',
                error: err.message || err
            });
        }

        try {
            knex('teammembers')
                .insert({
                    memfirstname: MemFirstName,
                    memlastname: MemLastName,
                    username: VolUsername,
                    password: hashedPassword, // Save the hashed password
                    mememail: MemEmail,
                    memphone: MemPhoneNumber,
                    memstraddress: MemStrAddress,
                    memcity: MemCity,
                    memstate: MemState,
                    memzip: MemZip,
                    memskills: MemSkills, // Save skills as a JSON string
                    memsewinglevel: MemSewingLevel,
                    can_teach: CanTeach,
                    event_lead: TakeLead,
                    memhoursmonthly: MemHoursMonthly,
                    memvolunteerlocation: JSON.stringify(MemVolunteerLocation), // Save selected areas as a JSON string
                    referral_type: ReferralType,
                    role: role,
                })
                .then(() => {
                    res.redirect('/maintainteammembers'); // Redirect to a thank you or confirmation page after submission
                })
                .catch((error) => {
                    console.error('Error adding Volunteer:', error);
                    res.status(500).send({
                        message: 'Internal Server Error',
                        error: error.message || error
                    });
                });
        } catch (error) {
            console.error('Error handling the request:', error);
            res.status(500).send({
                message: 'Internal Server Error',
                error: error.message || error
            });
        }
    });
});

app.post('/addadmin', (req, res) => {

    const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

    const MemFirstName = req.body.MemFirstName;
    const MemLastName = req.body.MemLastName;
    const VolUsername = req.body.VolUsername;
    const VolPassword = req.body.VolPassword;
    const MemEmail = req.body.MemEmail;
    const MemPhoneNumber = req.body.MemPhoneNumber;
    const MemStrAddress = req.body.MemStrAddress;
    const MemCity = req.body.MemCity;
    const MemState = req.body.MemState;
    const MemZip = req.body.MemZip;
    const MemSkills = req.body.MemSkills; // This will be an array of checked values
    const MemSewingLevel = req.body.MemSewingLevel;
    const CanTeach = req.body.CanTeach;
    const TakeLead = req.body.TakeLead;
    const MemHoursMonthly = req.body.MemHoursMonthly;
    const MemVolunteerLocation = req.body.MemVolunteerLocation; // This will be an array of selected areas
    const ReferralType = req.body.ReferralType;
    const role = 'admin';

    // Hash the password using bcrypt
    bcrypt.hash(VolPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send({
                message: 'Internal Server Error',
                error: err.message || err
            });
        }

        try {
            knex('teammembers')
                .insert({
                    memfirstname: MemFirstName,
                    memlastname: MemLastName,
                    username: VolUsername,
                    password: hashedPassword, // Save the hashed password
                    mememail: MemEmail,
                    memphone: MemPhoneNumber,
                    memstraddress: MemStrAddress,
                    memcity: MemCity,
                    memstate: MemState,
                    memzip: MemZip,
                    memskills: MemSkills, // Save skills as a JSON string
                    memsewinglevel: MemSewingLevel,
                    can_teach: CanTeach,
                    event_lead: TakeLead,
                    memhoursmonthly: MemHoursMonthly,
                    memvolunteerlocation: JSON.stringify(MemVolunteerLocation), // Save selected areas as a JSON string
                    referral_type: ReferralType,
                    role: role,
                })
                .then(() => {
                    res.redirect('/maintainteammembers'); // Redirect to a thank you or confirmation page after submission
                })
                .catch((error) => {
                    console.error('Error adding Volunteer:', error);
                    res.status(500).send({
                        message: 'Internal Server Error',
                        error: error.message || error
                    });
                });
        } catch (error) {
            console.error('Error handling the request:', error);
            res.status(500).send({
                message: 'Internal Server Error',
                error: error.message || error
            });
        }
    });
});

app.post('/editevent/:hostid', (req, res) => {

    const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }
        
    const hostid = req.params.hostid;
    const updatedEventData = {
        hostfirstname: req.body.HostFirstName,
        hostlastname: req.body.HostLastName,
        hostemail: req.body.HostEmail,
        eventdate: req.body.EventDate,
        eventstarttime: req.body.EventStartTime,
        eventstraddress: req.body.EventStrAddress,
        eventcity: req.body.EventCity,
        eventstate: req.body.EventState,
        eventzip: req.body.EventZip,
        servicetype: req.body.ServiceType,
        attendance: req.body.Attendance,
        groupage: req.body.GroupAge,
        eventname: req.body.EventName,
        hostphone: req.body.HostPhone,
        jensharestory: req.body.JenShareStory === 'true', // Convert to boolean
        openness: req.body.Openness,
    };

    knex('hosts')
        .where({ hostid: hostid })
        .update(updatedEventData)
        .then(() => {
            res.redirect('/maintainevents'); // Redirect after update
        })
        .catch(error => {
            console.error('Error updating event:', error);
            res.status(500).send('Internal Server Error');
        });
    });

    app.post('/deleteevent/:hostid', async (req, res) => {
        try {

        const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

            const hostid = req.params.hostid;  // Retrieve the hostid from the route parameter
            knex('hosts')                      // Query the 'hosts' table
                .where('hostid', hostid)       // Specify the hostid to delete
                .del()                          // Delete the record
                .then(() => {
                    res.redirect('/maintainevents');  // Redirect to the page showing all hosts after deletion
                }) 
                .catch(error => {
                    console.error('Error deleting host:', error);  // Log any errors that occur during deletion
                    res.status(500).send('Error deleting the host');  // Return an error response if deletion fails
                });
        } catch (error) {
            console.error('Error deleting host:', error);  // Log any errors that occur outside the query
            res.status(500).send('Error deleting the host');
        }
    });

    app.post('/addevent', (req, res) => {

        const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

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
      const ApproveEvent = false;
      const CreateDat = new Date();
    
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
        approveevent: ApproveEvent,
        createdat: CreateDat,
      })
      .then(() => {
          res.redirect('/maintainevents'); // Redirect to the Pokémon list page after adding
      })
      .catch(error => {
          console.error('Error adding Host:', error);
          res.status(500).send('Internal Server Error');
      });
      
    });

    app.get('/maintainevents', (req, res) => {

        const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

        const today = moment().startOf('day'); // Today's date at midnight
    
        // Fetch events from the 'hosts' table
        knex('hosts')
            .select('*')
            .then(events => {
                // Fetch volunteer counts separately for each event
                const volunteerCountsQuery = knex('event_volunteers')
                    .leftJoin('volunteers', 'event_volunteers.volunteerid', '=', 'volunteers.volunteerid') // Join with volunteers to count distinct volunteers
                    .select('event_volunteers.hostid', knex.raw('COUNT(DISTINCT volunteers.volunteerid) as volunteer_count'))
                    .groupBy('event_volunteers.hostid');  // Group by hostid
    
                // Fetch team member counts separately for each event
                const teamMemberCountsQuery = knex('event_team_members')
                    .leftJoin('teammembers', 'event_team_members.teammemberid', '=', 'teammembers.teammemberid') // Join with teammembers to count distinct team members
                    .select('event_team_members.hostid', knex.raw('COUNT(DISTINCT event_team_members.teammemberid) as teammember_count'))
                    .groupBy('event_team_members.hostid');  // Group by hostid
    
                // Execute both queries in parallel
                Promise.all([volunteerCountsQuery, teamMemberCountsQuery])
                    .then(([volunteerCounts, teamMemberCounts]) => {
                        // Add the volunteer and team member counts to each event
                        events = events.map(event => {
                            // Find the volunteer count for the current event
                            const volunteerCount = volunteerCounts.find(v => v.hostid === event.hostid);
                            const teamMemberCount = teamMemberCounts.find(t => t.hostid === event.hostid);
    
                            // Add the counts to the event object
                            event.volunteer_count = volunteerCount ? volunteerCount.volunteer_count : 0;
                            event.teammember_count = teamMemberCount ? teamMemberCount.teammember_count : 0;
    
                            return event;
                        });
    
                        // Filter events into upcoming and past
                        const upcomingEvents = events.filter(event => moment(event.eventdate).isSameOrAfter(today))
                            .sort((a, b) => moment(a.eventdate).isBefore(moment(b.eventdate)) ? 1 : -1);  // Sort upcoming events by closest date first
    
                        const pastEvents = events.filter(event => moment(event.eventdate).isBefore(today))
                            .sort((a, b) => moment(a.eventdate).isBefore(moment(b.eventdate)) ? 1 : -1);  // Sort past events by closest date first
    
                        // Render the maintain events page with upcoming and past events, and counts
                        res.render('maintainevents', { upcomingEvents, pastEvents, moment });
                    })
                    .catch(error => {
                        console.error('Error fetching volunteer or team member counts:', error);
                        res.status(500).send('Internal Server Error');
                    });
            })
            .catch(error => {
                console.error('Error fetching events:', error);
                res.status(500).send('Internal Server Error');
            });
    });

    app.get('/maintainvolunteers', async (req, res) => {
        try {

            const teammemberid = req.session.teammemberid;

                if (!teammemberid) {
                    return res.redirect('/login'); // Redirect to login if not logged in
        }
            // Fetch all volunteers data from the 'volunteers' table
            const volunteers = await knex('volunteers').select(
                'volunteerid', 'volfirstname', 'vollastname', 'volemail', 'volphone',
                'voladdress', 'sewinglevel', 'referraltype', 'createdat'
            );
    
            // If no volunteers are found
            if (!volunteers || volunteers.length === 0) {
                return res.status(404).send('No volunteers found');
            }
    
            // Render the maintainvolunteers.ejs view with the volunteers data
            res.render('maintainvolunteers', { volunteers });
        } catch (error) {
            console.error('Error fetching volunteers data:', error);
            res.status(500).send('Error fetching volunteers data');
        }
    });

    app.post('/editvolunteer/:volunteerid', (req, res) => {

        const teammemberid = req.session.teammemberid;

        if (!teammemberid) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

        const volunteerid = req.params.volunteerid;
        const updatedVolunteerData = {
            firstname: req.body.FirstName,
            lastname: req.body.LastName,
            email: req.body.Email,
            phone: req.body.Phone,
            availability: req.body.Availability,
            skills: req.body.Skills,
            experience: req.body.Experience,
        };
    
        knex('volunteers')
            .where({ volunteerid: volunteerid })
            .update(updatedVolunteerData)
            .then(() => {
                res.redirect('/maintainvolunteers'); // Redirect after update
            })
            .catch(error => {
                console.error('Error updating volunteer:', error);
                res.status(500).send('Internal Server Error');
            });
    });

    app.get('/editvolunteer/:volunteerid', async (req, res) => {
        try {

            const teammemberid = req.session.teammemberid;

                if (!teammemberid) {
                    return res.redirect('/login'); // Redirect to login if not logged in
                }

            const volunteerid = req.params.volunteerid; // Extract the volunteer ID from the route parameter
            const volunteer = await knex('volunteers') // Replace 'volunteers' with your table name if different
                .where('volunteerid', volunteerid) // Fetch the volunteer's data based on the volunteer ID
                .first(); // Get the first matching record
    
            if (!volunteer) {
                return res.status(404).send('Volunteer not found'); // Handle case where the volunteer doesn't exist
            }
    
            res.render('editvolunteer', { volunteer }); // Render the editvolunteer page with the fetched data
        } catch (error) {
            console.error(error);
            res.status(500).send('Error loading the edit volunteer page');
        }
    });

    app.post('/deletevolunteer/:volunteerid', async (req, res) => {
        try {

            const teammemberid = req.session.teammemberid;

                if (!teammemberid) {
                    return res.redirect('/login'); // Redirect to login if not logged in
                }

            const volunteerid = req.params.volunteerid;  // Retrieve the volunteerid from the route parameter
            knex('volunteers')                           // Query the 'volunteers' table
                .where('volunteerid', volunteerid)       // Specify the volunteerid to delete
                .del()                                   // Delete the record
                .then(() => {
                    res.redirect('/maintainvolunteers'); // Redirect to the page showing all volunteers after deletion
                })
                .catch(error => {
                    console.error('Error deleting volunteer:', error);  // Log any errors that occur during deletion
                    res.status(500).send('Error deleting the volunteer'); // Return an error response if deletion fails
                });
        } catch (error) {
            console.error('Error deleting volunteer:', error); // Log any errors that occur outside the query
            res.status(500).send('Error deleting the volunteer');
        }
    });

    app.get('/eventvolunteer/:hostid', async (req, res) => {
        try {

            const teammemberid = req.session.teammemberid;

                if (!teammemberid) {
                    return res.redirect('/login'); // Redirect to login if not logged in
                }

            const hostid = req.params.hostid; // Get the hostid (event ID) from the URL
            
            // Fetch volunteers for the given event (hostid) by joining 'event_volunteers' with 'volunteers'
            const volunteers = await knex('event_volunteers')
                .join('volunteers', 'event_volunteers.volunteerid', '=', 'volunteers.volunteerid')
                .where('event_volunteers.hostid', hostid)  // Filter by the event ID (hostid)
                .select(
                    'volunteers.volfirstname',
                    'volunteers.vollastname',
                    'volunteers.volemail',
                    'volunteers.sewinglevel',
                    'volunteers.referraltype',
                    'volunteers.createdat',
                    'volunteers.volunteerid'
                );

            const host = await knex('hosts')
            .where('hostid', hostid)
            .first();
            
            // Render the template with the filtered list of volunteers
            res.render('eventvolunteer', { volunteers, hostid, moment, host });
        } catch (error) {
            console.error('Error fetching volunteers:', error);
            res.status(500).send('Error retrieving volunteers from the database');
        }
    });

    app.get('/helpatevent', async (req, res) => {
        try {
                
            const today = moment().startOf('day'); // Today's date at midnight
    
            // Fetch events with approveevent true and openness public
            const events = await knex('hosts')
                .select('*')
                .where('approveevent', true)
                .andWhere('openness', 'public');
    
            // Filter events for today or future dates
            const upcomingEvents = events.filter(event => 
                moment(event.eventdate).isSameOrAfter(today)
            );
    
            // Check if a team member is logged in
            if (!req.session.teammemberid) {
                return res.redirect('/login'); // Redirect to login if not logged in
            }
    
            // Render the EJS template with filtered events and team member ID
            res.render('helpatevent', { 
                events: upcomingEvents, 
                moment,
                teammemberid: req.session.teammemberid
            });
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).send('Error retrieving events from the database');
        }
    });

    app.post('/helpatevent', async (req, res) => {
        try {
            const teammemberid = req.session.teammemberid;
            if (!teammemberid) {
                return res.status(403).send('You must be logged in to participate.');
            }
    
            // Extract event participation details
            const participateEvents = Array.isArray(req.body.ParticipateEvent)
                ? req.body.ParticipateEvent
                : req.body.ParticipateEvent
                ? [req.body.ParticipateEvent]
                : [];
    
            if (participateEvents.length > 0) {
                // Fetch existing event-team member pairs
                const existingParticipations = await knex('event_team_members')
                    .select('hostid')
                    .whereIn('hostid', participateEvents.map(Number))
                    .andWhere('teammemberid', teammemberid);
    
                // Extract host IDs from existing participations
                const existingHostIds = new Set(existingParticipations.map(entry => entry.hostid));
    
                // Filter out events already registered
                const newParticipations = participateEvents
                    .map(Number) // Ensure all IDs are numbers
                    .filter(hostid => !existingHostIds.has(hostid));
    
                if (newParticipations.length > 0) {
                    // Prepare and insert new participation entries
                    const eventVolunteers = newParticipations.map(hostid => ({
                        teammemberid: teammemberid,
                        hostid: hostid
                    }));
    
                    await knex('event_team_members').insert(eventVolunteers);
                }
            }
    
            // Redirect to the same page after success
            res.redirect('/');
        } catch (error) {
            console.error('Error processing event participation:', error);
            res.status(500).send('Error processing your participation at the event.');
        }
    });

    app.get('/completedproducts/:hostid', async (req, res) => {
        try {

            const teammemberid = req.session.teammemberid;

                if (!teammemberid) {
                    return res.redirect('/login'); // Redirect to login if not logged in
                }

            const hostid = req.params.hostid;
            const event = await knex('hosts')
                .where('hostid', hostid)
                .first();
    
            res.render('completedproducts', { event, hostid });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error loading the edit page');
        }
    });

    app.post('/completedproducts/:hostid', (req, res) => {
    const teammemberid = req.session.teammemberid;

    if (!teammemberid) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }

    const hostid = req.params.hostid;

    // Create an object with the updated fields, allowing null values for empty inputs
    const updatedProductData = {
        actualattendance: req.body.actualattendance || null,
        pocketsproduced: req.body.pocketsproduced || null,
        collarsproduced: req.body.collarsproduced || null,
        envelopesproduced: req.body.envelopesproduced || null,
        vestsproduced: req.body.vestsproduced || null,
        completeproduced: req.body.completeproduced || null,
    };

    // Update the record in the database
    knex('hosts')
        .where({ hostid: hostid }) // Find the record by host ID
        .update(updatedProductData) // Update the fields
        .then(() => {
            res.redirect('/maintainevents'); // Redirect after successful update
        })
        .catch(error => {
            console.error('Error updating completed products:', error);
            res.status(500).send('Internal Server Error');
        });
});

    app.get('/myevents', async (req, res) => {
        try {
            const teammemberid = req.session.teammemberid; // Get the logged-in teammemberid
    
            // Check if the user is logged in
            if (!teammemberid) {
                return res.redirect('/login'); // Redirect to login if not logged in
            }
    
            // Get all the events that the logged-in team member is associated with
            const events = await knex('event_team_members')
                .join('hosts', 'hosts.hostid', '=', 'event_team_members.hostid') // Join the events table (hosts)
                .select('hosts.*') // Get all host columns
                .where('event_team_members.teammemberid', teammemberid); // Filter by logged-in team member ID
            
            res.render('myevents', { 
                events, 
                moment,
                teammemberid
            });
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).send('Error retrieving events from the database');
        }
    });
    
    app.post('/deleteevent', async (req, res) => {
        try {
            const { DeleteEvent } = req.body;  // Array of hostids
            const teammemberid = req.session.teammemberid; // The logged-in user’s ID
    
            if (!teammemberid) {
                return res.redirect('/login'); // Ensure the user is logged in
            }
    
            if (!DeleteEvent || DeleteEvent.length === 0) {
                // Do nothing if no events are selected
                return;
            }
    
            // Loop through the selected events and delete them
            for (const hostid of DeleteEvent) {
                await knex('event_team_members')
                    .where('hostid', hostid)
                    .andWhere('teammemberid', teammemberid)
                    .del();
            }
    
            res.redirect('/myevents'); // Redirect after unsubscribing
        } catch (error) {
            console.error('Error unsubscribing from event:', error);
            res.status(500).send('Error unsubscribing from event');
        }
    });

    app.get('/eventteammembers/:hostid', async (req, res) => {
        try {

            const teammemberid = req.session.teammemberid;

                if (!teammemberid) {
                    return res.redirect('/login'); // Redirect to login if not logged in
                }

            const hostid = req.params.hostid; // Get the hostid (event ID) from the URL
        
            // Fetch members for the given event (hostid)
            const members = await knex('event_team_members')
                .join('teammembers', 'event_team_members.teammemberid', '=', 'teammembers.teammemberid')
                .where('event_team_members.hostid', hostid)  // Filter by the event ID (hostid)
                .select(
                    'teammembers.memfirstname',
                    'teammembers.memlastname',
                    'teammembers.username',
                    'teammembers.mememail',
                    'teammembers.memphone',
                    'teammembers.memstraddress',
                    'teammembers.memcity',
                    'teammembers.memstate',
                    'teammembers.memzip',
                    'teammembers.memskills',
                    'teammembers.can_teach',
                    'teammembers.event_lead',
                    'teammembers.memcity',
                    'teammembers.memhoursmonthly',
                    'teammembers.memvolunteerlocation',
                    'teammembers.referral_type',
                    'teammembers.role',
                );
        
            // Fetch host details for the event
            const host = await knex('hosts')
                .where('hostid', hostid)
                .first();
        
            // Render the template with the filtered list of members
            res.render('eventteammembers', { members, hostid, moment, host });
        } catch (error) {
            console.error('Error fetching members:', error);
            res.status(500).send('Error retrieving members from the database');
        }
    });

    app.post('/delete-requessted-event', async (req, res) => {
        try {
            const { hostid } = req.body; // Get the hostid from the form
    
            // Check if the hostid is provided
            if (!hostid) {
                return res.status(400).send('Host ID is required.');
            }
    
            // Delete the event from the database
            await knex('hosts')
                .where('hostid', hostid)
                .del();
    
            // Redirect back to the events page or send a success response
            res.redirect('/requested-events');
        } catch (error) {
            console.error('Error deleting event:', error);
            res.status(500).send('Error processing your request.');
        }
    });
  // Test database connection
  knex.raw("SELECT 1")
    .then(() => {
      console.log("Connected to the database successfully!");
      app.listen(port, () => console.log(`Node.js is listening on port ${port}`));
    })
    .catch((err) => {
      console.error("Failed to connect to the database:", err.message);
      process.exit(1); // Exit the process with an error code
    });