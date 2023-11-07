const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const { isLoggedOut } = require('../middleware/route-guard')
const { isLoggedIn } = require('../middleware/route-guard')
const saltRounds = 10;

router.get('/main', isLoggedIn, (req, res) => {
    res.render('userpriv/main')
})
router.get('/private', isLoggedIn, (req, res) => {
    res.render('auth/private')
})

router.get("/user-sesion", (req, res) => {
    res.render("auth/user");
});

router.get('/closesesion', (req, res) => {
    req.session.destroy(() => res.redirect('/'))
})

router.get("/registro", isLoggedOut, (req, res) => {
    res.render("auth/register");
});



router.post("/registro", isLoggedOut, (req, res, next) => {

    const { email, password } = req.body

    bcrypt
        .genSalt(saltRounds)
        .then(salt => bcrypt.hash(password, salt))
        .then(passwordHash => User.create({ email, password: passwordHash }))
        .then(() => res.redirect('/login'))
        .catch(err => next(err))
})

router.get("/login", isLoggedOut, (req, res) => {
    res.render("auth/login");
});


router.post("/login", isLoggedOut, (req, res, next) => {

    const { email, password } = req.body

    if (email.length === 0 || password.length === 0) {
        res.render('auth/login', { errorMessage: 'You have some empty places' })
        return
    }

    User
        .findOne({ email })
        .then(usersearch => {

            if (!usersearch) {
                res.render('auth/login', { errorMessage: 'Email not found :(' })
                return
            }

            if (bcrypt.compareSync(password, usersearch.password) === false) {
                res.render('auth/login', { errorMessage: 'Incorrect Password :(' })
                return
            }

            req.session.currentUser = usersearch
            console.log("✔ LA SESION FUNCIONA ✔", req.session)
            res.redirect('/user-sesion')
        })
        .catch(err => next(err))
})

router.get('/cerrar-sesion', (req, res) => {
    req.session.destroy(() => res.redirect('/'))
})


module.exports = router; 
