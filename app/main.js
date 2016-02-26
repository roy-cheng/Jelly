"use strict";

const electronApi = require('remote');
const env = typeof electronApi.app === 'undefined' ? 'browser' : 'desktop';
const $ = require('jquery');

(() => {
  if (env === 'desktop') {
    let desktop = require('./desktop');
    desktop.addDesktopFeatures();
  }

  function updateLayout() {
    var workspace = $('#workspace');
    $('#board-container').stop().animate({
      width: workspace.width(),
      height: workspace.height()
    }, 120);

    var $thumbnails = $('#thumbnails');
    $('#thumbnails').height($thumbnails.parent().height());
  }

  $(document).ready(() => {
    updateLayout();
    window.onresize = function() {
      updateLayout();
    };
  });
})();