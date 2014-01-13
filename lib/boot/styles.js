
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
  },
  'stroke-linecap': 'round'
};

/**
 * Expose stop styles
 */

exports.stops = {
  r: function (display, data, index, utils) {
    return utils.pixels(display.zoom.scale(), 2, 4, 6.5) + 'px';
  },
  stroke: '#333',
  'stroke-width': function(display, data, index, utils) {
    return utils.pixels(display.zoom.scale(), 1, 2, 3) + 'px';
  }
};

/**
 * Expose label styles
 */

exports.labels = {
  x: function (display, data, index, utils) {
    var width = utils.strokeWidth(display);
    if (data.stop && data.stop.isEndPoint) {
      width *= data.stop.renderData.length;
    }
    return Math.sqrt(width * width * 2) * (data.stop && data.stop.labelPosition ? data.stop.labelPosition : -1) + 'px';
  },
  y: function (display, data, index, utils) {
    return utils.fontSize(display, data) / 2 * -(data.stop && data.stop.labelPosition ? data.stop.labelPosition : -1) + 'px';
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
