'use strict';

(function() {
    $(document).ready(function() {
        updateLayout();

        $('#file-list-button').click(() => {
            $('#file-list-panel').show();
        });
        $('#content').click(() => {
            $('#file-list-panel').hide();
        });
        app.dispatch({ type: '~ready' });


        $('html').keydown(function(event) {
            // F5
            if (event.keyCode === 116) {
                app.dispatch({ type: '~view/display' });
                maximize(true);
            }
            // Esc
            if (event.keyCode === 27) {
                app.dispatch({ type: '~view/edit' });
                maximize(false);
            }
        });

        window.onresize = function() {
            updateLayout();
        };
    });

    function maximize(max) {
        var remote = require('remote');
        var win = remote.getCurrentWindow();
        if (max) {
            $('#board').addClass('fullscreen');
            if (!win.isMaximized()) {
                win.maximize();
                win.setFullScreen(true);
            }
        }
        else {
            $('#board').removeClass('fullscreen');
            if (win.isMaximized() || win.isFullScreen()) {
                win.setFullScreen(false);
                win.restore();
            }
        }
        updateLayout();
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

    app.subscribe(() => {
        var state = app.getState();
        console.log(state)
        if (state.file.justOpened) {
            $('li.slide-thumbnail').remove();
            var doc = state.file.document;
            render(doc.slides[0], doc.refs);
            renderThumbnails(doc.slides, doc.refs);    
    }
        if (state.file.justListLocal) {
            renderFileList(state.file.localFiles);
        }
    });
})()

function renderFileList(files){        
    for (let file of files) {
        let $li = $('<li></li>').text(file.name);
        $('#file-list-panel ul').append($li);
        $li.click(() => {
            app.thenDispatch({ type: '~file/open', url: file.path });
            $('#file-list-panel').hide();
        });
    }
}


var Snap = require('snapsvg');

function drawGrid() {
    var s = Snap('#board');
    for (var x = 20; x < 1280; x += 20) {
        var line = s.line(x, 0, x, 720);
        line.attr({
            stroke: "888",
            strokeWidth: 1
        });
        if (x % 100 == 0) {
            line.attr({
                stroke: "000",
                strokeWidth: 2
            });
        }
        if (x % 500 == 0) {
            line.attr({
                strokeWidth: 6
            });
        }
    }
    for (var y = 20; y < 720; y += 20) {
        var line = s.line(0, y, 1280, y);
        line.attr({
            stroke: "888",
            strokeWidth: 1
        });
        if (y % 100 == 0) {
            line.attr({
                stroke: "000",
                strokeWidth: 2
            });
        }
        if (y % 500 == 0) {
            line.attr({
                strokeWidth: 6
            });
        }
    }
}

function render(slideModel, refs) {
    var s = new Snap('#board');
    s.clear();
    var background = s.rect(0, 0, 1280, 720);
    background.attr({ fill: slideModel.background });
    for (var element of slideModel.elements) {
        drawElement(s, element, refs);
    }
    //drawGrid();
}

function drawElement(s, element, refs) {
    var table = {
        Text: drawText,
        Shape: drawShape,
        Picture: drawPicture
    };
    var draw = table[element._type];
    if (typeof draw !== 'undefined')
        draw(s, element, refs);
}

function drawShape(s, m) {
    var shape = null;
    switch (m.geometry) {
        case 'Rectangle':
            shape = s.rect(m.x, m.y, m.width, m.height);
            break;
        case 'Circle':
            shape = s.ellipse(m.x + m.width / 2, m.y + m.height / 2, m.width / 2, m.height / 2);
            break;
    }
    if (shape) {
        shape.attr({
            fill: m.background,
            stroke: m.foreground,
            strokeWidth: m.thickness
        });
    }
}

function drawPicture(s, m, refs) {
    s.image(refs.resolve(m.source), m.x, m.y, m.width, m.height);
}

function drawText(s, m) {
    var left = m.x + 10;
    var top = 10 + m.y;
    for (var i = 0; i < m.richText.textLines.length; i++) {
        var line = m.richText.textLines[i];
        if (typeof line.textRuns === 'undefined') {
            continue;
        }
        var textRunInnerStrings = line.textRuns.map(function(x) {
            return x.text
        });
        var text = s.text(left, 0, textRunInnerStrings);
        for (var j = 0; j < line.textRuns.length; j++) {
            var runModel = line.textRuns[j];
            var run = text.selectAll('tspan:nth-child(' + (j + 1) + ')');
            run.attr({
                fill: runModel.foreground,
                'font-size': runModel.fontSize,
                'font-family': runModel.fontFamily
            });
        }
        var box = text.getBBox();
        text.attr({
            y: top - box.y
        });
        top = top + box.height * 1.1;
    }
}

function renderThumbnails(models, refs) {
    var $panel = $('#thumbnails ul');

    for (let m of models) {
        var $svg = $('<svg viewBox="0 0 1280 720"></svg>');
        let $li = $('<li class="slide-thumbnail"></li>');
        $panel.append($li);
        $li.append($svg);
        var s = new Snap($svg[0]);
        var background = s.rect(0, 0, 1280, 720);
        background.attr({ fill: m.background });

        for (var element of m.elements) {
            drawElement(s, element, refs);
        }

        $li.click(() => {
            render(m, refs);
            $('#thumbnails li').removeClass('active');
            $li.addClass('active');
        });
    }
    $('#thumbnails li:first').addClass('active');
}

exports.render = render;
exports.renderThumbnails = renderThumbnails;