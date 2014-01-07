/**
 * Dependencies
 */

var d3 = require('d3');
var parseColor = require('color-parser');
var toTitleCase = require('to-capital-case');

/**
 * Average walk speed = 1.5 meters per second
 */

var WALK_SPEED = 1.5;

/**
 * Expose `Table`
 */

module.exports = Table;

/**
 * Init table
 */

function Table(el, keys) {
  this.el = d3.select(el);
}

/**
 * Render the list
 */

Table.prototype.render = function(list) {
  var table = this.el.select('tbody');
  this.el.selectAll('.route').remove();

  var maxTime = d3.max(list, function(d) {
    return d.stats.max + d.segments.reduce(function (m, s) {
      return m + s.walkTime;
    }, 0) + d.finalWalkTime;
  });

  var datum = this.el
    .selectAll('.route')
    .data(list);

  var denter = datum.enter()
    .append('a')
    .attr('class', 'route row')
    .attr('data-toggle', 'collapse')
    .attr('data-target', function(d) {
      return '#' + toId(d.summary);
    });

  denter.append('div')
    .attr('class', 'summary col-lg-4 col-md-4 col-sm-4')
    .text(function(d) {
      return d.summary.split(' ').map(function(s) {
        if (s.length < 3 || s === 'via') return s;
        if (s === 'routes') return '';
        return s;
      }).join(' ');
    });

  denter.append('div')
    .attr('class', 'times col-lg-2 col-md-2 col-sm-2')
    .html(function(d) {
      if (d.stats.avg === d.stats.max) return secondsToMinutes(d.stats.avg) +
        ' min';
      else return secondsToMinutes(d.stats.avg) + '-' + secondsToMinutes(d.stats
        .max) + ' min';
    });

  denter.append('div')
    .attr('class', 'segments col-lg-6 col-md-6 col-sm-6')
    .selectAll('.segment')
    .data(function(d) {
      var paths = [];

      d.segments.forEach(function(segment) {
        paths.push({
          routeShortName: 'lightgrey',
          rideStats: {
            avg: segment.walkTime
          }
        });
        paths.push(segment);
      });

      paths.push({
        routeShortName: 'lightgrey',
        rideStats: {
          avg: d.finalWalkTime
        }
      });

      return paths;
    })
    .enter()
    .append('div')
    .attr('class', 'segment')
    .style('width', function(d) {
      return d.rideStats.avg / maxTime * 100 + '%';
    })
    .style('background-color', function(d) {
      return toBSColor(d.routeShortName);
    })
    .style('color', function(d) {
      if (d.routeShortName === 'lightgrey') return '#efefef';
    })
    .text(function(d) {
      return d.routeShortName || d.route;
    });

  var details = denter.append('div')
    .attr('class', 'clearfix collapse details')
    .attr('id', function(d) {
      return toId(d.summary);
    });

  details.append('hr');

  details.append('div')
    .attr('class', 'col-lg-3 col-md-3 col-sm-3')
    .html('<h3>Summary</h3>')
    .append('p')
    .text(function(d) {
      return d.summary;
    });

  details.append('div')
    .attr('class', 'col-lg-3 col-md-3 col-sm-3')
    .html('<h3>Times (minutes)</h3>')
    .append('p')
    .html(function(d) {
      return 'Min: ' + secondsToMinutes(d.stats.min) + '<br>Avg: ' +
        secondsToMinutes(d.stats.avg) + '<br>Max: ' + secondsToMinutes(d.stats
          .max);
    });

  details.append('div')
    .attr('class', 'col-lg-3 col-md-3 col-sm-3')
    .html('<h3>Stops</h3>')
    .append('p')
    .text(function(d) {
      var stops = d.segments.reduce(function(s, c) {
        return s + c.segmentPatterns.length;
      }, 0);
      return 'Stops: ' + stops;
    });

  details.append('div')
    .attr('class', 'col-lg-3 col-md-3 col-sm-3')
    .html('<h3>Segments</h3>')
    .append('p')
    .html(function(d) {
      return d.segments.reduce(function(s, c) {
        return s + (c.routeLongName || c.routeShortName || c.route) +
          '<br>';
      }, '');
    });

  details.append('pre')
    .attr('class', 'col-lg-12 col-md-12 col-sm-12')
    .text(function(d) {
      return JSON.stringify(d, null, '  ');
    });

  $('.route .details').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
  });
};

function secondsToMinutes(s) {
  return (s / 60).toFixed(1);
}

function toId(s) {
  return s.replace(/\W/g, '');
}

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
