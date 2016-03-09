if(!$){
  var $ = require('../lib/jquery.js');
}

function updateLayout(){
      var outterElement = $("#main");
      var container = $("#board-container");      
      var height = outterElement.height();
      container.height(height);
}

window.onresize = function(event) {
  updateLayout();
};
$(document).ready(function() {
  updateLayout();
});