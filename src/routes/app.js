const express = require('express');
const Promise = require("bluebird");
const router = express.Router();
const path = require('path')
const readFile = Promise.promisify(require("fs").readFile);
const auth = require("./auth")

const renderHtml = (req, res) => {
  let pagePath = req.url;
  let reqPage = pagePath.split("/todo/")[1]
  let filePath = path.join("ui/pages/" + reqPage + ".html")
  let nav = Tony.Config.nav;
  readFile(filePath, 'utf-8').then(html => {
    res.render('react.hbs', {
      title: nav && nav.sub ? nav.sub.filter((data) => {
        return data.name.toLowerCase() === pagePath;
      }).map((data) => {
        return data.name;
      }) : Tony.Config.project_name,
      nav: nav && nav.sub ? nav.sub : null,
      html: html,
      query: req.query
    });
  }).catch(err => {
    if (err.code === 'ENOENT')
      res.render('404.hbs')
  })
}

getTitle = (nav, pagePath) => {
  return nav.filter((data) => {
    return data.path.toLowerCase() === pagePath;
  }).map((data) => {
    return data.name
  });
}
module.exports = router.get("/", (req, res) => {
  res.redirect("/app/todo/home")
}).get("/todo", (req, res) => {
  res.redirect("/app/todo/home")
}).get("/todo/*", (req, res, next) => {
  renderHtml(req, res)
})