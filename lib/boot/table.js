/**
 * Dependencies
 */

var d3 = require('d3');
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
    .text(function (d) {
      return d.summary;
    });

  denter.append('div')
    .attr('class', 'times col-lg-3 col-md-3 col-sm-3')
    .text(function (d) {
      return secondsToMinutes(d.stats.avg) + ' avg / ' + secondsToMinutes(d.stats.max) + ' max';
    });

  denter.append('div')
    .attr('class', 'segments col-lg-6 col-md-6 col-sm-6')
    .selectAll('.segment')
    .data(function (d) {
      return d.segments;
    })
    .enter()
    .append('div')
    .attr('class', 'segment')
    .text(function (d) {
      return d.fromName + ' to ' + d.toName;
    });

  /*
  var tr = datum.enter().append('tr');
  var td = tr.selectAll('td')
    .data(function(d) {
      var avg = d.stats.avg > 0
        ? d.stats.avg
        : d.stats.max;

      return [ d.summary, secondsToMinutes(d.stats.avg) + ' avg. ' + secondsToMinutes(d.stats.max) + ' max', d.segments ];
    })
    .enter()
    .append('td')
    .text(function(d) {
      return d;
    });*/
};

function secondsToMinutes(s) {
  return (s / 60).toFixed(1) + 'min';
}
