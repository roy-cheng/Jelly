'use strict';

const React = require('react-dom');
const ui = require('./ui');

function initEventListeners() {
  $('#file-list-button').click(() => {
    app.dispatch(actions.listCloudFiles())
    $('#file-list-panel').show();
  });
  $('#sync-button').click(() => {
    app.dispatch(actions.sync());
  });
  $('#content').click(() => {
    $('#file-list-panel').hide();
  });

  $('html').keydown(function(event) {
    // F5
    if (event.keyCode === 116) {
      app.dispatch(actions.displayView());
      maximize(true);
    }
    // Esc
    if (event.keyCode === 27) {
      app.dispatch(actions.editView());
      maximize(false);
    }
  });

  window.onresize = function() {
    updateLayout();
  };
}
function onReady() {
  var promise = new Promise((resolve, reject) => {
    $(document).ready(function() {
      initFileHolder();
      initEventListeners();
      updateLayout();
      resolve();
    });
  });
  return promise;
}

function initFileHolder() {
  var holder = document.body;
  holder.ondragover = function() {
    return false;
  };
  holder.ondragleave = holder.ondragend = function() {
    return false;
  };
  holder.ondrop = function(e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    app.dispatch(actions.open(file.path));
    return false;
  };
}

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

let SlideRenderer = require('./renderer').SlideRenderer;
let renderer = new SlideRenderer();

app.subscribe(() => {
  var board = app.getState().file;
  if (board.justUpdatedSlideCount) {
    createEmptyThumbnails(board.slides.length);
    $(`#thumbnails li:nth-child(${board.activeIndex + 1})`).addClass('active');
  }
  if (board.justLoadedSlide) {
    let index = board.justUpdatedSlideIndex;
    var slide = board.slides[index];
    let $svg = $(`#thumbnails li:nth-child(${index + 1}) svg`);
    renderer.render(slide, $svg[0]);

    if (index === board.activeIndex) {
      renderer.render(slide, '#board');
    }
  }
  if (board.justListLocal) {
    ui.renderFileList(board.localFiles);
  }
  if (board.justNavigatedl) {
    selectSlide(board.activeIndex);
    renderer.render(board.slides[board.activeIndex], '#board');
  }
});

var Snap = require('snapsvg');

function createEmptyThumbnails(count) {
  var $panel = $('#thumbnails ul');
  $('#thumbnails ul li').remove();
  for (let i = 0; i < count; i++) {
    var $svg = $('<svg viewBox="0 0 1280 720"></svg>');
    let $li = $('<li class="slide-thumbnail"></li>').hide();
    $panel.append($li);
    $li.append($svg);
    var s = new Snap($svg[0]);
    var background = s.rect(0, 0, 1280, 720);
    background.attr({ fill: 'white' });
    $li.fadeIn(650);

    $li.click(() => {
      app.dispatch(actions.navigateTo(i));
    });
  }
}

function selectSlide(index) {
  $('#thumbnails li').removeClass('active');
  $(`#thumbnails li:nth-child(${index + 1})`).addClass('active');
}

function drawSlide(slide, paper) {
  paper.clear();
  var background = paper.rect(0, 0, 1280, 720);
  background.attr({ fill: slide.background });

  for (var element of slide.elements) {
    drawElement(paper, element);
  }
}

exports.onReady = onReady;