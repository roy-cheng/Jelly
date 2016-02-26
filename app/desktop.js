/*global $*/
"use strict";

const electron = require('remote');
var electronWindow = electron.getCurrentWindow();


function addDebugFeatures() {
  $('html').keydown(event => {
    // Alt+R
    if (event.keyCode === 82 && event.altKey) {
      location.reload();
    }
    // Alt+D
    if (event.keyCode === 68 && event.altKey) {
      var win = electron.getCurrentWindow();
      win.webContents.openDevTools();
    }
  });
}

function changeUI() {
  $('#system-buttons').show();
}

function initSystemButtons() {
  $('#system-close').click(() => {
    electronWindow.close();
  });

  $('#system-min').click(() => {
    electronWindow.minimize();
  });

  $('#system-max').click(() => {
    electronWindow.maximize();
  });

  $('#system-restore').click(() => {
    electronWindow.restore();
  });

  electronWindow.on('maximize', () => {
    $('#system-max').hide();
    $('#system-restore').show();
  });

  electronWindow.on('unmaximize', () => {
    $('#system-max').show();
    $('#system-restore').hide();
  });
}

function addDesktopFeatures() {
  $(document).ready(function() {
    addDebugFeatures();
    initSystemButtons();
    changeUI();
  });
}

exports.addDesktopFeatures = addDesktopFeatures;