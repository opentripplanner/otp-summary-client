
/**
 * Dependencies
 */

var parse = require('color-parser');

/**
 * Expose pattern styles
 */

exports.patterns = {
  stroke: function(display, data) {
    console.log(data);
    if (data.otpSegment && parse(data.otpSegment.route)) {
      return data.otpSegment.route.toLowerCase();
    }
  }
};

/**
 * Expose stop styles
 */

exports.stops = {
  stroke: function(display, data, index) {
    console.log(data);
    if (data.pattern && data.pattern.segments && data.pattern.segments[index].otpSegment && parse(data.pattern.segments[index].otpSegment.route)) {
      return data.pattern.segments[index].otpSegment.route.toLowerCase();
    }
  }
};
