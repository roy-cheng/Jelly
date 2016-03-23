'use strict';

var fs = require('fs'),
    unzip = require('unzip'),
    path = require('path');
var createModel = require('../src/model').createModel;

function EnbxDocument(repo) {
}
EnbxDocument.fromFile = function (enbxFile, func) {
    var unzipDir = '.temp/' + Date.now().toString() + '/';
    fs.mkdirSync(unzipDir);

    function rel(p) {
        return path.resolve(unzipDir + p);
    }

    fs.createReadStream(enbxFile).pipe(unzip.Extract({path: unzipDir}).on('close', function () {
        var slideDir = rel('slides');
        fs.readdir(slideDir, function (err, slideFiles) {
            if (err) {
                throw err;
            }

            var doc = new EnbxDocument();
            doc.slides = [];

            slideFiles = slideFiles.map(f => path.join(slideDir, f))
                .filter(f => fs.statSync(f).isFile());
            slideFiles.sort((s1, s2) => {
                s1 = s1.replace(/^.*[\\\/]/, '').replace(/^Slide_([\d]+).xml$/i, '$1');
                s2 = s2.replace(/^.*[\\\/]/, '').replace(/^Slide_([\d]+).xml$/i, '$1');
                return parseInt(s1) - parseInt(s2);
            });
            var boardFile = rel('board.xml');
            var refFile = rel('reference.xml');
            var checkRenturn = () => {
                if (doc.board && doc.refs && doc.slides.length == slideFiles.length
                    && doc.slides.every(x => x)) {
                    func(err, doc);
                }
            };
            readXmlFile(refFile, (err, model) => {
                if(err){
                    var relationships = []
                    model = {}
                }
                else if(typeof model.relationships === 'undefined'){
                    var relationships = []
                }
                else{
                    var relationships = model.relationships
                }
                doc.refs = model;
                var dict = [];
                for (var r of relationships) {
                    dict[r.id] = r.target;
                }
                doc.refs.resolve = s => {
                    if (typeof s === 'undefined') {
                        console.error('error')
                    }
                    return rel(dict[s.substr(5)]);
                }
                checkRenturn();
            });
            readXmlFile(boardFile, (err, model) => {
                doc.board = model;
                checkRenturn();
            });
            for (let i = 0; i < slideFiles.length; i++) {
                readXmlFile(slideFiles[i], (err, model) => {
                    doc.slides[i] = model;
                    model._f = slideFiles[i];
                    checkRenturn();
                });
            }
        });
    }));
}

function readXmlFile(file, func) {
    fs.readFile(file, 'utf8', function (err, data) {
        if(err){
            func(err, {});
        }
        else{
            var parser = new DOMParser();
            var xmlDom = parser.parseFromString(data, 'text/xml');
            var m = createModel(xmlDom.documentElement);
            func(err, m);
        }
    });
}

exports.EnbxDocument = EnbxDocument;