var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multer = require('multer');

var upload = multer({ dest: 'data/temp/' })
var repoDir = 'data/repo/';

function getFileList(){
    var promise = new Promise((resolve, reject) => {
        fs.readdir(repoDir, function(err, files) {
            if (err) {
                reject(err);
            }
            files = files.map(f => path.join(repoDir, f).toLowerCase())
                .filter(f => fs.statSync(f).isFile() && f.substr(-5) === '.enbx')
                .map(f=>f.replace(/^.*[\\\/]/, '').replace(/.enbx$/i, ''));
            resolve({files: files});
        });
    });
    return promise;
}

router.get('/', function(req, res, next) {
    res.send({ version: '0.1.0' });
});

router.get('/list', function(req, res, next) {
    getFileList().then(send).catch(err=>{
        throw err;
    })
});

router.post('/upload', upload.single('enbx'),  function(req, res, next) {  
    fs.rename(req.file.path, repoDir+req.file.originalname, (err)=>{
        if(err) {
            throw err;
        }
        else {
            getFileList().then(res.send.bind(res));
        }
    });
});

router.get('/file', function(req, res, next) {
    EnbxDocument.fromFile('repo/test.enbx', file=>{
        res.send(file);
    });
});

module.exports = router;
