'use strict';

var app = {
    runningInNode: typeof require === 'function'
}

if (app.runningInNode) {
    var $ = require('../lib/jquery.js');
}

function updateLayout() {
    var workspace = $('#workspace');
    $('#board-container').stop().animate({
        width: workspace.width(),
        height: workspace.height()
    }, 120);

    var $thumbnails = $('#thumbnails');
    $thumbnails.height($thumbnails.parent().height());
}

window.onresize = function() {
    updateLayout();
};

$(document).ready(function() {
    updateLayout();

    $('#file-list-button').click(() => {
        $('#file-list-panel').show();
    });
    $('#content').click(() => {
        $('#file-list-panel').hide();
    });

    var enbx = require('../src/enbx.js');
    enbx.open('.test/x.enbx')
    enbx.listEnbxFiles();
});

$('html').keydown(function(event) {
    // F5
    if (event.keyCode === 116) {
        $('#board').addClass('fullscreen');
        var remote = require('remote');
        var win = remote.getCurrentWindow();
        if (!win.isMaximized()) {
            win.maximize();
            win.setFullScreen(true);
        }
        updateLayout();
    }
    // Esc
    if (event.keyCode === 27) {
        $('#board').removeClass('fullscreen');
        var remote = require('remote');
        var win = remote.getCurrentWindow();
        if (win.isMaximized() || win.isFullScreen()) {
            win.setFullScreen(false);
            win.restore();
            console.log()
        }
        updateLayout();
    }
});