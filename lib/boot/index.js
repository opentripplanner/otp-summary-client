/**
 * Dependencies
 */

var crossfilter = require('crossfilter').crossfilter;
var config = window.CONFIG;
var d3 = require('d3');
var loc = require('./location');
var Table = require('./table');
var Transitive = require('transitive');

/**
 * Max options
 */

var MAX_OPTIONS = 5;

/**
 * Transitive
 */

var transitive = new Transitive(document.getElementById('canvas'));

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
    return d.stats.avg;
  }),
  max: options.dimension(function(d) {
    return d.stats.max;
  }),
  min: options.dimension(function(d) {
    return d.stats.min;
  })
};

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
    Object.keys(dimensions.min.bottom(1)[0]));

  transitive.loadProfile({
    options: dimensions.min.bottom(MAX_OPTIONS)
  }, config.OTP_API_URL, function(data) {
    transitive.render();
  }, MAX_OPTIONS);

  window.sortBy(currentSort || 'min', true);
  window.animateTo('results');
});

/**
 * Sort by
 */

window.sortBy = function(dimension, bottom) {
  var d = dimensions[dimension];
  var data = d.bottom(MAX_OPTIONS * 2);

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
