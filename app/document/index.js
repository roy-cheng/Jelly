'use strict';

var fs = require('fs'),
    path = require('path'),
    unzip = require('unzip');

let model = require('./model');

function listLocalFiles() {
    const repoDir = '../local'
    var promise = new Promise((resolve, reject) => {
        fs.readdir(repoDir, function(err, files) {
            if (err) {
                reject(err);
            }
            files = files
                .filter(f => fs.statSync(path.join(repoDir, f)).isFile() && f.match(/enbx$/i))
                .map(f => {
                    return {
                        name: f.substr(0, f.length - 5),
                        path: path.join(repoDir, f)
                    }
                });
            resolve(files);
        });
    });
    return promise;
}

function uncompress(zip, dst) {
    var promise = new Promise((resolve, reject) => {
        fs.createReadStream(zip).pipe(unzip.Extract({ path: dst }).on('close', () => {
            resolve(dst);
        }));
    });
    return promise;
}

function readXmlFile(file, res) {
    var promise = new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', function(err, data) {
            if (err) {
                reject();
            }
            else {
                if (typeof DOMParser === 'undefined') {
                    var DOMParser = require('xmldom').DOMParser;
                }
                var parser = new DOMParser();
                var xmlDom = parser.parseFromString(data, 'text/xml');
                var m = model(xmlDom.documentElement, res);
                resolve(m);
            }
        });
    });
    return promise;
}

function getSlideFiles(uncompressedDir) {
    var slideDir = path.join(uncompressedDir, 'slides');
    var promise = new Promise((resolve, reject) => {
        fs.readdir(slideDir, function(err, slideFiles) {
            if (err) {
                reject();
            }
            else {
                slideFiles = slideFiles.map(f => path.join(slideDir, f))
                    .filter(f => fs.statSync(f).isFile());
                slideFiles.sort((s1, s2) => {
                    s1 = s1.replace(/^.*[\\\/]/, '').replace(/^Slide_([\d]+).xml$/i, '$1');
                    s2 = s2.replace(/^.*[\\\/]/, '').replace(/^Slide_([\d]+).xml$/i, '$1');
                    return parseInt(s1) - parseInt(s2);
                });

                resolve(slideFiles);
            }
        });
    });
    return promise;
}

function getBoard(uncompressedDir) {
    return readXmlFile(path.join(uncompressedDir, 'board.xml'));
}

function getRefs(uncompressedDir) {
    var promise = new Promise((resolve, reject) => {
        readXmlFile(path.join(uncompressedDir, 'reference.xml')).then(res => {
            var dict = {};
            for (var r of res.relationships) {
                dict[r.id] = r.target;
            }
            var refs = {
                get: s => {
                    if (typeof s === 'undefined') {
                        console.error('error')
                    }
                    return path.join(uncompressedDir, dict[s.substr(5)]);
                }
            };
            resolve(refs);
        }).catch(err => {
            console.error(err);
            var refs = {
                get: s => {
                    return undefined;
                }
            };
            resolve(refs);
        });
    });
    return promise;
}

function getSlide(slideFile, getRef) {
    var promise = new Promise((resolve, reject) => {
        readXmlFile(slideFile, getRef).then(slide => {
            console.log(slide);
            resolve(slide);
        });
    });
    return promise;
}

function load(url, callbacks) {
    let tempDir = '../.temp/' + Date.now().toString() + '/';
    fs.mkdirSync(tempDir);

    let uncompressing = uncompress(url, tempDir);
    let loadingBoard = uncompressing.then(getBoard);
    let loadingRefs = uncompressing.then(getRefs);
    let loadingSlides = uncompressing.then(getSlideFiles);

    Promise.all([loadingBoard, loadingRefs, loadingSlides]).then(results => {
        let board = results[0];
        let refs = results[1];
        let slideFiles = results[2];

        if (callbacks.onSlideReady) {
            callbacks.onBoardReady(board);
        }

        let slidePromises = slideFiles.map(f => getSlide(f, refs.get)).forEach((promise, i) => {
            promise.then(slide => {
                if (callbacks.onSlideReady) {
                    callbacks.onSlideReady(slide, i);
                }
            });
        })
    });
}

exports.load = load;
exports.listLocalFiles = listLocalFiles;