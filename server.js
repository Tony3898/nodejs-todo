global.Tony = {
  Config: {},
  Session: {},
}
require('./src/misc/config')
const express = require("express")
const auth = require("./src/users/auth")
const users = require('./src/users/users')
const mongo = require("./src/db/mongo")
const path = require("path")
const initializePassport = require('./src/passport/passport-config')
const cors = require('cors');
const app = express()
const hbs = require('hbs')
const morgan = require("morgan")
const body_parser = require("body-parser")
const cookie_parser = require("cookie-parser")
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const {info} = require("./src/misc/style")

// init passport
initializePassport(passport)

//init default classes for api calls
global.APICLASSES = {users, auth}
require("./src/index")
// setup express app
app.use(flash())
app.use(session({
  name: 'tony3898_Auth',
  secret: users.generateRandomString(),
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(morgan('dev', {}))
app.use(body_parser.json())
app.use(cookie_parser())
app.use(cors())

// setup view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, "views/partials"));
app.use(express.urlencoded({extended: false}))
app.use("/public/assets", express.static(path.join(__dirname, "/public/assets")));
hbs.registerPartials(path.join(__dirname, "views/partials"));

//import all routers
let partialsRouter = require("./src/routes/partials")
app.use('/', partialsRouter)
app.use('/app', require('./src/routes/app'))
app.use("/api", auth.checkAuthForApis, require('./src/routes/api'))
app.use("/auth", require('./src/routes/auth')(passport))
app.get("/notfound", (req, res, next) => {
  res.render('404.hbs')
})

// listen app
app.set('port', Tony.Config.connection.port)
app.listen(Tony.Config.connection.port, () => {
  console.log(info("listening on http://" + Tony.Config.connection.host + ":" + Tony.Config.connection.port))
})

