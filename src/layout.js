if(!$){
  var $ = require('./lib/jquery.js');
}
function update(){
  var margin = 80;
  
  var outter = $("body");
  var container = $("#container");
  var height = outter.height();

  container.css('height', height - margin * 2);
  container.css('margin-top', margin);
  console.log(height)
}