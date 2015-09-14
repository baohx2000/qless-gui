
var QlessGui = {
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
            jQuery('#main').html('Charts will go here');
        });
    }
};

jQuery.ready(function() {

});
