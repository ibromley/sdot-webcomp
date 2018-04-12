
var $ = require("./lib/qsa");
var debounce = require("./lib/debounce");
var Camera = require("savage-camera");
var savage = require("savage-query");

var keyStage = document.querySelector(".scroll-content");
var map = document.querySelector(".backdrop svg");
var camera = new Camera(map);
var stages = $(".layer").reverse();
console.log(stages);
var current = null;
var existing = document.querySelector("#Existing");

var onScroll = function() {
  var scrollBounds = keyStage.getBoundingClientRect();
  for (var i = 0; i < stages.length; i++) {
    var stage = stages[i];
    var bounds = stage.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) {
      var layerID = stage.getAttribute("data-layer");
      console.log(layerID);
      if (layerID == current) {
        console.log('layerID == current, returning....');
        return;
      }
      var layer = document.querySelector("#" + layerID);
      if (!layer) {
        console.log("couldn't find a layer with layerID: " + layerID);
        return;
      }
      if (layerID != "Existing") {
        savage(map).addClass("zoomed");
      } else {
        savage(map).removeClass("zoomed");
      }
      var active = document.querySelector(".activated");
      if (active) savage(active).removeClass("activated");
      savage(layer).addClass("activated");
      current = layerID;
      console.log(current);
      camera.zoomTo(layer, window.innerWidth > 1000 ? 100 : 50, 500);
      console.log(layer.attributes);
      return;
    }
  }
}

window.addEventListener("scroll", debounce(onScroll, 100));
onScroll();