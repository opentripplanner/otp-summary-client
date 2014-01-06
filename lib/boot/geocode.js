
/**
 * Geocode
 */

module.exports = function (address, callback) {
  if (!address || address.length < 1) {
    callback('Must enter an address.');
  } else {
    var a = address.split(',');
    $.get(window.CONFIG.GEOCODER_API_URL + '/' + a.shift() + '/' + a.join(','), function (data, text, xhr) {
      if (xhr.status !== 200) {
        callback(xhr.responseText);
      } else {
        callback(null, data[0]);
      }
    });
  }
};
