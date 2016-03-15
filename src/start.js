"use strict";

if (!$) {
    var $ = require('../lib/jquery.js');
}
var model = require('../src/elements.js');

function updateLayout() {
    var $outterElement = $("#main");
    var $container = $("#board-container");
    $container.stop();
    $container.animate({
        width: $outterElement.width(),
        height: $outterElement.height()
    }, 200);
}

window.onresize = function () {
    updateLayout();
};

$(document).ready(function () {
    updateLayout();

    var win = nw.Window.get();
    //win.showDevTools();
    load('E:/Code/enbx/Slides/Slide_0.xml')
});

function load(file) {
    var fs = require('fs');
    fs.readFile(file, function (err, data) {
        parseSlide(data);
    });
}

function parseSlide(slideXmlString) {
    var parser = new DOMParser();
    var xmlDom = parser.parseFromString(slideXmlString, "text/xml");
    var slide = xmlDom.documentElement;
    var elements = slide.getElementsByTagName("Elements")[0].childNodes;
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].nodeType !== 1)
            continue;

        parseElement(elements[i]);
    }
}

function parseElement(element) {
    var table = {
        Text: parseText,
        Shape: parseShape
    };
    table[element.tagName](element);
}

function parseText(element) {
    var xml2js = require("xml2js");
    xml2js.parseString(element.outerHTML, function (err, result) {
        var data = result.Text;
        var model = {
            x: parseFloat(data.X[0]),
            y: parseFloat(data.Y[0]),
            width: parseFloat(data.Width[0]),
            height: parseFloat(data.Height[0]),
        }
        var richTextModel = data.RichText[0];
        model.text = richTextModel.Text[0];
        model.textLines = [];
        var textLineModels = richTextModel.TextLines[0].TextLine;
        for (var i = 0; i < textLineModels.length; i++) {
            var textLine = {textRuns: []};
            model.textLines.push(textLine);
            var textRunModels = textLineModels[i].TextRuns[0].TextRun;
            for (var j = 0; j < textRunModels.length; j++) {
                var textRunModel = textRunModels[j];
                var textRun = {
                    text: textRunModel.Text[0],
                    foneSize: textRunModel.FontSize[0],
                    foneFamily: textRunModel.FontFamily[0],
                    background: color(textRunModel.Background[0]),
                    foreground: color(textRunModel.Foreground[0]),
                };
                textLine.textRuns.push(textRun);
            }
        }
        console.log(model);
    });
}

function parseShape(element) {
    var xml2js = require("xml2js");
    xml2js.parseString(element.outerHTML, function (err, result) {
        var data = result.Shape;
        var model = {
            x: parseFloat(data.X[0]),
            y: parseFloat(data.Y[0]),
            width: parseFloat(data.Width[0]),
            height: parseFloat(data.Height[0]),
            background: color(data.Background[0]),
            foreground: color(data.Foreground[0]),
            thickness: parseFloat(data.Thickness[0]),
        };
        var s = Snap("#board");
        var rect = s.rect(model.x, model.y, model.width, model.height);
        rect.attr({
            fill: model.background.substr(3),
            stroke: model.foreground.substr(3),
            strokeWidth: model.thickness
        });
    });
}

function color(element){
    return element.ColorBrush[0].substr(3);
}
