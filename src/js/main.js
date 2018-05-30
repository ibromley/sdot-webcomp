
var qsa = require("./lib/qsa");
var debounce = require("./lib/debounce");
var Camera = require("savage-camera");
var savage = require("savage-query");
var d3 = require("d3");
var $ = require("jquery");

var keyStage = document.querySelector(".scroll-content");
var map = document.querySelector(".backdrop svg");
var camera = new Camera(map);
var stages = qsa(".layer").reverse();
var current = null;
var existing = document.querySelector("#Existing");

/* 
  Determines the 'stage' we should be on based on how far we've scrolled.
  on the page. This determines which part of the svg will be 'zoomed'/'activated'.
*/
var onScroll = function() {
  var scrollBounds = keyStage.getBoundingClientRect();
  for (var i = 0; i < stages.length; i++) {
    var stage = stages[i];
    var bounds = stage.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) {
      
      /* 
          data-layer is set in the Google Sheet. It must match the 
          id of a g element in the background svg that will be 
          zoomed to when the stage is activated.
      */
      var layerID = stage.getAttribute("data-layer");
      if (layerID == current) return;
      var layer = document.querySelector("#" + layerID);
      if (!layer) return;
      if (layerID != "Existing") {
        savage(map).addClass("zoomed");
      } else {
        savage(map).removeClass("zoomed");
      }

      /* Remove currently active layer and replace it with the new one. */
      var active = document.querySelector(".activated");
      if (active) savage(active).removeClass("activated");
      savage(layer).addClass("activated");
      current = layerID;
      
      /* 
          Zoom the background image to the g element with id layer
          documentation: https://github.com/seattletimes/savage-camera
      */
      camera.zoomTo(layer, window.innerWidth > 1000 ? 100 : 50, 700);
      return;
    }
  }
}

/* 
  This bit of code is responsible for determining when to make the nav
  bar 'sticky' (absolute position) based on how far we've scrolled in
  the document.
*/
var navbar = document.getElementById("nav");
var sticky = navbar.offsetTop;

var stickyNav = function() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky");
  } else {
    navbar.classList.remove("sticky");
  }
} 

window.addEventListener("scroll", stickyNav);
stickyNav();

/* 
    onScroll listener for svg manipulation.
    This needs to come after the listener for the nav bar.
*/
window.addEventListener("scroll", debounce(onScroll, 100));
onScroll();

/*
    Funding bar chart code below. 
*/

// Hierarchical bar chart color palette:
// Asset class and class level arrays need 11 hex color codes.
const colours = [
  ['#add8e6', '#a1c2dd', '#96acd4', '#8997cb', '#7c82c2', '#6f6db9', '#6059b0', '#5144a7', '#3f309e', '#2a1b94', '#00008b'], // Asset class level
  ['#ffffe0', '#fff3b2', '#ffe589', '#f9d86d', '#f1cc54', '#e9c03f', '#dfb42f', '#d6a820', '#cc9d15', '#c2910d', '#b8860b'], // Asset Level
  ['#20BC36', '#F5A623', '#F52323', '#B6E9F3', '#717171'], // Condition level
  ['#F9C364', '#FACF83', '#FBDBA2', '#FCE7C1', '#FDF3E0'], // gold
  ['#6A77EA', '#8792EE', '#A5ADF2', '#C3C8F6', '#E1E3FA'], // purple
  ['#ED8EEE', '#F0A4F1', '#F4BBF4', '#F7D1F8', '#FBE8FB'] // mauve
];

// Set levels in bar chart
const maxLevels = 5;

// Load replacement value /  status & condition data
var rawData
var json = require('../../data/chart_data.sheet.json');

  var rawData = json;

  // d3 DOM selectors
  const chart = d3.select('#chart');
  const tooltip = d3.select('#tooltip');

  // set width and height for containing div
  const { width } = chart.node().getBoundingClientRect(),
    height = width / 2 ;


  // Formats sourced json into heirarchical json that can be fed into chart
  const makeRowJson = (curLevel, itemCount, startIndex, dataArray) => {
    let dataRow2 = [],
      x0 = 0;
    dataArray = dataArray || rawData;
    let jIndex = startIndex; 
    
    // Parse asset into item object
    // the replacement of value of the asset or asset class determines scaling of bar chart
    for (let ii = 0; ii < itemCount; ii++) {
      let asset = dataArray[jIndex];
      let val = asset['Replacement Value'];
      if (typeof val === 'string' || val instanceof String) {
        val = 0;  
      }
      let item = {
        val,
        level: curLevel,
        color: colours[curLevel%colours.length][ii%colours[curLevel%colours.length].length],
        x0: x0,
        x1: x0 += val,
        name: asset['Asset'],
        inventory: asset['Inventory']
      };

      // Bounce if on the condition level, if asset class level recurse to next level,
      // if asset level capture condition data and increment.
      if (curLevel != 2) {
        if (curLevel == 0) {
          item.children = makeRowJson(curLevel + 1, asset['Asset Number'], jIndex + 1);
        } else {
          item.children = makeRowJson(curLevel + 1, 4, 0, 
            [{
              Asset: 'Good',
              'Replacement Value': asset['Good'],
              Inventory: 'N/A',
            },
            {
              Asset: 'Fair',
              'Replacement Value': asset['Fair'],
              Inventory: 'N/A',
            },
            {
              Asset: 'Poor',
              'Replacement Value': asset['Poor'],
              Inventory: 'N/A',
            },
            {
              Asset: 'Unknown',
              'Replacement Value': asset['Unknown'],
              Inventory: 'N/A',
            }]);
        }    
        item.x = d3.scale.linear()
        .domain([0, d3.max(item.children.map(d => d.x1))])
        .range([0, width]);
      }
      // Incrementing depending on how many assets are in a given class
      if(curLevel == 0) {
        jIndex += asset['Asset Number'] + 1;
      } else {
        jIndex++;
      }
      dataRow2.push(item);
    }
    return dataRow2;
  };

  // Parse data
  let data2 = makeRowJson(0, 11, 0);

  // Create x scale
  let x = d3.scale.linear()
    .domain([0, d3.max(data2.map(d => d.x1))])
    .range([0, width]);

  // Create y scale
  const y = d3.scale.ordinal()
    .domain([0,1,2,3,4])
    .rangeRoundBands([0, height], 0.2);

  // Create and append svg to the DOM
  let svg = chart.append('svg')
    .attr('width', width)
    .attr('height', height);

  // Function to render row
  const addRow = (d, x) => {
    if (!d.children) {
      return;
    }

    // Title text depending on what level of data in row
    var titleText = "";

    if (d.level == 0) {
      titleText = d.name;
    }
    if (d.level == 1) {
      titleText = "Asset Condition"
    }
    // Remove existing rows
    svg.selectAll('.row')
      .filter(dd => dd >= d.level)
      .transition()
      .attr('opacity', 0)
      .remove();
    
    // Remove existing titles and text
    svg.selectAll('.row-title')
      .filter(dd => dd >= d.level)
      .transition()
      .attr('opacity', 0)
      .remove();

    // Append row title text
    svg.append("text")
      .datum(d.level)
      .attr('class', 'row-title')  
      .attr('transform', `translate(0,${ y(d.level + 1) * 2 - 10})`)
      .text(titleText);

    // Create and append row
    let row = svg.append('g')
      .datum(d.level)
      .attr('class', 'row');

    // Transition animation attributes
    row.attr('opacity', 0)
      .attr('transform', `translate(0,${ y(d.level) || 0 })`)
      .transition()
      .duration(777)
      .attr('opacity', 1)
      .attr('transform', `translate(0,${ y(d.level + 1) * 2})`);

    // Define attributes and action recievers for each rectangle in a chart row
    let rect = row.selectAll('rect')
      .data(d.children)
      .enter()
      .append('rect')
      .attr('fill', dd => dd.color)
      .attr('x',  x(d.x0 || 0))
      .attr('width',  x(d.val || 0))
      .attr('y', 0)
      .attr('height', y.rangeBand())
      .on('click', dd => addRow(dd, d.x))
      .on('mouseover', (dd) => {

        // Highlight color
        if (d.level+2 < colours.length) {
          rect.filter(ddd => dd === ddd).attr('fill', colours[d.level+2][0]);
        }
        // Tooltip size and text
        var toolText
        if (dd.level == 2) {
          tooltip.classed('visible', true)
          .style({
            top: `${y(d.level + 1) * 2}px`,
            left: `${d.x(dd.x0) + d.x(dd.val) / 2}px`
          })
          .text(`${dd.name} : ${dd.val * 100}%`);
        } else {
          tooltip.classed('visible', true)
          .style({
            top: `${y(d.level + 1) * 2}px`,
            left: `${d.x(dd.x0) + d.x(dd.val) / 2}px`
          })
          .text(`${dd.name}: $${dd.val}(M) \r Inventory: ${dd.inventory}`);
        } 

      })
      .on('mouseout', () => {
        rect.attr('fill', dd => dd.color);
        tooltip.classed('visible', false);
      });
    
    // Set rectangle width
    rect.transition()
      .duration(777)
      .attr('width',  dd => d.x(dd.val))
      .attr('x',  dd => d.x(dd.x0));
    
  };

  // Create and append chart using parsed data
  addRow({
    children: data2,
    level: -1,
    x
  }, x);
