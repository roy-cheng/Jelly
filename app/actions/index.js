'use strict';

const doc = require('../document');


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
        }
    });
    return { type: '~file/open/request', url };
}

exports.navigateTo = makeAction('~navigation/slide', 'index');

exports.listLocalFiles = () => {
    doc.listLocalFiles().then(localFiles => {
        return { type: '~file/listLocalFiles/complete', localFiles };
    }).catch(err => {
        console.error(err);
    });
    return { type: '~file/listLocalFiles/request' };
};
