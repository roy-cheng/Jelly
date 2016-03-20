'use strict';

if (!$) {
    var $ = require('../lib/jquery.js');
}

function updateLayout() {
    var $outterElement = $('#workspace');
    var $container = $('#board-container');
    $container.stop();
    $container.animate({
        width: $outterElement.width(),
        height: $outterElement.height()
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
    enbx.open('.test/test.enbx')
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
        }
        updateLayout();
    }
    // Esc
    if (event.keyCode === 27) {
        $('#board').removeClass('fullscreen');
        var remote = require('remote');
        var win = remote.getCurrentWindow();
        if (win.isMaximized()) {
            win.maximize();
        }
        updateLayout();
    }
});