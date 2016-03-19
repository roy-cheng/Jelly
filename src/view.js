function drawGrid() {
    var s = Snap('#board');
    for (var x = 100; x < 1280; x += 100) {
        var line = s.line(x, 0, x, 720);
        line.attr({
            stroke: "888",
            strokeWidth: 1
        });
        if (x % 250 == 0) {
            line.attr({
                stroke: "000"
            });
        }
    }
    for (var y = 100; y < 720; y += 100) {
        var line = s.line(0, y, 1280, y);
        line.attr({
            stroke: "888",
            strokeWidth: 1
        });
        if (y % 250 == 0) {
            line.attr({
                stroke: "000"
            });
        }
    }
}

function render(slideModel, refs) {
    var s = new Snap('#board');
    var background = s.rect(0, 0, 1280, 720);
    background.attr({ fill: slideModel.background });
    for (var element of slideModel.elements) {
        drawElement(s, element, refs);
    }
    // var svg = drawS(slideModel, refs);
    // var $container = $('board-container');
    // $container.remove($('board-container svg'));
    // var con = document.getElementById('board-container');
    // con.appendChild(svg);
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
    for (var i = 0; i < m.richText.textLines.length; i++) {
        var line = m.richText.textLines[i];
        if (typeof line.textRuns === 'undefined') {
            continue;
        }
        var textRunInnerStrings = line.textRuns.map(function(x) {
            return x.text
        });
        var text = s.text(m.x, m.y, textRunInnerStrings);
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
            x: m.x + (m.x - box.x),
            y: m.y + (m.y - box.y)
        });
    }
}

function renderThumbnails(models, refs) {
    var $panel = $('#thumbnails ul');
    
    for (let m of models) {
        var $svg = $('<svg viewBox="0 0 1280 720"></svg>');
        var $li = $('<li class="slide-thumbnail"></li>');
        $panel.append($li);
        $li.append($svg);
        var s = new Snap($svg[0]);
        var background = s.rect(0, 0, 1280, 720);
        background.attr({ fill: m.background });

        for (var element of m.elements) {
            drawElement(s, element, refs);
        }

        $li.click(() => {
            console.log(1);
            render(m, refs);
            console.log(2);
        });
    }
}

exports.render = render;
exports.renderThumbnails = renderThumbnails;