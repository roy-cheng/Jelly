if (!$) {
  var $ = require('../lib/jquery.js');
}
var model = require('../src/elements.js');

function updateLayout() {
  var outterElement = $("#main");
  var container = $("#board-container");
  container.stop();
  container.animate({
    width: outterElement.width(),
    height: outterElement.height()
  }, 200);
}

window.onresize = function (event) {
  updateLayout();
};

$(document).ready(function () {
  updateLayout();

  if (require) {
    load('E:/Code/enbx/Slides/Slide_0.xml')
  }
});

function load(file) {
  var fs = require('fs'),
    xml2js = require('xml2js');

  fs.readFile(file, function (err, data) {
    model.parseSlide(data);
  });
}

function parseSlide(slide) {
  var elements = slide.Elements[0];
  var shapes = elements.Shape;
  shapes.forEach(function(s) {
    parseShape(s);
  }, this);
}

function parseShape(shape){
  console.log(shape);
}
