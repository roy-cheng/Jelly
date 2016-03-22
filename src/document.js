'use strict';

var fs = require('fs'),
    path = require('path');

var EnbxDocument = require('../src/repo').EnbxDocument,
    view = require('../src/view');

function open(file, func) {
    EnbxDocument.fromFile(file, func);
}

function listLocalFiles(func) {
    var repoDir = '.test'
    fs.readdir(repoDir, function(err, files) {
        if (err) {
            func(err, undefined);
            return;
        }
        files = files
            .filter(f => fs.statSync(path.join(repoDir, f)).isFile() && f.match(/enbx$/i))
            .map(f => { return {
                 name: f.substr(0, f.length - 5),
                 path: path.join(repoDir, f) 
                } });
        func(err, files);
    });
}

app.subscribe(() => {
    var state = app.getState();
    if (state.file.goingOpen) {
        const url = state.file.url;
        open(url, (err, doc) => {
            app.thenDispatch({ type: '~file/didOpen', document: doc, url: url });
        });
    }
    if (state.file.goingListLocal) {
        listLocalFiles((err, files) => {
            app.thenDispatch({ type: '~file/didListLocal', localFiles: files });
        });
    }
});


