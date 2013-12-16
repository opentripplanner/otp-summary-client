/**
 * Dependencies
 */

var crossfilter = require('crossfilter').crossfilter;
var config = require('./config');
var d3 = require('d3');
var jsonp = require('jsonp');
var resizable = require('resizable');
var superagent = require('superagent');
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
    return d.stats.avg;
  }),
  max: options.dimension(function(d) {
    return d.stats.max;
  })
};

/**
 * Filter out routes with average trip times of < 0
 */

dimensions.average.filter(function (d) {
  return d > 0;
});

/**
 * Table
 */

var table = null;

/**
 * Initialize
 */

var map = loadMap();

/**
 * Inputs
 */

var $flat = $('input[name="from-lat"]');
var $flng = $('input[name="from-lng"]');
var $tlat = $('input[name="to-lat"]');
var $tlng = $('input[name="to-lng"]');

/**
 * Create Markers
 */

var from = L.marker(config.FROM_LL, {
  draggable: true
})
  .addTo(map)
  .bindPopup('From');
var to = L.marker(config.TO_LL, {
  draggable: true
})
  .addTo(map)
  .bindPopup('To');

/**
 * Listen to drag events
 */

from.on('drag', function() {
  updateInputs(from.getLatLng(), to.getLatLng());
});
from.on('dragend', function() {
  markersChange(from, to);
});
to.on('drag', function() {
  updateInputs(from.getLatLng(), to.getLatLng());
});
to.on('dragend', function() {
  markersChange(from, to);
});

/**
 * Process initial latm lng
 */

markersChange(from, to);

/**
 * On change
 */

$('form').on('submit', function(event) {
  event.preventDefault();
  from.setLatLng([$flat.val(), $flng.val()]);
  to.setLatLng([$tlat.val(), $tlng.val()]);
  getData(from.getLatLng(), to.getLatLng(), updateData);
});

/**
 * Display data
 */

function updateData(data) {
  options.remove();
  options.add(data.options);

  if (!table) table = new Table(document.querySelector('.data'),
    Object.keys(dimensions.segments.top(1)[0]));

  var d = dimensions.segments.bottom(Infinity);
  $('.routes-count').html(d.length);

  table.render(d);
}

/**
 * Sort by
 */

var currentSort = 'segments';
window.sortBy = function(dimension) {
  if (currentSort === dimension) {
    table.render(dimensions[dimension].top(Infinity));
    currentSort = null;
  } else {
    table.render(dimensions[dimension].bottom(Infinity));
    currentSort = dimension;
  }
};

/**
 * Load Map
 */

function loadMap() {
  // Create mapbox map
  var map = L.mapbox.map('map', config.MAPBOX_KEY, {
    touchZoom: false,
    scrollWheelZoom: false,
  }).setView([38.897692, -77.009525], 12);

  // Make the map resizable
  resizable(document.getElementById('map'), {
    handles: 's'
  }).build();

  return map;
}

/**
 * Get the data
 */

function getData(from, to, fn) {
  jsonp(config.OTP_API_URL + '?from=' + from.lat + ',' + from.lng + '&to=' + to
    .lat + ',' + to.lng, function(err, data) {
      if (err) {
        window.alert(err);
      } else {
        fn(data);
      }
    });
}

/**
 * Update inputs
 */

function updateInputs(f, t) {
  $flat.val(f.lat);
  $flng.val(f.lng);
  $tlat.val(t.lat);
  $tlng.val(t.lng);
}

/**
 * Process data
 */

function markersChange(from, to) {
  var f = from.getLatLng();
  var t = to.getLatLng();

  updateInputs(f, t);
  getData(f, t, updateData);
}
