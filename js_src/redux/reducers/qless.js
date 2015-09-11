import { GET_QUEUES, GET_JOBS, GET_WORKERS } from '../qless/qless-constants';

const initialState = [];

export default function qless(state = initialState, action) {
    switch (action.type) {
        case GET_QUEUES:
            return [{
                id: state.reduce((maxId, queue) => Math.max(queue.id, maxId), -1) + 1,
                completed: false,
                text: action.text
            }, ...state];

        default:
            return state;
    }
}
