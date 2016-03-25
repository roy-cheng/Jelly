'use strict';

if (!$) {
  var $ = require('jquery');
}

var app = null;
(function() {
  let redux = require('redux');
  let createStore = redux.createStore;
  let combineReducers = redux.combineReducers;

  function change(state, obj) {
    return Object.assign({}, state, obj);
  }

  function application(state, action) {
    if (typeof state === 'undefined') {
      state = {
        ready: false,
        view: 'edit'
      };
    }

    for (var field in state) {
      if (field.match(/^going/) || field.match(/^just/)) {
        delete state[field];
      }
    }

    switch (action.type) {
      case '~ready':
        return change(state, { ready: true, justReady: true });
      case '~view/edit':
        return change(state, {
          view: 'edit',
          goingToEditView: state.view !== 'edit',
        });
      case '~view/display':
        return change(state, {
          view: 'display',
          goingToDisplayView: state.view !== 'display'
        });
    }
    return state;
  }

  function file(state, action) {
    if (typeof state === 'undefined') {
      state = {
        localRepository: '../src/document',
        document: null,
        isLoading: false
      };
    }

    for (var field in state) {
      if (field.match(/^going/) || field.match(/^just/)) {
        delete state[field];
      }
    }

    if (action.type.match(/^~file\/open/)) {
      return fileOpen(state, action);
    }
    else {
      switch (action.type) {
        case '~file/listLocal':
          return change(state, {
            isLoadingLocalList: true,
            goingListLocal: true,
          });
        case '~file/didListLocal':
          return change(state, {
            isLoadingLocalList: false,
            justListLocal: true,
            localFiles: action.localFiles
          });
      }
    }

    return change(state);
  }

  function fileOpen(state, action) {
    if (state.url !== action.url) {
      return change(state);
    }

    switch (action.type) {
      case '~file/open/request':
        return change(state, {
          goingOpen: true,
          isLoading: true,
          url: action.url
        });
      case '~file/open/board':
        let slides = new Array(action.board.slides.length);
        return change(state, {
          slides: slides,
          justUpdatedSlideCount: true,
          activeIndex: 0
        });
      case '~file/open/slide':
        state.slides[action.index] = action.slide;
        return change(state, {
          justUpdatedSlideIndex: action.index,
          justLoadedSlide: true
        });
      case '~file/open/complete':
        return change(state, {
          justOpened: true,
          isLoading: false,
          document: action.document
        });
      default:
        return change(state);
    }
  }

  const reducers = combineReducers({ application, file });
  const router = (state, action) => {
    console.log(action.type)
    return reducers(state, action);
  };

  app = createStore(router);
  app.thenDispatch = action => {
    setTimeout(() => { app.dispatch(action) }, 0);
  }

})();

app.subscribe(() => {
  var state = app.getState();
  if (state.application.justReady) {
    app.thenDispatch({ type: '~file/open/request', url: 'local/a.enbx' });
    app.thenDispatch({ type: '~file/listLocal' });
  }
});

require('../src/view');
require('../src/document');