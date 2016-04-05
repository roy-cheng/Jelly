'use strict';

function $getVisual(element) {
  return $('#board #' + element.id);
}

function getVisual(element) {
  return $('#board #' + element.id)[0];
}

function getElementByAnimationId(id, slide) {
  for (let element of slide.elements) {
    for (let animation of element.animations) {
      if (animation.id === id) {
        return [element, animation];
      }
    }
  }
}

function prepareElementAnimation(slide, element, animationIndex) {
  let $visual = $getVisual(element);
  if ($visual[0]) {
    let animation = element.animations[animationIndex];
    if (animation.type === 'TranslateIn') {
      switch (animation.orientation) {
        case 'RightToLeft':
          var logicalOriginX = slide.width;
          var logicalOriginY = element.y;
          break;
        case 'LeftToRight':
          var logicalOriginX = 0 - element.width;
          var logicalOriginY = element.y;
          break;
        case 'TopToBottom':
          var logicalOriginX = element.x;
          var logicalOriginY = 0 - element.height;
          break;
        case 'BottomToTop':
          var logicalOriginX = element.x;
          var logicalOriginY = element.height;
          break;
      }

      var visualOriginX = $visual.attr('x') - (element.x - logicalOriginX);
      var visualOriginY = $visual.attr('y') - (element.y - logicalOriginY);

      if (!element.extensions) {
        element.extensions = {};
      }
      element.extensions.animationInfo = {
        x: $visual.attr('x'),
        y: $visual.attr('y')
      };
      $visual.attr({ x: visualOriginX, y: visualOriginY });
    }
  }
}

function playElementAnimation(slide, element, animationIndex) {
  let $visual = $getVisual(element);
  if ($visual[0]) {
    let animation = element.animations[animationIndex];
    if (animation.type === 'TranslateIn') {
      $visual.stop().animate({
        x: element.extensions.animationInfo.x,
        y: element.extensions.animationInfo.y
      }, 400, () => {
        $visual.css("x", "");
        $visual.css("y", "");
        $visual.attr({ x: element.extensions.animationInfo.x, y: element.extensions.animationInfo.y });
      });
      return true;
    }
  }
  return false;
}

function prepare(slide) {
  for (let element of slide.elements) {
    if (element.animations) {
      for (let i = 0; i < element.animations.length; i++) {
        prepareElementAnimation(slide, element, i);
      }
    }
  }
}

function play(slide, animationIndex) {
  if(!slide.animationOrders){
    return false;
  }
  var aid = slide.animationOrders[animationIndex];
  var result = getElementByAnimationId(aid, slide);
  var element = result[0];
  var animation = result[1];
  var aindex = element.animations.indexOf(animation);
  while (animationIndex <= slide.animationOrders.length) {
    var isValidAnimation = playElementAnimation(slide, element, aindex);
    if (isValidAnimation) {
      return true;
    }
    else {
      animationIndex++;
    }
  }
  return false;
}

function reset(slide) {
  if(!slide.animationOrders){
    return;
  }
  for (let aid of slide.animationOrders) {
    let result = getElementByAnimationId(aid, slide);
    let element = result[0];
    let animation = result[1];
    if (animation.type === 'TranslateIn') {
      let $visual = $('#board #' + element.id);
      $visual.css("x", "");
      $visual.css("y", "");
      if (element.extensions && element.extensions.animationInfo) {
        $visual.attr({ x: element.extensions.animationInfo.x, y: element.extensions.animationInfo.y });
      }
    }
  }
}

function getValidAnimations(slide) {
  if(!slide.animationOrders){
    return [];
  }
  return slide.animationOrders.filter(id => getElementByAnimationId(id, slide)[1].type === 'TranslateIn');
}

$(document).ready(function() {
  $('html').keydown(function(event) {
    if (event.keyCode === 117) {
      var s = app.getState();
      prepare(s.file.slides[s.navigation.activeIndex]);
    }
    if (event.keyCode === 118) {
      var s = app.getState();
      var slide = s.file.slides[s.navigation.activeIndex];
      play(slide, 0);
    }
  });
});

app.subscribe(() => {
  var navi = app.getState().navigation;
  var board = app.getState().file;
  if (!navi || !board || !board.slides) {
    return;
  }
  var slide = board.slides[navi.activeIndex];
  if (navi.justNavigated) {
    prepare(slide);
  }
  if (navi.goingToNextAnimation) {
    var aid = getValidAnimations(slide)[navi.animationIndex - 1];
    if (aid) {
      var index = slide.animationOrders.indexOf(aid);
      play(slide, index);
    }
    else {
      app.thenDispatch(actions.nextSlide(true))
    }
  }
  if (navi.goingToDisplayView) {
    prepare(slide);
  }
  if (navi.goingToEditView) {
    for (var s of board.slides) {
      reset(s);
    }
  }
});

exports.play = play;
exports.prepare = prepare;
exports.reset = reset;