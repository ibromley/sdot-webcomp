
var qsa = require("./lib/qsa");
var debounce = require("./lib/debounce");
var Camera = require("savage-camera");
var savage = require("savage-query");
var d3 = require("d3");
var $ = require("jquery");
var rawData = "..//assets/sdot2015.csv";
var CustomTooltip = function CustomTooltip(tooltipId, width){
	var tooltipId = tooltipId;
	$("body").append("<div class='tooltip' id='"+tooltipId+"'></div>");
	
	if(width){
		$("#"+tooltipId).css("width", width);
	}
	
	hideTooltip();
	
	function showTooltip(content, event){
		$("#"+tooltipId).html(content);
		$("#"+tooltipId).show();
		
		updatePosition(event);
	}
	
	function hideTooltip(){
		$("#"+tooltipId).hide();
	}
	
	function updatePosition(event){
		var ttid = "#"+tooltipId;
		var xOffset = 20;
		var yOffset = 10;
		
		 var ttw = $(ttid).width();
		 var tth = $(ttid).height();
		 var wscrY = $(window).scrollTop();
		 var wscrX = $(window).scrollLeft();
		 var curX = (document.all) ? event.clientX + wscrX : event.pageX;
		 var curY = (document.all) ? event.clientY + wscrY : event.pageY;
		 var ttleft = ((curX - wscrX + xOffset*2 + ttw) > $(window).width()) ? curX - ttw - xOffset*2 : curX + xOffset;
		 if (ttleft < wscrX + xOffset){
		 	ttleft = wscrX + xOffset;
		 } 
		 var tttop = ((curY - wscrY + yOffset*2 + tth) > $(window).height()) ? curY - tth - yOffset*2 : curY + yOffset;
		 if (tttop < wscrY + yOffset){
		 	tttop = curY + yOffset;
		 } 
		 $(ttid).css('top', tttop + 'px').css('left', ttleft + 'px');
	}
	
	return {
		showTooltip: showTooltip,
		hideTooltip: hideTooltip,
		updatePosition: updatePosition
	}
}

d3.csv(rawData, function(data) {
  custom_bubble_chart.init(data);
  custom_bubble_chart.toggle_view('all');
});

var custom_bubble_chart = (function(d3, CustomTooltip) {
  
  var width = 940,
      height = 600,
      tooltip = CustomTooltip("gates_tooltip", 240),
      layout_gravity = -0.01,
      damper = 0.1,
      nodes = [],
      vis, force, circles, radius_scale;

  var center = {x: width / 2, y: height / 2};

  var year_centers = {
      "2008": {x: width / 3, y: height / 2},
      "2009": {x: width / 2, y: height / 2},
      "2010": {x: 2 * width / 3, y: height / 2}
    };

  var fill_color;
  var max_rad = 0;

  function custom_chart(data) {
      var max_amount = d3.max(data, function(d) { 
        return parseInt(d.replacement_value, 10); 
       });
      radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 85]);

      //create node objects from original data
      //that will serve as the data behind each
      //bubble in the vis, then add each node
      //to nodes to be used later
      data.forEach(function(d){
          var node = {
              id: d.id,
              radius: radius_scale(parseInt(d.replacement_value, 10)),
              value: d.replacement_value,
              name: d.asset,
              asset_class: d.asset_class,
              confidence_group: d.data_confidence,
              inventory: d.inventory,
              x: Math.random() * 900,
              y: Math.random() * 800
          };

          if (node.radius > max_rad) {
              max_rad = node.radius;
          }

          nodes.push(node);
      });
      
      // Color for bubbles
      fill_color = d3.scale.linear()
          .domain([0, 3, 8, 20, 50, 100, 4106, 4692, 6000])
          .range(['#fff7fb','#ece7f2','#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#045a8d','#023858']);
    
      nodes.sort(function(a, b) {return b.value- a.value; });

      vis = d3.select("#vis").append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .attr("id", "svg_vis");
  
      circles = vis.selectAll("circle")
                  .data(nodes, function(d) { return d.id ;});
  
      circles.enter().append("circle")
          .attr("r", 0)
          .attr("fill", function(d) { return fill_color(d.value) ;})
          .attr("stroke-width", 2)
          .attr("stroke", function(d) {return d3.rgb(fill_color(d.value)).darker();})
          .attr("id", function(d) { return  "bubble_" + d.id; })
          .on("mouseover", function(d, i) {show_details(d, i, this);} )
          .on("mouseout", function(d, i) {hide_details(d, i, this);} );
      circles.transition().duration(2000).attr("r", function(d) { return d.radius; });

  }

  function charge(d) {
    return -Math.pow(d.radius, 2.0) / 8;
  }

  function start() {
    force = d3.layout.force()
            .nodes(nodes)
            .size([width, height]);
  }

  function display_group_all() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
         .on("tick", function(e) {
            circles.each(move_towards_center(e.alpha))
                   .attr("cx", function(d) {return d.x;})
                   .attr("cy", function(d) {return d.y;});
         });
    force.start();
    hide_years();
  }

  function move_towards_center(alpha) {
    return function(d) {
      d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
      d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
    };
  }

  function display_by_year() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_year(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
        });
    force.start();
    display_years();
  }

  function move_towards_year(alpha) {
    return function(d) {
      var target = year_centers[d.year];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }


  function display_years() {
      var years_x = {"2008": 160, "2009": width / 2, "2010": width - 160};
      var years_data = d3.keys(years_x);
      var years = vis.selectAll(".years")
                 .data(years_data);

      years.enter().append("text")
                   .attr("class", "years")
                   .attr("x", function(d) { return years_x[d]; }  )
                   .attr("y", 40)
                   .attr("text-anchor", "middle")
                   .text(function(d) { return d;});

  }

  function hide_years() {
      var years = vis.selectAll(".years").remove();
  }

  // Pop up event

  function show_details(data, i, element) {
    d3.select(element).attr("stroke", "black");
    var content = "<span class=\"name\">Asset Name:</span><span class=\"value\"> " + data.name + "</span><br/>";
    content +="<span class=\"name\">Replacement Value:</span><span class=\"value\"> $" + addCommas(data.value) + "</span><br/>";
    content +="<span class=\"name\">Asset Class:</span><span class=\"value\"> " + data.asset_class + "</span>";
    tooltip.showTooltip(content, d3.event);
  }

  function hide_details(data, i, element) {
    d3.select(element).attr("stroke", function(d) { return d3.rgb(fill_color(d.value)).darker();} );
    tooltip.hideTooltip();
  }

  var my_mod = {};
  my_mod.init = function (_data) {
    custom_chart(_data);
    start();
  };

  my_mod.display_all = display_group_all;
  my_mod.display_year = display_by_year;
  my_mod.toggle_view = function(view_type) {
    if (view_type == 'year') {
      display_by_year();
    } else {
      display_group_all();
      }
    };

  return my_mod;
})(d3, CustomTooltip);

var keyStage = document.querySelector(".scroll-content");
var map = document.querySelector(".backdrop svg");
var camera = new Camera(map);
var stages = qsa(".layer").reverse();
var current = null;
var existing = document.querySelector("#Existing");

var onScroll = function() {
  var scrollBounds = keyStage.getBoundingClientRect();
  for (var i = 0; i < stages.length; i++) {
    var stage = stages[i];
    var bounds = stage.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) {
      var layerID = stage.getAttribute("data-layer");
      if (layerID == current) return;
      var layer = document.querySelector("#" + layerID);
      if (!layer) return;
      if (layerID != "Existing") {
        savage(map).addClass("zoomed");
      } else {
        savage(map).removeClass("zoomed");
      }
      var active = document.querySelector(".activated");
      if (active) savage(active).removeClass("activated");
      savage(layer).addClass("activated");
      current = layerID;
      camera.zoomTo(layer, window.innerWidth > 1000 ? 100 : 50, 700);
      return;
    }
  }
}

var navbar = document.getElementById("nav");
var sticky = navbar.offsetTop;

var stickyNav = function() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
} 

window.addEventListener("scroll", stickyNav);
stickyNav();

window.addEventListener("scroll", debounce(onScroll, 100));
onScroll();