
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
  spinner.start();
  llFromString(from, function (fll) {
    llFromString(to, function (tll) {
      $('.from-display-value').html(fll.address + ', ' + fll.city + ', ' + fll.state);
      $('.to-display-value').html(tll.address + ', ' + tll.city + ', ' + tll.state);

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
    geocode(s, function(err, res) {
      if (err) return window.alert(err);
      fn(res);
    });
  } else {
    var sll = s.split(',');
    geocode.reverse({
      lat: parseFloat(sll[0]),
      lon: parseFloat(sll[1])
    }, function (err, res) {
      if (err) return window.alert(err);
      fn(res);
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

fromMarker.on('dragend', function() {
  inputFromMarker($from, fromMarker.getLatLng());
});

toMarker.on('dragend', function() {
  inputFromMarker($to, toMarker.getLatLng());
});

/**
 * On from address change, set the map markers
 */

$from.on('change', function () {
  markerFromInput(fromMarker, $from.val());
});

$to.on('change', function () {
  markerFromInput(toMarker, $to.val());
});

/**
 * Update the markers based on the input
 */

function markerFromInput(marker, loc) {
  if (stringIsLL(loc)) {
    var ll = loc.split(',');
    return marker.setLatLng([parseFloat(ll[0]), parseFloat(ll[1])]);
  }
  geocode(loc, function (err, val) {
    if (err) return console.log(err);
    marker.setLatLng(val);
  });
}

/**
 * Input from marker
 */

function inputFromMarker(input, ll) {
  geocode.reverse(ll, function (err, data) {
    if (err) return console.log(err);
    input.val(data.address + ', ' + data.city + ', ' + data.state);
  });
}

/**
 * On load
 */

$(function () {
  var results = querystring.parse(window.location.hash.split('?')[1]);
  if (results && results.from && results.to) {
    $from.val(results.from);
    markerFromInput(fromMarker, results.from);

    $to.val(results.to);
    markerFromInput(toMarker, results.to);

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
        fromMarker.setLatLng([ c.latitude, c.longitude ]);
        inputFromMarker($from, fromMarker.getLatLng());
      } else {
        toMarker.setLatLng([ c.latitude, c.longitude ]);
        inputFromMarker($to, toMarker.getLatLng());
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
