var fs = require('fs'),
    xml2js = require('xml2js'),
    unzip = require('unzip'),
    Snap = require('snapsvg'),
    path = require('path');

var model = require('../src/model'),
    view = require('../src/view');

var unzipDir = '.test/test.enbx.unzip/';
function rel(p) {
    return path.resolve(unzipDir + p);
}

function open(file) {
    parseReference(refs=> {
        fs.createReadStream(file).pipe(unzip.Extract({path: unzipDir}).on('close', function () {
            fs.readFile(rel('Slides/Slide_0.xml'), function (err, data) {
                parseSlide(data, refs);
            });
        }));
    });
}

function parseSlide(slideXmlString, refs) {
    var parser = new DOMParser();
    var xmlDom = parser.parseFromString(slideXmlString, 'text/xml');
    var xmlSlide = xmlDom.documentElement;
    var slideModel = model.createModel(xmlSlide);
    view.render(slideModel, refs);
}


function parseText(element) {
    xml2js.parseString(element.outerHTML, function (err, result) {
        var data = result.Text;
        var m = {
            x: parseFloat(data.X[0]),
            y: parseFloat(data.Y[0]),
            width: parseFloat(data.Width[0]),
            height: parseFloat(data.Height[0]),
        }
        var richTextModel = data.RichText[0];
        m.text = richTextModel.Text[0];
        m.textLines = [];
        var textLineModels = richTextModel.TextLines[0].TextLine;
        for (var i = 0; i < textLineModels.length; i++) {
            var textLine = {textRuns: []};
            m.textLines.push(textLine);
            var textRunModels = textLineModels[i].TextRuns[0].TextRun;
            for (var j = 0; j < textRunModels.length; j++) {
                var textRunModel = textRunModels[j];
                var textRun = {
                    text: textRunModel.Text[0],
                    fontSize: textRunModel.FontSize[0],
                    fontFamily: textRunModel.FontFamily[0],
                    background: color(textRunModel.Background[0]),
                    foreground: color(textRunModel.Foreground[0]),
                };
                textLine.textRuns.push(textRun);
            }
        }
        var s = Snap('#board');
        for (var i = 0; i < m.textLines.length; i++) {
            var line = m.textLines[i];
            var texts = line.textRuns.map(function (x) {
                return x.text
            });
            var t = s.text(model.x, model.y, texts);
            for (var j = 0; j < line.textRuns.length; j++) {
                var run = line.textRuns[j];
                t.selectAll('tspan:nth-child(' + (j + 1) + ')').attr({
                    fill: run.foreground,
                    'font-size': run.fontSize,
                    'font-family': run.fontFamily
                });
            }
            var box = t.getBBox();
            t.attr({
                x: m.x + (model.x - box.x),
                y: m.y + (model.y - box.y)
            });
        }
    });
}

function parsePicture(element, refs) {
    xml2js.parseString(element.outerHTML, function (err, result) {
        var data = result.Picture;
        var m = {
            x: parseFloat(data.X[0]),
            y: parseFloat(data.Y[0]),
            width: parseFloat(data.Width[0]),
            height: parseFloat(data.Height[0]),
            pictureName: data.PictureName[0],
            source: rel(refs[data.Source[0].substr(5)]),
        };

        var s = Snap('#board');
        s.image(m.source, m.x, m.y, m.width, m.height);
    });
}

function parseReference(func) {
    fs.readFile('.test/test.enbx.unzip/Reference.xml', function (err, data) {
        xml2js.parseString(data, function (err, result) {
            var reference = result.Reference;
            if (typeof reference.Relationships != "undefined") {
                var relationships = reference.Relationships[0].Relationship;
                var refs = [];
                for (var i = 0; i < relationships.length; i++) {
                    var r = relationships[i];
                    refs[r.Id[0]] = r.Target[0];
                }
            }
            if (typeof func != "undefined") {
                var resolver = {
                    resolve: s=>{
                        return rel(refs[s.substr(5)])
                    }
                }
                func(resolver);
            }
        });
    });

}

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

function color(element) {
    return element.ColorBrush[0].substr(3);
}


exports.open = open;
