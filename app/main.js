const app = require('./reducers');
const actions = require('./actions');
const $ = require('jquery');

(function() {
    let view = require('./view');
    view.onReady().then(() => {
        app.dispatch(actions.ready());
        app.thenDispatch(actions.open('../local/a.enbx'));
        app.thenDispatch(actions.listLocalFiles());
    });
})();