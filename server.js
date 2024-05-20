// Make environment variables available to the app
const dotenv = require('dotenv')
dotenv.config()

// Import express and create instance of the app
const express = require('express')
const app = express()

// Import express-session to manage user sessions
const session = require('express-session')

const mongoose = require('mongoose')
const methodOverride = require('method-override')
const morgan = require('morgan')

//  Import the auth controller
const authController = require('./controllers/auth.js')

// Set the port from environment variable or default to 3000
 const port = process.env.PORT ? process.env.PORT : 3000

//  Connect to the database 
mongoose.connect(process.env.MONGODB_URI)
//  Check connection to database is successful
mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}`);
})

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }))
// Middleware for using HTTP verbs such as PUT or DELETE in places where the client't doesn't support it
app.use(methodOverride('_method'))
// Morgan for logging HTTP requests
app.use(morgan('dev'))
// Use sessions for auth
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}))

// Use the auth controller for any requests that start with /auth
app.use('/auth', authController)

// Set up route for GET request
app.get('/', async (req,res) => {
    res.render('index.ejs', {
        user: req.session.user
    })
})

// Route handler for /vip-lounge requests
app.get('/vip-lounge', (req, res) => {
    if (req.session.user) {
        res.send(`Welcome to the VIP lounge ${req.session.user.username}`)
    } else {
        res.send('No guests allowed')
    }
})

// Listen for incoming requests
app.listen(port, () => {
    console.log(`The express app is ready on port ${port}!`);
})