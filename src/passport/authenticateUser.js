const auth = require("../users/auth")

const authenticateUser = async (email, password, done, provider = 'local') => {
  try {
    let user = await auth.authUser(email, password, provider)
    if (provider === 'local') {
      if (user) {
        return done(null, user)
      } else {
        return done(null, false, {message: 'No user Found'})
      }
    } else {
      return user
    }
  } catch (e) {
    return done(null, false, {message: e.message})
  }
}

module.exports = authenticateUser