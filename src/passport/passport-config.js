const users = require('../users/users')
const local = require('./local')

function initialize(passport) {
  passport.use(local)
  passport.serializeUser((user, done) => {
    Object.assign(Tony.Session, {email: user.email, username: user.username})
    done(null, user)
  })
  passport.deserializeUser(async (id, done) => {
    try {
      let user = await users.getUserBy('_id', id.username)
      user = user[0]
      Object.assign(Tony.Session, {email: user.email, username: user.username})
      return done(null, {email: user.email, username: user.username})
    } catch (e) {
      done(null, false, {message: e.message})
    }
  })
}

module.exports = initialize

