const users = require("./users")
const {info} = require('../misc/style')

class Auth {
  async register(options) {
    try {
      if (!options.email || !options.password)
        throw new Error("Please provide Email/Password")
      if (options.password.trim().length < 8)
        throw new Error("Password length is too short")
      await users.connect()
      options.email = options.email.toLowerCase()
      let user = await users.getUserBy("email", options.email)
      if (user && user.length) {
        throw new Error("User already exists!!!")
      }
      if (!options.username)
        options.username = options.email.split("@")[0]
      users.setContext({doc_id: "username", slug: true})
      let data = await users.insert(options)
      users.disconnect()
      return data
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async authUser(userEmail, userPassword, provider = 'local') {
    try {
      if (provider === 'local' && (userEmail.length === 0 || userPassword.length === 0))
        throw new Error("Please provide Email/Password")
      await users.connect()
      let user = await users.getUserBy('email', userEmail)
      users.disconnect()
      if (!user || user.length <= 0) {
        if (provider === 'local') {
          throw new Error("Email/User not found")
        } else {
          return {email: userEmail, username: userEmail.split("@")[0], new: 1}
        }
      } else {
        user = user[0]
        if (provider === 'local') {
          let {password} = users.generatePassword(userPassword, user.salt)
          if (password === user.password) {
            return {email: user.email, username: user.username}
          } else
            throw new Error("Password is incorrect!!!")
        } else if (provider === 'google') {
          return {email: user.email, username: user.username, new: 0}
        } else {
          throw new Error('Something went wrong!!!')
        }
      }
    } catch (e) {
      throw new Error(e.message)
    }
  }


  logout(req, res) {
    req.logout()
    delete Tony.Session.email
    delete Tony.Session.username
    res.redirect('/')
  }

  isAuthenticated(req) {
    if (Tony.Config.dev)
      return true
    return req.isAuthenticated()
  }

  checkAuth(req, res, next) {
    if (Tony.Config.dev || req.isAuthenticated()) {
      return next()
    }
    res.redirect("/")
  }

  checkAuthForApis(req, res, next) {
    if (Tony.Config.dev || req.isAuthenticated()) {
      return next()
    }
    res.redirect("/auth/login")
  }

  checkNotAuth(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }

  async getLoggedInUserData() {
    try {
      if (Tony.Session && Tony.Session.username) {
        await users.connect()
        let userdata = await users.getUserBy('_id', Tony.Session.username)
        userdata = userdata[0]
        users.disconnect()
        return {
          firstname: userdata.firstname,
          lastname: userdata.lastname,
          email: userdata.email,
          username: userdata.username
        }
      } else if (Tony.Config.dev) {
        return {
          firstname: 'Tejas',
          lastname: 'Rana',
          email: 'tejasrana30898@gmail.com',
          username: 'tony3898'
        }
      } else
        throw new Error('No user logging yet')
    } catch (e) {
      throw new Error(e.message)
    }
  }

}

module.exports = new Auth()