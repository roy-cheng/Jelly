'use strict';

(function() {
    var fs = require('fs'),
        path = require('path'),
        unzip = require('unzip'),
        model = require('../src/model');

    var EnbxDocument = require('../src/repo').EnbxDocument,
        view = require('../src/view');

    function open(file, func) {
        EnbxDocument.fromFile(file, func);
    }

    function listLocalFiles(func) {
        var repoDir = 'local'
        fs.readdir(repoDir, function(err, files) {
            if (err) {
                func(err, undefined);
                return;
            }
            files = files
                .filter(f => fs.statSync(path.join(repoDir, f)).isFile() && f.match(/enbx$/i))
                .map(f => {
                    return {
                        name: f.substr(0, f.length - 5),
                        path: path.join(repoDir, f)
                    }
                });
            func(err, files);
        });
    }

    function uncompress(zip, dst) {
        var promise = new Promise((resolve, reject) => {
            fs.createReadStream(zip).pipe(unzip.Extract({ path: dst }).on('close', () => {
                resolve(dst);
            }));
        });
        return promise;
    }

    function readXmlFile(file) {
        var promise = new Promise((resolve, reject) => {
            fs.readFile(file, 'utf8', function(err, data) {
                if (err) {
                    reject();
                }
                else {
                    var parser = new DOMParser();
                    var xmlDom = parser.parseFromString(data, 'text/xml');
                    var m = model.createModel(xmlDom.documentElement);
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
            readXmlFile(path.join(uncompressedDir, 'board.xml')).then(relationships => {
                var dict = [];
                for (var r of relationships) {
                    dict[r.id] = r.target;
                }
                var refs = {
                    get: s => {
                        if (typeof s === 'undefined') {
                            console.error('error')
                        }
                        return relativePath(dict[s.substr(5)]);
                    }
                };
                resolve(refs);
            }).catch(relationships => {
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
            readXmlFile(slideFile).then(slide => {
                resolve(slide);
            });
        });
        return promise;
    }

    function load(file) {
    }

    class LocalRepository {
        static loadDocument(builder) {
            let tempDir = '.temp/' + Date.now().toString() + '/';
            fs.mkdirSync(tempDir);

            let uncompressing = uncompress(builder.url, tempDir);
            let loadingBoard = uncompressing.then(getBoard);
            let loadingRefs = uncompressing.then(getBoard);
            let loadingSlides = uncompressing.then(getSlideFiles);

            Promise.all([loadingBoard, loadingRefs, loadingSlides]).then(results => {
                let board = results[0];
                let refs = results[1];
                let slideFiles = results[2];

                builder.onBoardReady(board);

                let slidePromises = slideFiles.map(f => getSlide(f)).forEach((promise, i) => {
                    promise.then(slide => {
                        builder.onSlideReady(slide, i);
                    });
                })
            });
        }
    }

    class DocumentBuilder {
        constructor(url) {
            this.url = url;
        }
        onBoardReady(board) {
            app.dispatch({ type: '~file/open/board', board, url: this.url });
        }
        onSlideReady(slide, index) {
            app.dispatch({ type: '~file/open/slide', slide, index, url: this.url });
        }
    }

    app.subscribe(() => {
        var state = app.getState();
        if (state.file.goingOpen) {
            const url = state.file.url;
            var builder = new DocumentBuilder(url);
            LocalRepository.loadDocument(builder);
        }
    });

    app.subscribe(() => {
        var state = app.getState();
        if (state.file.goingListLocal) {
            listLocalFiles((err, files) => {
                app.thenDispatch({ type: '~file/didListLocal', localFiles: files });
            });
        }
    });
})();
// function uncompress(){
//   let dfd = $.Deferred();
//   fs.createReadStream(url).pipe(unzip.Extract({ path: tempDir }).on('close', () => {
//     dfd.resolve();
//   }));
//   return dfd.promise;
// }


// class LocalRepository {
//   static load(url, parser) {
//     var tempDir = '.temp/' + Date.now().toString() + '/';
//     fs.mkdirSync(tempDir);

//     function relativePath(p) {
//       return path.resolve(unzipDir + p);
//     }

//     var doc = new EnbxDocument();

//     fs.createReadStream(url).pipe(unzip.Extract({ path: tempDir }).on('close', () => {
//       var slideDir = relativePath('slides');
//       fs.readdir(slideDir, function(err, slideFiles) {
//         if (err) {
//           throw err;
//         }

//         slideFiles = slideFiles.map(f => path.join(slideDir, f))
//           .filter(f => fs.statSync(f).isFile());
//         slideFiles.sort((s1, s2) => {
//           s1 = s1.replace(/^.*[\\\/]/, '').replace(/^Slide_([\d]+).xml$/i, '$1');
//           s2 = s2.replace(/^.*[\\\/]/, '').replace(/^Slide_([\d]+).xml$/i, '$1');
//           return parseInt(s1) - parseInt(s2);
//         });

//         var boardFile = relativePath('board.xml');
//         var refFile = relativePath('reference.xml');
//         var checkRenturn = () => {
//           if (doc.board && doc.refs && doc.slides.length == slideFiles.length
//             && doc.slides.every(x => x)) {
//             func(err, doc);
//           }
//         };
//         readXmlFile(refFile, (err, model) => {
//           if (err) {
//             var relationships = []
//             model = {}
//           }
//           else if (typeof model.relationships === 'undefined') {
//             var relationships = []
//           }
//           else {
//             var relationships = model.relationships
//           }
//           doc.refs = model;
//           var dict = [];
//           for (var r of relationships) {
//             dict[r.id] = r.target;
//           }
//           doc.refs.resolve = s => {
//             if (typeof s === 'undefined') {
//               console.error('error')
//             }
//             return relativePath(dict[s.substr(5)]);
//           }
//           checkRenturn();
//         });
//         readXmlFile(boardFile, (err, model) => {
//           doc.board = model;
//           checkRenturn();
//         });
//         for (let i = 0; i < slideFiles.length; i++) {
//           readXmlFile(slideFiles[i], (err, model) => {
//             doc.slides[i] = model;
//             model._f = slideFiles[i];
//             checkRenturn();
//           });
//         }
//       });
//     }));
//   }

//   static list(repo, func) {
//     fs.readdir(repoDir, function(err, files) {
//       if (err) {
//         console.log('error (' + err + ') occured while listing repository: ' + repo);
//         return;
//       }
//       files = files
//         .filter(f => fs.statSync(path.join(repoDir, f)).isFile() && f.match(/enbx$/i))
//         .map(f => {
//           return {
//             name: f.substr(0, f.length - 5),
//             path: path.join(repoDir, f)
//           }
//         });
//       func(err, files);
//     });
//   }
// }

// class EnbxDocument {
//   constructor() {
//     this.slides = [];
//     this.refs = null;
//     this.board = null;
//     this.loadCompleted = false;
//   }
// }



