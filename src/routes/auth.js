let express = require('express');
let auth = require('../users/auth')
let router = express.Router();

let authRoute = (passport) => {
  return router
      .post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true,
      }))
      .get('/login', auth.checkNotAuth, (req, res, next) => {
        res.render('login.hbs', {
          project: Tony.Config.project_name,
          title: 'Login',
        })
      })
      .get('/register', auth.checkNotAuth, (req, res, next) => res.render('register.hbs', {
        project: Tony.Config.project_name,
        title: 'Register'
      }))
      .post('/register', async (req, res, next) => {
        try {
          let userData = await auth.register(req.body)
          if (userData) {
            res.json({type: 'success', message: userData})
          } else {
            res.status(400).json({type: 'error', message: 'something went wrong!!! try again'})
          }
        } catch (e) {
          res.status(404).json({type: 'error', message: e.message})
        }
      }).get('/logout', auth.checkAuth, ((req, res, next) => {
        auth.logout(req, res)
      }))
}

module.exports = authRoute