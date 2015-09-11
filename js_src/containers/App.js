import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MainSection from '../components/MainSection';
import * as QlessActions from '../redux/qless/qless-actions';

class App extends Component {
    displayName = 'App';

    render() {
        const { queues, dispatch } = this.props;
        const actions = bindActionCreators(QlessActions, dispatch);

        return (
            <div>
                <MainSection queues={queues} actions={actions} />
            </div>
        );
    }
}

App.propTypes = {
    queues: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    return {
        queues: state.queues
    };
}

export default connect(mapStateToProps)(App);
