const app = require('./src/reducers');
const actions = require('./src/actions');

(function() {
    let view = require('./src/view');
    view.onReady().then(() => {
        app.dispatch(actions.ready());
        app.thenDispatch(actions.open('local/a.enbx'));
        app.thenDispatch(actions.listLocalFiles());
    });
})();