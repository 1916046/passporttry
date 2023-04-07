const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const User = require("./models/User");
const cookieParser = require('cookie-parser');
const Contact = require("./models/Contact");


const app = express();

app.use(express.json());
app.use(cookieParser());


app.use(cors());


// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/phonebook', { useNewUrlParser: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Set up session middleware
const store = MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/phonebook',
    collectionName: 'session'
  });
  

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Set up passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set up passport local strategy
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        console.log(`Trying to find user with username: ${username}`);
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`User not found`);
            return done(null, false, { message: 'Invalid username or password.' });
        }
        console.log(`User found. Comparing passwords...`);
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log(`Passwords match`);
            return done(null, user);
        } else {
            console.log(`Passwords do not match`);
            return done(null, false, { message: 'Invalid username or password.' });
        }
    } catch (err) {
        console.error(err);
        return done(err);
    }
}));

// Set up passport serialization and deserialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
 });

 // Routes

 app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
  
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
  
    // Hash the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    // Create a new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
  
    // Log in the user
    req.login(newUser, err => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json(newUser);
    });
});
  
  const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };
  
  
app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
 });
 
 app.get('/api/user', (req, res) => {
    res.json(req.user || null);
 });
 
 app.post('/api/logout', (req, res) => {
    req.logout();
    res.send('Logged out successfully.');
 });

 app.get('/api/contacts', requireAuth, async (req, res) => {
    try {
        const contacts = await Contact.find({ user: req.user._id });
        res.json(contacts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
 });
 
 app.post('/api/contacts', requireAuth, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const contact = new Contact({ name, phone, user: req.user._id });
        await contact.save();
        res.json(contact);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
 });
 
 app.put('/api/contacts/:id', requireAuth, async (req, res) => {
    try {
        const contact = await Contact.findOne({ _id: req.params.id, user: req.user._id });
        if (!contact) {
            return res.status(404).send('Contact not found');
        }
        const { name, phone } = req.body;
        contact.name = name;
        contact.phone = phone;
        await contact.save();
        res.json(contact);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
 });
 
 app.delete('/api/contacts/:id', requireAuth, async (req, res) => {
    try {
        const contact = await Contact.findOne({ _id: req.params.id, user: req.user._id });
        if (!contact) {
            return res.status(404).send('Contact not found');
        }
        await contact.remove();
        res.send('Contact removed successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
 });
 
 
 
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
