"use strict";
const Mongo = require("../db/mongo");
const {todo} = require('../misc/constants')

class Todos extends Mongo {
  constructor(collection) {
    super(collection);
    this.doc_id = 'todo_id';
    super.setContext({doc_id: this.doc_id})
  }

  async getLastDocument(key) {
    try {
      if (!key)
        throw new Error('Key is missing!!')
      let matchQuery = {sort: {}, limit: 1}
      matchQuery['sort'][key] = -1
      let last_doc = await this.findOne(matchQuery)
      if (last_doc && last_doc.length) {
        last_doc = last_doc[0]
        return last_doc[this.doc_id] + 1
      } else
        return 1
    } catch (e) {
      throw new Error('last document ' + e.message)
    }
  }

  async insert(options) {
    try {
      await super.connect()
      options[this.doc_id] = await this.getLastDocument(this.doc_id)
      options.owner = Tony.Session.username
      options.status = todo.open;
      let data = await super.insert(options);
      await super.disconnect();
      return data
    } catch (e) {
      console.log(e)
      throw new Error(e.message)
    }
  }

  async findAll(options) {
    console.log(options)
    try {
      await super.connect()
      if (!options.query)
        options.query = {owner: Tony.Session.username}
      else
        options.query['owner'] = Tony.Session.username
      let todos = await super.find(options)
      await super.disconnect()
      return todos
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async findOne(options) {
    try {
      return await super.find(options)
    } catch (e) {
      throw new Error(e.message)
    }
  }

  async update(options) {
    try {
      await super.connect()
      let oldData = await this.findOne(options)
      if (!oldData || !oldData.length)
        throw new Error('Todo not found')
      else {
        let updatedData = await super.update(options)
        await super.disconnect()
        return updatedData
      }
    } catch (e) {
      throw new Error(e.message)
    }
  }
}

module.exports = new Todos('todo')