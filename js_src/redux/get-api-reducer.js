module.exports = function(
    actionTypePrefix,
    initialValue,
    requestReducer,
    successReducer,
    failureReducer
) {
    return function(state = initialValue, action) {
        let method;
        switch (action.type) {
            case actionTypePrefix + '_REQUEST':
                method = requestReducer;
                break;
            case actionTypePrefix + '_SUCCESS':
                method = successReducer;
                break;
            case actionTypePrefix + '_FAILURE':
                method = failureReducer;
                break;
            default:
                break;
        }

        if (method) {
            state = method(state, action);
        }

        return state;
    };
};
