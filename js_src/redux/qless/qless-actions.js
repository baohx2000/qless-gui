let client = require('./qless-client');

import { GET_QUEUES, GET_JOBS, GET_WORKERS, GET_JOBS, GET_JOB, CANCEL_JOB, REQUEUE_JOB } from '../qless/qless-constants';

export function fetchQueues() {
    return {
        type: GET_QUEUES,
        promis: client.fetchQueues()
    };
}

export function fetchWorkers() {
    return {
        type: GET_WORKERS,
        promis: client.fetchWorkers()
    };
}

export function fetchJobs() {
    return {
        type: GET_JOBS,
        promis: client.fetchJobs()
    };
}

