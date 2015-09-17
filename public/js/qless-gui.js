/* global jQuery */
var QlessGui = {
    // recursive function to build "x=y" keys for use in mustache
    _buildTemplateOptions : function(object)
    {
        var validTypes = ['string', 'number', 'boolean'];
        var value;
        var key;
        for (key in object) {
            value = object[key];
            if (object.hasOwnProperty(key) && validTypes.indexOf(typeof value) !== -1) {
                object[key + '::' + value] = true;
            } else if (typeof value === 'object') {
                // turtles all the way
                object[key] = QlessGui._buildTemplateOptions(value);
            }
        }
        return object;
    },

    showMain: function()
    {
        jQuery.get('/js/templates/main.handlebars', function(script) {
                var template = Handlebars.compile(jQuery(script).html());
                jQuery('#main').html(template());
                QlessGui.showQueues('#queue-list-container');
                QlessGui.showFails('#fail-list-container');
                QlessGui.showWorkers('#worker-list-container');
            });
    },

    showQueues: function()
    {
        var el = typeof arguments[0] === 'undefined' ? '#main' : arguments[0];
        jQuery.get('/api.php?command=queues', function(data) {
            jQuery.get('/js/templates/queue-list.handlebars', function(script) {
                var template = Handlebars.compile(jQuery(script).html());
                jQuery(el).html(template({queues: QlessGui._buildTemplateOptions(data)}));
            });
        });
    },

    showFails: function()
    {
        var el = typeof arguments[0] === 'undefined' ? '#main' : arguments[0];
        jQuery.get('/api.php?command=fails', function(data) {
            jQuery.get('/js/templates/fail-list.handlebars', function(script) {
                var template = Handlebars.compile(jQuery(script).html());
                jQuery(el).html(template({queues: QlessGui._buildTemplateOptions(data)}));
            });
        });
    },

    showWorkers: function()
    {
        var el = typeof arguments[0] === 'undefined' ? '#main' : arguments[0];
        jQuery.get('/api.php?command=workers', function(data) {
            jQuery.get('/js/templates/worker-list.handlebars', function(script) {
                var template = Handlebars.compile(jQuery(script).html());
                jQuery(el).html(template({data: QlessGui._buildTemplateOptions(data)}));
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

    showQueue: function(name) {
        jQuery.get('/api.php?command=status&queue=' + name, function(data) {
            jQuery.get('/js/templates/queue-status.handlebars', function(script) {
                var template = Handlebars.compile(jQuery(script).html());
                jQuery('#main').html(template(QlessGui._buildTemplateOptions(data)));
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

Handlebars.registerHelper('json', function (json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
});

// super simple router
var match = window.location.href.match(/https?:\/\/[^\/]*(.*)/i);

switch(match[1]) {
    case '':
    case '/':
        QlessGui.showMain();
        break;
    case '/queues':
        QlessGui.showQueues();
        break;
    case '/workers':
        QlessGui.showWorkers();
        break;
    case '/failed':
        break;
    case '/track':
        break;
    default:
        if (match[1].match(/\/queues\/.*/)) {
            var q = match[1].match(/queues\/(.*)/)[1];
            QlessGui.showQueue(q);
            break;
        }
        if (match[1].match(/\/workers\/.*/)) {

        }
        if (match[1].match(/\/jobs\/.*/)) {

        }
        break;
}
