const {Strategy} = require('passport-local')
const authenticateUser = require('./authenticateUser')
module.exports = new Strategy({usernameField: 'email', passwordField: 'password'}, authenticateUser)