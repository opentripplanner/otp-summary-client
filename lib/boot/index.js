/**
 * Dependencies
 */

var crossfilter = require('crossfilter').crossfilter;
var config = window.CONFIG;
var d3 = require('d3');
var loc = require('./location');
var Table = require('./table');

/**
 * Options
 */

var options = crossfilter();

/**
 * Dimensions
 */

var dimensions = window.dimensions = {
  segments: options.dimension(function(d) {
    return d.segments.length;
  }),
  average: options.dimension(function(d) {
    return d.stats.avg + d.segments.reduce(function(m, s) {
      return m + s.walkTime;
    }, 0) + d.finalWalkTime;
  }),
  max: options.dimension(function(d) {
    return d.stats.max;
  })
};

/**
 * Filter out routes with average trip times of < 0
 */

dimensions.average.filter(function(d) {
  return d > 0;
});

/**
 * Currently sorted by...
 */

var currentSort;

/**
 * Table
 */

var table = null;

/**
 * Display data
 */

loc.on('change', function(data) {
  if (data.options.length < 1) return window.alert('No routes found.');

  $('#results').css('display', 'block');

  options.remove();
  options.add(data.options);

  if (!table) table = new Table(document.querySelector('.data'),
    Object.keys(dimensions.average.top(1)[0]));

  window.sortBy(currentSort || 'average', true);
  window.animateTo('results');
});

/**
 * Sort by
 */

window.sortBy = function(dimension, bottom) {
  var d = dimensions[dimension];
  var data = d.top(100);

  if (!bottom && currentSort === dimension) {
    currentSort = null;
  } else {
    data = d.bottom(100);
    currentSort = dimension;
  }

  table.render(data);
  $('.routes-count').html(data.length);
};

/**
 * Animate a scroll to a link
 */

window.animateTo = function(id) {
  $('html, body').animate({
    scrollTop: $('#' + id).offset().top - 50
  }, 500);
};
