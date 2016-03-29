var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

const repoDir = 'data/repo';

router.get('/*', function(req, res, next) {
  var p = req.url.replace(/^\//, '');
  p = path.join(repoDir, decodeURIComponent(p)) ;
  fs.readFile(p, (err, content) => {
    if (err) {
      throw err;
    }
    res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(content, 'binary');
  });
});

module.exports = router;