import { GET_QUEUES, GET_JOBS, GET_WORKERS, GET_JOBS, GET_JOB, CANCEL_JOB, REQUEUE_JOB } from '../qless/qless-constants';
let redux = require('redux');
let combineReducers = redux.combineReducers;

let Immutable = require('immutable');
let getApiReducer = require('../get-api-reducer');

const initialQueues = new Immutable.fromJS({
    loading: false,
    loaded: false,
    data: []
});
const initialWorkers = new Immutable.fromJS({
    loading: false,
    loaded: false,
    data: []
});
const initialJobs = new Immutable.fromJS({
    loading: false,
    loaded: false,
    data: []
});
const initialJob = new Immutable.fromJS({
    loaded: false,
    loading: false,
    data: {}
});

let getQueues = getApiReducer(
    GET_QUEUES,
    initialQueues,
    (state, action) => state.set('loading', true),
    (state, action) => state.merge({
        loading: false,
        loaded: true,
        data: new Immutable.fromJS(action.response)
    }),
    (state, action) => state.merge({
        loading: false,
        loaded: false,
        errors: new Immutable.fromJS(action.errors)
    })
);

let getWorkers = getApiReducer(
    GET_WORKERS,
    initialWorkers,
    (state, action) => state.set('loading', true),
    (state, action) => state.merge({
        loading: false,
        loaded: true,
        data: new Immutable.fromJS(action.response)
    }),
    (state, action) => state.merge({
        loading: false,
        loaded: false,
        errors: new Immutable.fromJS(action.errors)
    })
);

let getJobs = getApiReducer(
    GET_JOBS,
    initialWorkers,
    (state, action) => state.set('loading', true),
    (state, action) => state.merge({
        loading: false,
        loaded: true,
        data: new Immutable.fromJS(action.response)
    }),
    (state, action) => state.merge({
        loading: false,
        loaded: false,
        errors: new Immutable.fromJS(action.errors)
    })
);

let getJob = getApiReducer(
    GET_JOB,
    initialWorkers,
    (state, action) => state.set('loading', true),
    (state, action) => state.merge({
        loading: false,
        loaded: true,
        data: new Immutable.fromJS(action.response)
    }),
    (state, action) => state.merge({
        loading: false,
        loaded: false,
        errors: new Immutable.fromJS(action.errors)
    })
);

const qless = combineReducers({
    getQueues,
    getWorkers,
    getJobs,
    getJob
});

export default qless;
