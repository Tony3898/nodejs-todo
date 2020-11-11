"use strict"
const {MongoClient, Server} = require("mongodb");
const {mongo_db} = Tony.Config;
const {success, error, warning, info} = require("../misc/style");
const {v4: uuidv4} = require('uuid');
const slug = require('slug')

class Mongo {
  constructor(collection = "TDev") {
    this.collection = collection
    this.client = "";
    this.db = "";
    this.defaultDB = "DB_" + this.collection
    this.defaultURL = "mongodb://127.0.0.1:27017"
    this.context = {
      autoId: false,
      doc_id: "-1",
      slug: false
    }
  }

  init() {
    if (!mongo_db || !mongo_db.url) {
      console.log(warning("Connection url is missing, using" + this.defaultDB + " as default"))
    }

    if (!mongo_db || !mongo_db.db) {
      console.log(warning("Database name is missing, using " + this.defaultDB + " as default"))
    }

    this.database = mongo_db && mongo_db && mongo_db.db ? mongo_db.db : this.defaultDB;
    this.url = mongo_db && mongo_db.url ? mongo_db.url : this.defaultURL
    this.connectionUrl = this.url + "/" + this.database;
  }

  async connect() {
    try {
      this.init()
      this.client = await MongoClient.connect(this.connectionUrl, {useUnifiedTopology: true})
      this.db = this.client.db();
      return this.client;
    } catch (e) {
      (error(e.message))
      return e;
    }
  }

  disconnect() {
    return this.client.close()
  }

  getContext() {
    return this.context
  }

  setContext(context) {
    this.context = Object.assign(this.context, context)
  }

  getClient() {
    return this.client
  }

  generateRandomString() {
    return uuidv4();
  }

  generateDocumentId(options) {
    try {
      if (this.context.autoId) {
        return this.generateRandomString;
      } else if (this.context.doc_id.length > 0 && this.context.doc_id !== "-1") {
        if (this.context.slug) {
          return slug(options[this.context.doc_id], {
            replacement: "_",
            lower: true
          });
        } else if (options[this.context.doc_id]) {
          return options[this.context.doc_id];
        } else {
          throw new Error(`${this.context.doc_id} is missing`);
        }
      } else {
        throw new Error('please provide _id for insertions of data')
      }
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async getLastDocument(key) {
    try {
      if (!key)
        throw new Error('Key is missing!!')
      let matchQuery = {sort: {}, limit: 1}
      matchQuery['sort'][key] = -1
      return await this.find(matchQuery)
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async getDocIdFromLastDocument(key, splitter = 0, spiltPart = 1, init = 1) {
    try {
      let data = await this.getLastDocument(key)
      if (data && data.length) {
        data = data[0]
        return splitter <= 0 ? parseInt(data[key]) + 1 : parseInt(data[key].split(splitter)[spiltPart]) + 1
      } else {
        return init
      }
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async insertOne(options) {
    try {
      options._id = this.generateDocumentId(options)
      options['meta'] = {
        timestamp: {
          created: Date.now(),
          updated: Date.now()
        }
      }
      return await this.db.collection(this.collection).insertOne(options);
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async insertMany(options) {
    try {
      options.forEach(data => {
        data._id = this.generateDocumentId(data)
        data['meta'] = {
          timestamp: {
            created: Date.now(),
            updated: Date.now()
          }
        }
      });
      return await this.db.collection(this.collection).insertMany(options);
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async insert(options) {
    if (!this.context.autoId && this.context.doc_id === "-1") {
      (error("Please provide valid doc ID reference"))
      throw new Error("Please provide valid doc ID reference")
    }
    try {
      if (Array.isArray(options)) {
        return await this.insertMany(options);
      } else {
        return await this.insertOne(options);
      }
    } catch (e) {
      console.log(error(e.message))
      throw new Error(e.message)
    }
  }

  async update(options) {
    try {
      options['meta']['updated'] = Date.now()
      return await this.db.collection(this.collection).updateOne(options.query, {$set: options.update});
    } catch (e) {
      return e;
    }
  }

  async find(options) {
    try {
      let pipelines = [];
      if (options.query)
        pipelines.push({$match: options.query})
      if (options.sort)
        pipelines.push({$sort: options.sort})
      if (options.limit)
        pipelines.push({$limit: options.limit})
      return await this.db.collection(this.collection).aggregate(pipelines).toArray();
    } catch (e) {
      return e;
    }
  }
}

module.exports = Mongo