import React from 'react';
import Relay from 'react-relay';

import Instructor from "./Instructor";
import Link from "./Link";
import Total from "./Total";

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Relay Bookmarks</h1>
        {this.props.store.links.edges.map(item => {
          return <Link link={item.node} />
        })}

        <Total total={this.props.store.total} />
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    store: () => Relay.QL`
      fragment on Store {
        dummy,
        links(first: 3) {
          edges {
            node {
              ${Link.getFragment('link')}
            }
          }
        }
        total
      }
    `,
  },
});
