'use strict';

const change = require('./utils').change;

function reduce(state, action) {
  if (typeof state === 'undefined') {
    state = {
      view: 'edit'
    };
  }

  switch (action.type) {
    case '~file/open/board':
      return change(state, {
        activeIndex: 0,
        animationIndex: 0
      });
    case '~view/edit':
      return change(state, {
        view: 'edit',
        goingToEditView: state.view !== 'edit'
      });
    case '~view/display':
      return change(state, {
        view: 'display',
        goingToDisplayView: state.view !== 'display',
        animationIndex: 0
      });
    case '~navigation/slide':
      return change(state, {
        activeIndex: action.index,
        justNavigated: true
      });
    case '~navigation/prev':
      return change(state, {
        activeIndex: Math.max(state.activeIndex - 1, 0),
        justNavigated: true,
        animationIndex: 0
      });
    case '~navigation/next':
      if (state.view === 'edit' || action.force) {
        return change(state, {
          activeIndex: Math.min(state.activeIndex + 1, getSlidesCount() - 1),
          justNavigated: true,
          animationIndex: 0
        });
      }
      else if (state.view === 'display') {
        return change(state, {
          goingToNextAnimation: true,
          animationIndex: state.animationIndex + 1
        });
      }
      else {
        throw 'not supported: ' + source;
      }
  }
  return state;
}

function getSlidesCount() {
  return app.getState().file.slides.length;
}

module.exports = reduce;