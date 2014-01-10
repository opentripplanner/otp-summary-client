
/**
 * Dependencies
 */

var parse = require('color-parser');

/**
 * Expose pattern styles
 */

exports.patterns = {
  stroke: function(display, data) {
    if (data.otpSegment) {
      if (parse(data.otpSegment.route)) {
        return toBSColor(data.otpSegment.route.toLowerCase());
      } else {
        return '#ccc';
      }
    }
    return 'rgb(239, 239, 239)';
  }
};

/**
 * Expose stop styles
 */

exports.stops = {
  stroke: function(display, data, index) {
    if (data.otpSegment) {
      if (parse(data.otpSegment.route)) {
        return toBSColor(data.otpSegment.route.toLowerCase());
      } else {
        return '#ccc';
      }
    }
    return 'rgb(239, 239, 239)';
  }
};

/**
 * Expose label styles
 */

exports.labels = {
  visibility: function(display, data) {
    console.log(data);
  }
};

/**
 * TO BSColor
 */

function toBSColor(s) {
  switch (s.toLowerCase()) {
    case 'red':
      return '#d9534f';
    case 'green':
      return '#5cb85c';
    case 'blue':
      return '#428bca';
    case 'yellow':
      return '#ffd247';
    case 'orange':
      return '#f0ad4e';
    case 'lightgrey':
      return '#efefef';
    default:
      return null;
  }
}
