"use strict";

const $ = require('jquery');
$(document).ready(function() {
  $('html').keydown(function(event) {
    // Alt+R
    if (event.keyCode === 82 && event.altKey) {
      location.reload();
    }
  });
});

const app = require('./reducers');
const actions = require('./actions');

(function() {
  let view = require('./view');
  let path = require('path');

  app.path = function(s) {
    return path.join(__dirname, s);
  };

  view.onReady().then(() => {
    app.dispatch(actions.ready());
    app.thenDispatch(actions.open(app.path('local/1.enbx')));
    // app.thenDispatch(actions.listLocalFiles());
    // app.thenDispatch(actions.open('http://localhost:3000/api/file?name=DLL%20PROBING%201.enbx'));
    // app.thenDispatch(actions.listCloudFiles());
  });
})();