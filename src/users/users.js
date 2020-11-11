const Mongo = require("../db/mongo")
const {success, error} = require("../misc/style")
const crypto = require("crypto")

class Users extends Mongo {
  constructor(collection) {
    super(collection);
  }

  generateRandomString() {
    return super.generateRandomString();
  }

  setContext(context) {
    super.setContext(context)
  }

  async getUserBy(key, value) {
    try {
      await super.connect()
      let query = {};
      query[key] = value
      let data = await super.find({query})
      super.disconnect()
      return data
    } catch (e) {
      throw new Error(e.message)
    }
  }

  generatePassword(password, salt) {
    if (!salt)
      salt = super.generateRandomString() + "-tony-" + Math.random().toString()
    password = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return {salt, password}
  }

  async insert(options) {
    try {
      await super.connect()
      if (options.password) {
        let {password, salt} = this.generatePassword(options.password)
        options.password = password
        options.salt = salt
      }
      let data = await super.insert(options);
      await super.disconnect()
      return data
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async find(options) {
    try {
      let data = await super.find(options)
      await super.disconnect()
      return data
    } catch (e) {
      throw new Error(e.message)
    }
  }
}

module.exports = new Users("users")