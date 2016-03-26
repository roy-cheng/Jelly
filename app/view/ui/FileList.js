const React = require('react');

module.exports = React.createClass({displayName: "exports",
  render: function() {
    return React.createElement("div", null, "Hello ", this.props.name);
  }
});