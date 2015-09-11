'use strict';

let config = require('../../config');
let HttpGateway = require('synapse-common/http/auth-gateway');

let QlessClient = HttpGateway.extend({
    config: config.api,
    fetchQueues : () => {
        return this.apiRequest('GET', '', {command: "queues"});
    },
    fetchWorkers : () => {
        return this.apiRequest('GET', '', {command: "workers"});
    },
    fetchJobs : () => {
        return this.apiRequest('GET', '', {command: "jobs"});
    },
    fetchJob : (jid) => {
        return this.apiRequest('GET', '', {command: "job", jid: jid});
    }
});

module.exports = new QlessClient();
