'use strict';

var fs = require('fs-plus'),
  path = require('path'),
  unzip = require('unzip');

let model = require('./model');

function uncompress(zip, dst) {
  var promise = new Promise((resolve, reject) => {
    fs.createReadStream(zip).pipe(unzip.Extract({
      path: dst
    }).on('close', () => {
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
      } else {
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
      } else {
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
            console.error('error');
          }
          return path.join(uncompressedDir, dict[s.substr(5)]);
        }
      };
      resolve(refs);
    }).catch(err => {
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
      resolve(slide);
    });
  });
  return promise;
}

function load(file, settings) {
  if (!settings) {
    settings = {};
  }
  var promise = new Promise((resolve, reject) => {

    let tempDir = settings.unzip || '.temp';
    if (!fs.existsSync(tempDir)) {
      fs.makeTreeSync(tempDir);
    }

    let uncompressing = uncompress(file, tempDir);
    let loadingBoard = uncompressing.then(getBoard);
    let loadingRefs = uncompressing.then(getRefs);
    let loadingSlides = uncompressing.then(getSlideFiles);

    Promise.all([loadingBoard, loadingRefs, loadingSlides]).then(results => {
      let board = results[0];
      let refs = results[1];
      let slideFiles = results[2];

      if (settings.onSlideReady) {
        settings.onBoardReady(board);
      }

      if (settings.convertRef) {
        let getRef = refs.get;
        refs.get = id => settings.convertRef(getRef(id));
      }

      let slidePromises = slideFiles.map(f => getSlide(f, refs.get));
      slidePromises.forEach((promise, i) => {
        promise.then(slide => {
          if (settings.onSlideReady) {
            settings.onSlideReady(slide, i);
          }
        });
      });

      let doc = {};
      Promise.all(slidePromises).then(slides => {
        doc.slides = slides;
        resolve(doc);
      });
    });
  });
  return promise;
}

exports.load = load;