var fs = require('fs'),
    xml2js = require('xml2js'),
    unzip = require('unzip'),
    Snap = require('snapsvg'),
    path = require('path');

var model = require('../src/model'),
    view = require('../src/view');

var repoDir = '.test';
var unzipDir = '.test/test.enbx.unzip/';
fs.del
function rel(p) {
    return path.resolve(unzipDir + p);
}

function open(file) {
    unzipDir = '.test/' + Date.now().toString() + '/';
    fs.mkdirSync(unzipDir);
    $('li.slide-thumbnail').remove();
    EnbxDocument.fromFile(file, doc => {
        view.render(doc.slides[0], doc.refs);
        view.renderThumbnails(doc.slides, doc.refs);
    });
}

function EnbxDocument() {
}
EnbxDocument.fromFile = function(enbxFile, func) {
    fs.createReadStream(enbxFile).pipe(unzip.Extract({ path: unzipDir }).on('close', function() {
        var slideDir = rel('slides');
        fs.readdir(slideDir, function(err, slideFiles) {
            if (err) {
                throw err;
            }

            var doc = new EnbxDocument();
            doc.slides = [];

            slideFiles = slideFiles.map(f => path.join(slideDir, f))
                .filter(f => fs.statSync(f).isFile());
            slideFiles.sort((s1, s2)=>{
                s1 = s1.replace(/^.*[\\\/]/, '').replace(/^Slide_([\d]+).xml$/i, '$1');
                s2 = s2.replace(/^.*[\\\/]/, '').replace(/^Slide_([\d]+).xml$/i, '$1');
                return parseInt(s1) - parseInt(s2);
            });
            var boardFile = rel('board.xml');
            var refFile = rel('reference.xml');
            // console.log(slideFiles);
            // console.log(slideFiles.length);
            var checkRenturn = () => {
                if (doc.board && doc.refs && doc.slides.length == slideFiles.length
                    && doc.slides.every(x => x)) {
                    console.log(doc);
                    func(doc);
                }
            };
            readXmlFile(refFile, model => {
                doc.refs = model;
                var dict = [];
                for (var r of model.relationships) {
                    dict[r.id] = r.target;
                }
                console.log(dict)
                doc.refs.resolve = s => {
                    if (typeof s === 'defined') {
                        console.log('error')
                    }
                    return rel(dict[s.substr(5)]);
                }
                checkRenturn();
            });
            readXmlFile(boardFile, model => {
                doc.board = model;
                checkRenturn();
            });
            for (let i = 0; i < slideFiles.length; i++) {
                readXmlFile(slideFiles[i], model => {
                    doc.slides[i] = model;
                    model._f = slideFiles[i];
                    checkRenturn();
                });
            }
        });
    }));
}
function readXmlFile(file, func) {
    fs.readFile(file, function(err, data) {
        xml2js.parseString(data, function(err, result) {
            if (err) {
                throw err;
            }
            var parser = new DOMParser();
            var xmlDom = parser.parseFromString(data, 'text/xml');
            var m = model.createModel(xmlDom.documentElement);
            func(m);
        });
    });
}

function listEnbxFiles() {
    fs.readdir(repoDir, function(err, files) {
        if (err) {
            throw err;
        }
        files = files.map(f => path.join(repoDir, f).toLowerCase())
            .filter(f => fs.statSync(f).isFile() && f.substr(-5) === '.enbx');
        for (let file of files) {
            var name = file.replace(/^.*[\\\/]/, '');
            name = name.substr(0, name.length - 5);
            let $li = $('<li></li>').text(name);
            $('#file-list-panel ul').append($li);
            $li.click(() => {
                open(file);
                $('#file-list-panel').hide();
            });
        }
    });
}

exports.open = open;
exports.listEnbxFiles = listEnbxFiles;
