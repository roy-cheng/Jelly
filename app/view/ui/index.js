const React = require('react');
const ReactDom = require('react-dom');
const FileList = require('./FileList');

exports.renderFileList = files => {
    ReactDom.render(
        React.createElement(FileList, null),
        document.getElementById('file-list-button') 
    );
}  