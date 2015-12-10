import React from 'react';
import Relay from 'react-relay';

class Link extends React.Component {
  render() {
    return (
      <div><a href={this.props.link.url}>{this.props.link.title}</a></div>
    );
  }
}

export default Relay.createContainer(Link, {
  fragments: {
    link: () => Relay.QL`
      fragment on Link {
        title,
        url
      }
    `,
  },
});
