"use strict";

const app = require('./reducers');
const actions = require('./actions');
const $ = require('jquery');

(function() {
  let view = require('./view');
  let path = require('path');
  
  app.path = function(s) {
    return path.join(__dirname, s);
  };

  view.onReady().then(() => {
    app.dispatch(actions.ready());
    // app.thenDispatch(actions.open(app.path('local/a.enbx')));
    app.thenDispatch(actions.open('http://localhost:3000/api/file?name=DLL%20PROBING%201.enbx'));
    // app.thenDispatch(actions.listLocalFiles());
    app.thenDispatch(actions.listCloudFiles());
  });
})();