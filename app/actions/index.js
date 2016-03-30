'use strict';

const doc = require('../document');
const path = require('path');

function makeAction(type, ...argNames) {
    return function(...args) {
        let action = { type };
        argNames.forEach((arg, index) => {
            action[argNames[index]] = args[index]
        })
        return action;
    }
}

exports.ready = makeAction('~ready');

exports.displayView = makeAction('~view/display');
exports.editView = makeAction('~view/edit');

exports.open = url => {
    doc.load(url, {
        onBoardReady: board => {
            app.dispatch({ type: '~file/open/board', board, url });
        },
        onSlideReady: (slide, index) => {
            app.dispatch({ type: '~file/open/slide', slide, index, url });
        },
        unzip: path.join(app.path('.temp'), Date.now().toString())
    });
    return { type: '~file/open/request', url };
}

exports.navigateTo = makeAction('~navigation/slide', 'index');

exports.listLocalFiles = () => {
    doc.listLocalFiles().then(files => {
        app.dispatch({ type: '~file/listFiles/complete', files, from: 'local' });
    }).catch(err => {
        console.error(err);
    });
    return { type: '~file/listFiles/request' };
};

exports.listCloudFiles = () => {
    doc.listCloudFiles().then(files => {
        app.dispatch({ type: '~file/listFiles/complete', files, from: 'cloud' });
    }).catch(err => {
        console.error(err);
    });
    return { type: '~file/listFiles/request' };
};

exports.sync = () => {
  let file = app.getState().file;
  if(file.source === 'local'){
    doc.upload(file.url).then(()=>{
    app.dispatch({ type: '~file/upload/complete' });
    });
  }
  else if(file.source === 'cloud'){
    app.dispatch(actions.open(file.url));
  }
  else{
    throw 'not supported: ' + source;
  }
  return { type: '~file/upload/request' };
};
