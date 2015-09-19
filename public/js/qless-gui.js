/* global jQuery, Handlebars, _ */
var queues;
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

    showAbout: function()
    {
        jQuery.get('/js/templates/about.handlebars', function(html) {
            jQuery('#main').html(html);
        });
    },

    showConfig: function()
    {
        jQuery.get('/api.php?command=config', function(data) {
            jQuery.get('/js/templates/config.handlebars', function(script) {
                var template = Handlebars.compile(jQuery(script).html());
                jQuery('#main').html(template({options: data}));
            });
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
        jQuery.get('/api.php?command=failed', function(data) {
            jQuery.get('/js/templates/fail-list.handlebars', function(script) {
                var template = Handlebars.compile(jQuery(script).html());
                jQuery(el).html(template({failed: data}));
            });
        });
    },

    showTracked: function()
    {
        var el = typeof arguments[0] === 'undefined' ? '#main' : arguments[0];
        jQuery.get('/api.php?command=tracked', function(data) {
            jQuery.get('/js/templates/job-list.handlebars', function(script) {
                var template = Handlebars.compile(jQuery(script).html());
                jQuery(el).html(template({tracked: data}));
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

    showWorker: function(workerName)
    {
        jQuery.get('/api.php?command=worker&worker='+workerName, function(data) {
            jQuery.get('/js/templates/worker.handlebars', function(script) {
                var template = Handlebars.compile(jQuery(script).html());
                jQuery('#main').html(template({
                    worker: QlessGui._buildTemplateOptions(data),
                    queues: queues
                }));
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

    showQueue: function(name, jobState) {
        jQuery.get('/api.php?command=status&queue=' + name + '&jobState=' + jobState, function(data) {
            jQuery.get('/js/templates/queue-status.handlebars', function(script) {
                var template = Handlebars.compile(jQuery(script).html());
                data = QlessGui._buildTemplateOptions(data);
                data.queues = queues;
                jQuery('#main').html(template(data));
                QlessGui.drawChart(data.stats.wait.histogram, 'wait-chart', 'Jobs / Minute');
                QlessGui.drawChart(data.stats.run.histogram, 'run-chart', 'Jobs / Minute');
            });
        });
    },

    showJob: function(jid) {
        jQuery.get('/api.php?command=job&jid=' + jid, function(data) {
            jQuery.get('/js/templates/job.handlebars', function(script) {
                var template = Handlebars.compile(jQuery(script).html());
                jQuery('#main').html(template(QlessGui._buildTemplateOptions({jid: jid, job: data, queues: queues})));
            })
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

var QlessActions = {
    track: function(jid) {
        return jQuery.post('/api.php?command=track&jid=' + jid, window.location.reload);
    },

    untrack: function(jid) {
        return jQuery.post('/api.php?command=untrack&jid=' + jid, window.location.reload);
    },

    cancel: function(jid) {
        return jQuery.post('/api.php?command=cancel&jid=' + jid, window.location.reload);
    },

    move: function(jid, queue) {
        return jQuery.post('/api.php?command=move&jid=' + jid + '&queue=' + queue, window.location.reload);
    }
};

Handlebars.registerHelper('shorten', function(str) {
    var len = arguments[1] || 20;
    if (str.length < len) {
        return str;
    }
    return str.substring(0, len) + '...';
});

Handlebars.registerHelper('relTimeStamp', function(stamp) {
    return moment.unix(stamp).fromNow();
});

Handlebars.registerHelper('eachReverse', function(items, keyName, block) {
    var s = '';
    items = items.reverse();
    for (var i in items) {
        var obj = {};
        obj[keyName] = items[i];
        s += block.fn(obj);
    }
    return s;
});
Handlebars.registerHelper('eachJobByState', function(a, state, block) {
    var s = '';
    for (var i in a) {
        if (a[i].state == state) {
            s += block(a[i]);
        }
    }

    return s;
});

Handlebars.registerHelper('countJobsByState', function(jobs, state) {
    var x = 0;
    for (var i in jobs) {
        if (jobs[i].state === state) {
            x++;
        }
    }
    return x;
});

Handlebars.registerHelper('json', function (json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, null, 2);
    } else {
        json = JSON.stringify(JSON.parse(json), null, 2);
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

jQuery.get('/js/templates/job-partial.handlebars', function(script) {
    Handlebars.registerPartial('JOB', jQuery(script).html());
});
jQuery.get('/api.php?command=queues', function(data) {
    queues = data;
});
var fade = function(jid, type)
{
    if (type === 'cancel') {
        jQuery('#job-' + jid).slideUp();
    }
};

// super simple router
var match = window.location.href.match(/https?:\/\/[^\/]*(.*)/i);

switch(match[1]) {
    case '':
    case '/':
        QlessGui.showMain();
        break;
    case '/config':
        QlessGui.showConfig();
        break;
    case '/queues':
        QlessGui.showQueues();
        break;
    case '/workers':
        QlessGui.showWorkers();
        break;
    case '/about':
        QlessGui.showAbout();
        break;
    case '/failed':
        QlessGui.showFails();
        break;
    case '/track':
        QlessGui.showTracked();
        break;
    default:
        if (match[1].match(/\/queues\/.*/)) {
            var qName = match[1].match(/queues\/([^\/]*)/)[1];
            var jobState;
            var stateMatch = match[1].match(/queues\/[^\/]*\/(.*)/);
            if (stateMatch) {
                jobState = stateMatch[1];
            }
            QlessGui.showQueue(qName, jobState);
            break;
        }
        if (match[1].match(/\/workers\/.*/)) {
            var workerName = match[1].match(/workers\/(.*)/)[1];
            QlessGui.showWorker(workerName);
            break;
        }
        if (match[1].match(/\/jobs\/.*/)) {
            var jid = match[1].match(/jobs\/(.*)/)[1];
            QlessGui.showJob(jid);
            break;
        }
        break;
}
