let express = require('express');
const auth = require("../users/auth")
let router = express.Router();

module.exports = router.get('/', (req, res, next) => {
  res.render('index.hbs', {
    digInUrl: Tony.Config.digInUrl ? Tony.Config.digInUrl : '/auth/login',
    project: Tony.Config.project_name,
    title: Tony.Config.project_name,
    loggedIn: auth.isAuthenticated(req),
    username: Tony.Session && Tony.Session.username ? Tony.Session.username : null
  })
})