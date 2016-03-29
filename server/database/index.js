var model = require('./../../app/document');

const tempDirectory = 'data/repo';
const path = require('path');
const fs = require('fs');

function createRefConverter() {
  return res => {
    var url = 'res/' + encodeURIComponent(res.substr(tempDirectory.length + 1));
    return url;
  }
}

function save(enbxFile, name) {
  var promise = new Promise((resolve, reject) => {
    var unzipDir = path.join(tempDirectory, name);
    model.load(enbxFile, { unzip: unzipDir, convertRef: createRefConverter() }).then(doc => {
      fs.writeFile(path.join(unzipDir, 'doc.json'), JSON.stringify(doc), function(err) {
        if (err) {
          reject(err);
        }
        resolve(doc);
      });
    }).catch(err => {
      throw err;
    });
  });
  return promise;
}

function load(name) {
  if (!name.match(/\.enbx$/i)) {
    name = name + '.enbx';
  }
  var file = path.join(tempDirectory, name, 'doc.json');
  if (!fs.existsSync(file)) {
    reject('no such file: ' + name);
    return;
  }
  var promise = new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', function(err, content) {
      if (err) {
        reject(err);
      }
      resolve(content);
    });
  });
  return promise;
}

exports.save = save;
exports.load = load;