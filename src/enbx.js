'use strict';

var fs = require('fs'),
    path = require('path');

var EnbxDocument = require('../src/model').EnbxDocument,
    view = require('../src/view');

function open(file) {
    $('li.slide-thumbnail').remove();
    EnbxDocument.fromFile(file, doc => {
        view.render(doc.slides[0], doc.refs);
        view.renderThumbnails(doc.slides, doc.refs);
    });
}

function listEnbxFiles() {
    var repoDir = '.test'
    fs.readdir(repoDir, function(err, files) {
        if (err) {
            throw err;
        }
        files = files.map(f => path.join(repoDir, f).toLowerCase())
            .filter(f => fs.statSync(f).isFile() && f.substr(-5) === '.enbx');
        console.log(files)
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
