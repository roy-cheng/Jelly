const React = require('react');
const ReactDom = require('react-dom');
const FileList = require('./FileList');

exports.renderFileList = files => {
    ReactDom.render(
        <FileList />,
        document.getElementById('file-list-button') 
    );
}  