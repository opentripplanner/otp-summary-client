/**
 * Dependencies
 */

var d3 = require('d3');
var parseColor = require('color-parser');
var toTitleCase = require('to-title-case');

/**
 * Expose `Table`
 */

module.exports = Table;

/**
 * Init table
 */

function Table(el, keys) {
  this.el = d3.select(el);
  /*this.el.select('thead tr')
    .selectAll('th')
    .data([ 'Summary', 'Length', 'Segments' ])
    .enter()
    .append('th')
    .text(function(d) {
      return toTitleCase(d);
    });*/
}

/**
 * Render the list
 */

Table.prototype.render = function(list) {
  var table = this.el.select('tbody');
  this.el.selectAll('.route').remove();

  var maxAvg = d3.max(list, function (d) {
    return d.stats.avg;
  });

  var datum = this.el
    .selectAll('.route')
    .data(list);

  var denter = datum.enter()
    .append('a')
    .attr('class', 'route row')
    .style('cursor', 'pointer')
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
        return toTitleCase(s);
      }).join(' ');
    });

  denter.append('div')
    .attr('class', 'times col-lg-1 col-md-1 col-sm-1')
    .text(function(d) {
      return secondsToMinutes(d.stats.avg) + ' avg';
    });

  denter.append('div')
    .attr('class', 'times col-lg-1 col-md-1 col-sm-1')
    .text(function(d) {
      return secondsToMinutes(d.stats.max) + ' max';
    });

  var maxWidth = 100;
  denter.append('div')
    .attr('class', 'segments col-lg-6 col-md-6 col-sm-6')
    .selectAll('.segment')
    .data(function(d) {
      return d.segments;
    })
    .enter()
    .append('div')
    .attr('class', 'segment')
    .style('width', function(d) {
      return d.stats.avg / maxAvg * 100 + '%';
    })
    .style('background-color', function(d) {
      return toBSColor(d.routeShortName);
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

  details.append('h3')
    .attr('class', 'col-lg-4 col-md-4 col-sm-4')
    .text('Summary');

  details.append('h3')
    .attr('class', 'col-lg-4 col-md-4 col-sm-4')
    .text('Times (minutes)');

  details.append('h3')
    .attr('class', 'col-lg-4 col-md-4 col-sm-4')
    .text('Stats');

  details.append('div')
    .attr('class', 'col-lg-4 col-md-4 col-sm-4')
    .text(function (d) {
      return d.summary;
    });

  details.append('div')
    .attr('class', 'col-lg-4 col-md-4 col-sm-4')
    .html(function (d) {
      return 'Min: ' + secondsToMinutes(d.stats.min) + '<br>Avg: ' + secondsToMinutes(d.stats.avg) + '<br>Max: ' + secondsToMinutes(d.stats.max);
    });

  details.append('div')
    .attr('class', 'col-lg-4 col-md-4 col-sm-4')
    .text(function (d) {
      var stops = d.segments.reduce(function (s, c) {
        return s + c.stops.length;
      }, 0);
      return 'Stops: ' + stops;
    });

  details.append('h3')
    .attr('class', 'col-lg-12 col-md-12 col-sm-12')
    .text('Data');

  details.append('pre')
    .attr('class', 'col-lg-12 col-md-12 col-sm-12')
    .text(function(d) {
      return JSON.stringify(d, null, '  ');
    });

  /*details.append('p')
    .attr('class', 'col-lg-6 col-md-6 col-sm-6')
    .text(function (d) {
      return 'Min:' + secondsToMinutes(d.stats.min) + ' Avg:' + secondsToMinutes(d.stats.avg) + ' Max:' + secondsToMinutes(d.stats.max);
    });*/
};

function secondsToMinutes(s) {
  return (s / 60).toFixed(1);
}

function toId(s) {
  return s.replace(/\W/g, '');
}

function toBSColor(s) {
  switch(s.toLowerCase()) {
    case 'red':
      return '#d9534f';
    case 'green':
      return '#5cb85c';
    case 'blue':
      return '#428bca';
    case 'yellow':
      return 'yellow';
    case 'orange':
      return '#f0ad4e';
    default:
      return null;
  }
}
