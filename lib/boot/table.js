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

  var datum = this.el
    .selectAll('.route')
    .data(list);

  var denter = datum.enter()
    .append('div')
    .attr('class', 'route row');

  denter.append('div')
    .attr('class', 'summary col-lg-3 col-md-3 col-sm-3')
    .text(function(d) {
      return d.summary;
    });

  denter.append('div')
    .attr('class', 'times col-lg-3 col-md-3 col-sm-3')
    .text(function(d) {
      return secondsToMinutes(d.stats.avg) + ' avg / ' + secondsToMinutes(d.stats
        .max) + ' max';
    });

  var maxWidth = 100;
  denter.append('div')
    .attr('class', 'segments col-lg-6 col-md-6 col-sm-6')
    .selectAll('.segment')
    .data(function(d) {
      var segments = d.segments;

      segments.forEach(function (segment) {
        segment.width = segment.stats.avg / d.stats.avg * 100;
        segment.color = parseColor(segment.routeShortName.toLowerCase());
      });

      return d.segments;
    })
    .enter()
    .append('div')
    .attr('class', 'segment')
    .style('width', function (d) {
      return d.width + '%';
    })
    .style('background-color', function (d) {
      if (!d.color) return null;
      return 'rgb(' + d.color.r + ',' + d.color.g + ',' + d.color.b + ')';
    })
    .text(function(d) {
      return d.routeShortName || d.route;
    });
};

function secondsToMinutes(s) {
  return (s / 60).toFixed(1) + 'min';
}
