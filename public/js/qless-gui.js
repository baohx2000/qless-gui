/* global jQuery */
var QlessGui = {
    showMain: function()
    {
        jQuery.Mustache.load('/js/templates/main.mustache')
            .done(function () {
                jQuery('#main').mustache('qless-main', {});
            });

    },

    showQueues: function()
    {
        jQuery.get('/api.php?command=queues', function(data) {
            jQuery('#main').html('');
            jQuery(data).each(function(key, data) {
                jQuery('#main').append(
                    jQuery(
                        '<div class="queue-container">' +
                            '<a onclick="QlessGui.showQueue(this)" class="queue-name">' + data.name + '</a>' +
                            '<div>Paused: '+ data.paused +'</div>' +
                            '<div>Running: '+ data.running +'</div>' +
                            '<div>Scheduled: '+ data.scheduled +'</div>' +
                            '<div>Stalled: '+ data.stalled +'</div>' +
                            '<div>Waiting: '+ data.waiting +'</div>' +
                        '</div>'
                    )
                );
            });
        });
    },

    showWorkers: function()
    {
        jQuery.get('/api.php?command=workers', function(data) {
            jQuery('#main').html('');
            jQuery(data).each(function(key, name) {
                jQuery('#main').append(
                    jQuery(
                        '<div class="queue-container"><span class="queue-name">' + name + '</span>' +
                        '</div>'
                    )
                );
            });
        });
    },

    showJobs: function()
    {
        jQuery.get('/api.php?command=jobs', function(data) {
            jQuery('#main').html('');
            jQuery(data).each(function(key, name) {
                jQuery('#main').append(
                    jQuery(
                        '<div class="queue-container"><span class="queue-name">' + name + '</span>' +
                        '</div>'
                    )
                );
            });
        });
    },

    showQueue: function(el) {
        var name = jQuery(el).text();
        jQuery.get('/api.php?command=status&queue=' + name, function(data) {
            jQuery.Mustache.load('/js/templates/queue-status.mustache')
                .done(function () {
                    jQuery('#main').mustache('queue-status', { data : data});
                    QlessGui.drawChart(data.stats.wait.histogram, 'wait-chart', 'Jobs / Minute');
                    QlessGui.drawChart(data.stats.run.histogram, 'run-chart', 'Jobs / Minute');
                });
        });
    },

    drawChart: function(d, id, title) {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Time');
        data.addColumn('number', title);

        var _data = [];
        var i;
        for (i = 0; i < 60; ++i) {
            _data.push([i + ' seconds', d[i] * 60]);
        }
        for (i = 1; i < 60; ++i) {
            _data.push([i + ' minutes', d[59 + i]]);
        }
        for (i = 1; i < 24; ++i) {
            _data.push([i + ' hours', d[118 + i] / 60]);
        }
        for (i = 1; i < 7; ++i) {
            _data.push([i + ' days', d[141 + i] / 1440]);
        }
        data.addRows(_data);

        var options = {
            legend: {position: 'none'},
            chartArea: { width:"80%", height:"80%" }
        };

        var chart = new google.visualization.SteppedAreaChart(document.getElementById(id));
        chart.draw(data, options);
    }
};

// super simple router
var match = window.location.href.match(/https?:\/\/[^\/]*(.*)/i);
switch(match[1]) {
    case '/':
        QlessGui.showMain();
        break;
    case match[1].match(/queues/):
        break;
    case match[1].match(/workers/):
        break;
    case '/failed':
        break;
    case '/track':
        break;
}
