const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user.js')

// Any requests that start with /auth will be handled by this controller
router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up.ejs')
})

router.post('/sign-up', async (req, res) => {
    // User will send us the username, password and passwordConfirmation
    // - check if the username is already taken
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (userInDatabase) {
        return res.send('Username already taken')
    }
    // - check if the password and passwordConfirmation are the same
    if (req.body.password !== req.body.confirmPassword) {
        return res.send('Passwords don\'t match')
    }
    // - do any password validation you want
    const hasUpperCase = /[A-Z]/.test(req.body.password)
    if (!hasUpperCase) {
        return res.send('Password must contain at least one uppercase letter')
    }

    if (req.body.password.length < 8) {
        return res.send('Password must be at least 8 characters long.')
    }
    // Use bcrypt to hash the user's password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    req.body.password = hashedPassword

    // Create the new user in the database
    const user = await User.create(req.body)
    res.send(`Thanks for signing up ${user.username}`)

})

router.get('/sign-in', async (req, res) => {
    res.render('auth/sign-in.ejs')
})

router.post('/sign-in', async (req, res) => {
    // User will send us the username and password
    const userInDatabase = await User.findOne({ username: req.body.username })

    // - check if user exists
    if (!userInDatabase) {
        return res.send('Login failed. Please try again.')
    }

    // - check if password is correct
    const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)

    if (!validPassword) {
        return res.send('Login failed. Please try again.')
    }

    req.session.user = {
        username: userInDatabase.username
    }
    console.log('user is valid and gets a session', req.session)
    res.redirect('/')
})

router.get('/sign-out', async (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

module.exports = router