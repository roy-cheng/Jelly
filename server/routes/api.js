var express = require('express');
var router = express.Router();
var multer = require('multer');
var database = require('./../lib/database');
var path = require('path');

var upload = multer({
  dest: 'data/temp/'
});

router.get('/', function(req, res, next) {
  res.send({
    version: '0.1.0'
  });
});

router.post('/upload', upload.single('enbx'), function(req, res, next) {
  database.save(req.file.path, req.file.originalname).then(doc => {
    res.send(doc);
  }).catch(err => {
    throw err;
  });
});

router.get('/board', function(req, res, next) {
  res.sendFile(path.resolve('.temp/repo/Nuget.enbx/doc.json'));
});


module.exports = router;