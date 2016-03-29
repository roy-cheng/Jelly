'use strict';

(function() {
  let Snap = require('snapsvg');

  const supported = {

    picture: (m, paper) => {
      paper.image(m.source, m.x, m.y, m.width, m.height);
    },

    text: (m, paper) => {
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
        var text = paper.text(left, 0, textRunInnerStrings);
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
    },

    shape: (m, paper) => {
      var shape = null;
      switch (m.geometry) {
        case 'Rectangle':
          shape = paper.rect(m.x, m.y, m.width, m.height);
          break;
        case 'Circle':
          shape = paper.ellipse(m.x + m.width / 2, m.y + m.height / 2, m.width / 2, m.height / 2);
          break;
        default:
          console.warn('not supported shape: ' + m.geometry);
      }
      if (shape) {
        shape.attr({
          fill: m.background,
          stroke: m.foreground,
          strokeWidth: m.thickness
        });
      }
    }
  }
  
  class SlideRenderer {
    constructor(target, settings) {
      this.defaultTarget = target;
      this.settings = Object.assign(SlideRenderer.defaultSettings(), settings);
    }
    render(model, target) {
      let paper = new Snap(target || this.defaultTarget);
      paper.clear();
      let background = paper.rect(0, 0, this.settings.width, this.settings.height);
      background.attr({ fill: model.background || this.settings.background });
      for (var element of model.elements) {
        this.renderElement(element, paper, this.settings);
      }
      if (this.settings.showGrid) {
        this.drawGrid(paper);
      }
    }
    renderElement(model, paper) {
      let delegate = supported[model.type];
      // console.error(model._t   ypeName);
      if (delegate) {
        delegate(model, paper, this.settings);
      }
      else {
        console.warn('not supported: ' + model.type);
      }
    }
    static defaultSettings() {
      return { width: 1280, height: 720, background: 'white', showGrid: false }
    }
  }

  function drawGrid(s) {
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
exports.SlideRenderer = SlideRenderer;
})();