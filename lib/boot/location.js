
/**
 * Dependencies
 */

var config = window.CONFIG;
var Emitter = require('emitter');
var geocode = require('./geocode');
var jsonp = require('jsonp');
var querystring = require('querystring');
var spinner = require('component-spinner');

/**
 * Expose an emitter instance
 */

var emitter = module.exports = new Emitter();

/**
 * Expose `changeLocations`
 *
 * @param {String} from
 * @param {String} to
 */

var changeLocations = module.exports.changeLocations = function(from, to) {
  $('.from-display-value').html(from);
  $('.to-display-value').html(to);

  spinner.start();
  llFromString(from, function (fll) {
    llFromString(to, function (tll) {
      jsonp(config.OTP_API_URL + '?from=' + fll.lat + ',' + fll.lon + '&to=' + tll.lat + ',' + tll.lon, function(err, data) {
        if (err) {
          window.alert(err);
        } else {
          emitter.emit('change', data);
          spinner.stop();
        }
      });
    });
  });
};

/**
 * Form
 */

var $from = $('input[name="from-address"]');
var $to = $('input[name="to-address"]');

/**
 * Set the location
 */

$('a.set-location').on('click', function(event) {
  event.preventDefault();

  var from = $from.val();
  var to = $to.val();

  window.history.pushState({}, null, '/#results?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to));

  changeLocations(from, to);
});

/**
 * Get a lat / lon from a string
 */

function llFromString(s, fn) {
  if (!stringIsLL(s)) {
    geocode(s, function(err, from) {
      if (err) return window.alert(err);
      fn(from);
    });
  } else {
    var sll = s.split(',');
    fn({
      lat: parseFloat(sll[0]),
      lon: parseFloat(sll[1])
    });
  }
}

/**
 * String is ll
 */

function stringIsLL(s) {
  var sll = s.split(',');
  return !isNaN(parseFloat(sll[0])) && !isNaN(parseFloat(sll[1]));
}

/**
 * Map
 */

var map = loadMap();

/**
 * Create Markers
 */

var fromMarker = L.marker(config.FROM_LL, {
  draggable: true
})
  .addTo(map)
  .bindPopup('From');
var toMarker = L.marker(config.TO_LL, {
  draggable: true
})
  .addTo(map)
  .bindPopup('To');

/**
 * Listen to drag events
 */

fromMarker.on('drag', function() {
  var ll = fromMarker.getLatLng();
  $from.val(ll.lat + ', ' + ll.lng);
});

toMarker.on('drag', function() {
  var ll = toMarker.getLatLng();
  $to.val(ll.lat + ', ' + ll.lng);
});

/**
 * On from address change, set the map markers
 */

$from.on('change', function () {
  updateMarkerFromInput(fromMarker, $from);
});

$to.on('change', function () {
  updateMarkerFromInput(toMarker, $to);
});

/**
 * Update the markers based on the input
 */

function updateMarkerFromInput(marker, input) {
  var loc = input.val();
  if (stringIsLL(loc)) {
    var ll = loc.split(',');
    return marker.setLatLng([parseFloat(ll[0]), parseFloat(ll[1])]);
  }
  geocode(loc, function (err, val) {
    if (!err) {
      marker.setLatLng(val);
    }
  });
}

/**
 * On load
 */

$(function () {
  var results = querystring.parse(window.location.hash.split('?')[1]);
  if (results && results.from && results.to) {
    $from.val(results.from);
    updateMarkerFromInput(fromMarker, $from);
    $to.val(results.to);
    updateMarkerFromInput(toMarker, $to);
    changeLocations(results.from, results.to);
  }
});

/**
 * Load Map
 */

function loadMap() {
  // Fill up the rest of the screen with the map
  $('#map').css('height', window.innerHeight - $('#location').height());

  // Create mapbox map
  var map = L.mapbox.map('map', config.MAPBOX_KEY, {
    touchZoom: false,
    scrollWheelZoom: false,
  }).setView([38.897692, -77.009525], 12);

  return map;
}

/**
 * Use the device location for a specific input
 */

window.useDeviceLocation = function (input) {
  if (navigator.geolocation) {
    spinner.start();
    navigator.geolocation.getCurrentPosition(function (position) {
      var c = position.coords;
      if (input === 'from-address') {
        $from.val(c.latitude + ', ' + c.longitude);
        fromMarker.setLatLng([ c.latitude, c.longitude ]);
      } else {
        $to.val(c.latitude + ', ' + c.longitude);
        toMarker.setLatLng([ c.latitude, c.longitude ]);
      }
      spinner.stop();
    }, showError);
  } else {
    window.alert('Geolocation not available for this device.');
  }
};

/**
 * Show Error
 */

function showError(error) {
  switch(error.code) {
  case error.PERMISSION_DENIED:
    window.alert('User denied the request for Geolocation.');
    break;
  case error.POSITION_UNAVAILABLE:
    window.alert('Location information is unavailable.');
    break;
  case error.TIMEOUT:
    window.alert('The request to get user location timed out.');
    break;
  case error.UNKNOWN_ERROR:
    window.alert('An unknown error occurred.');
    break;
  }
}
