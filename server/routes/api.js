var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var database = require('./../database');

var upload = multer({ dest: 'data/temp/' })
var repoDir = 'data/repo/';

function getFileList() {
  var promise = new Promise((resolve, reject) => {
    fs.readdir(repoDir, function(err, files) {
      if (err) {
        reject(err);
      }
      files = files.map(f => f.replace(/.enbx$/i, ''));
      resolve({ files: files });
    });
  });
  return promise;
}

router.get('/', function(req, res, next) {
  res.send({ version: '0.1.0' });
});

router.get('/list', function(req, res, next) {
  getFileList().then(res.send.bind(res)).catch(err => {
    throw err;
  })
});

router.post('/upload', upload.single('enbx'), function(req, res, next) {
  database.save(req.file.path, req.file.originalname).then(doc => {
    res.send(doc);
  }).catch(err => {
    throw err;
  });
});

// var database = {};
router.get('/file', function(req, res, next) {

  if (!req.query.name) {
    res.send({ err: 'give me a name!' })
    return;
  }

  var name = decodeURIComponent(req.query.name);
  database.load(name)
    .then(data => {
      res.send(data);
    })
    .catch(err => { throw err });
});


module.exports = router;
