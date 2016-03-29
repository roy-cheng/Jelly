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
    app.thenDispatch(actions.open(app.path('local/a.enbx')));
    app.thenDispatch(actions.listLocalFiles());
  });
})();