
var qsa = require("./lib/qsa");
var debounce = require("./lib/debounce");
var Camera = require("savage-camera");
var savage = require("savage-query");
var d3 = require("d3");
var $ = require("jquery");
var rawData = "..//assets/sdot2015.csv";

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
    navbar.classList.add("sticky");
  } else {
    navbar.classList.remove("sticky");
  }
} 

window.addEventListener("scroll", stickyNav);
stickyNav();

window.addEventListener("scroll", debounce(onScroll, 100));
onScroll();

/*
    Funding bar chart code below. Can this be moved to it's own file?
*/

// Shareholder chart color palette:
const colours = [
  ['#FF4B40', '#F5A623', '#7ED321', '#9013FE', '#50E3C2', '#F8E71C', '#4A90E2', '#0053FD', '#578C6D', '#FF5151', '#411C1C'], // Asset class level
  ['#FF4B40', '#F5A623', '#7ED321', '#9013FE', '#50E3C2', '#F8E71C', '#4A90E2', '#0053FD', '#578C6D', '#FF5151', '#411C1C'], // Asset Level
  ['#20BC36', '#F5A623', '#F52323', '#B6E9F3', '#717171'], // Condition level
  ['#F9C364', '#FACF83', '#FBDBA2', '#FCE7C1', '#FDF3E0'], // gold
  ['#6A77EA', '#8792EE', '#A5ADF2', '#C3C8F6', '#E1E3FA'], // purple
  ['#ED8EEE', '#F0A4F1', '#F4BBF4', '#F7D1F8', '#FBE8FB'] // mauve
];

const maxLevels = 5;
var rawData
var json = require('../../data/data.json');
  //console.log(json); // this will show the info it in firebug console
  var rawData = json;

  //console.log(rawData)
  const chart = d3.select('#chart');
  const tooltip = d3.select('#tooltip');

  const { width } = chart.node().getBoundingClientRect(),
    height = width / 2 ;


  const makeRowJson = (curLevel, itemCount, startIndex, dataArray) => {
    let dataRow2 = [],
      x0 = 0;
    dataArray = dataArray || rawData;
    //console.log(dataArray);
    let jIndex = startIndex; 
    for (let ii = 0; ii < itemCount; ii++) {
      let asset = dataArray[jIndex];
      //console.log(asset);
      let val = asset['Replacement Value'];
      let item = {
        val,
        level: curLevel,
        color: colours[curLevel%colours.length][ii%colours[curLevel%colours.length].length],
        x0: x0,
        x1: x0 += val,
        name: asset['Asset'],
        inventory: asset['Inventory']
      };
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
      if(curLevel == 0) {
        jIndex += asset['Asset Number'] + 1;
      } else {
        jIndex++;
      }
      dataRow2.push(item);
    }
    return dataRow2;
  };

  let data2 = makeRowJson(0, 11, 0);

  //console.log(data2);

  let x = d3.scale.linear()
    .domain([0, d3.max(data2.map(d => d.x1))])
    .range([0, width]);

  const y = d3.scale.ordinal()
    .domain([0,1,2,3,4])
    .rangeRoundBands([0, height], 0.2);

  let svg = chart.append('svg')
    .attr('width', width)
    .attr('height', height * 2);


  const addRow = (d, x) => {
    if (!d.children) {
      return;
    }

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

    svg.selectAll('.row-title')
      .filter(dd => dd >= d.level)
      .transition()
      .attr('opacity', 0)
      .remove();

    svg.append("text")
      .datum(d.level)
      .attr('class', 'row-title')  
      .attr('transform', `translate(0,${ y(d.level + 1) * 2 - 10})`)
      .text(titleText);

    let row = svg.append('g')
      .datum(d.level)
      .attr('class', 'row');

    row.attr('opacity', 0)
      .attr('transform', `translate(0,${ y(d.level) || 0 })`)
      .transition()
      .duration(777)
      .attr('opacity', 1)
      .attr('transform', `translate(0,${ y(d.level + 1) * 2})`);

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
        if (d.level+2 < colours.length) {
          rect.filter(ddd => dd === ddd).attr('fill', colours[d.level+2][0]);
        }
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
          .text(`${dd.name}: $${dd.val}(M) 
          \r Inventory: ${dd.inventory}`);
        } 

      })
      .on('mouseout', () => {
        rect.attr('fill', dd => dd.color);
        tooltip.classed('visible', false);
      });

    rect.transition()
      .duration(777)
      .attr('width',  dd => d.x(dd.val))
      .attr('x',  dd => d.x(dd.x0));

    let legend = svg.append('g')
      .data(d.children)
      .attr('class', 'legend');
    
    legend.attr('transform', `translate(0,${ y(d.level) || 0 })`)
      .transition()
      .duration(777)
      .attr('opacity', 1)
      .attr('transform', `translate(0,${ y(d.level + 1) * 3})`);
    
    let box = legend.selectAll('box')
      .data(d.children)
      .enter()
      .append('box')
      .attr('fill', dd => dd.color)
      .attr('x',  x(d.x0 || 0))
      .attr('width',  '20')
      .attr('y', '20')
      .attr('height', '20');

    
  };

  addRow({
    children: data2,
    level: -1,
    x
  }, x);
