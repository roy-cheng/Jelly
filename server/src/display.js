let fetch = require('node-fetch');
let paint = require('./../core/paint');
let $ = require('jquery');
let renderer = new paint.SlideRenderer();

fetch('http://localhost:3000/api/board')
  .then(function(res) {
    return res.json();
  }).then(function(data) {
    renderer.render(data.slides[2], $('#board')[0]);
  });