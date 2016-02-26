var express = require('express');
var path = require('path');
var fs = require('fs');

var router = express.Router();

router.get('/', function(req, res, next) {
    res.sendFile(path.resolve('./res/index.html'));
});

router.get('/display', function(req, res, next) {
    res.render('display');
});

router.get('/*.*', function(req, res, next) {
    var file = path.resolve(path.join('./res', req.url));
    fs.stat(file, (err, stats) => {
        if (err) {
            next(err);
        } else {
            res.sendFile(file);
        }
    });
});
router.get('/upload', function(req, res, next) {
    res.render('upload');
});


module.exports = router;