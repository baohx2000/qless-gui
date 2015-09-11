import React, { Component, PropTypes } from 'react';

class MainSection extends Component {
    displayName = 'MainSection';

    constructor(props, context) {
        super(props, context);
        this.state = {};
    }

    render() {
        const { queues, actions } = this.props;

        return (
            <section className="main">
                <ul className="queue-list">
                    {queues.map(queue =>
                        <Queue key={queue.id} queue={queue} {...actions} />
                    )}
                </ul>
            </section>
        );
    }
}

MainSection.propTypes = {
    queues: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
};

export default MainSection;
