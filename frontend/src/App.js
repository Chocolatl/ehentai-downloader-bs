import React from 'react';
import {Provider} from 'react-redux';
import store from './store';
import GallerySearch from './GallerySearch';
import TaskList from './TaskList';
import TaskPreview from './TaskPreview';
import TaskInfo from './TaskInfo';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import withRoot from './withRoot';

import Tabs, {Tab} from 'material-ui/Tabs';
import Icon from 'material-ui/Icon';
import {withStyles} from 'material-ui/styles';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    '& > :first-child': {
      flexGrow: 1,
      overflowY: 'auto'
    }
  },
  tab: {
    maxWidth: '50%'
  }
});

const Index = withStyles(styles)(class extends React.Component {
  state = {
    value: 1
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        {this.state.value === 0 && <GallerySearch />}
        {this.state.value === 1 && <TaskList />}
        <Tabs
          value={this.state.value}
          onChange={this.handleChange}
          fullWidth
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab className={classes.tab} icon={<Icon>search</Icon>} />
          <Tab className={classes.tab} icon={<Icon>list</Icon>} />
        </Tabs>
      </div>
    );
  }
});

const Info = ({match}) => {
  return <TaskInfo id={match.params.id} />
}

const Preview = ({match}) => {
  return <TaskPreview id={match.params.id} />
}

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
      <Router>
        <div className="App">
        <Switch>
          <Route exact path="/" component={Index} />
          <Route exact path="/info/:id" component={Info} />
          <Route path="/preview/:id" component={Preview} />
          <Route component={Index} />
        </Switch>
        </div>
      </Router>
      </Provider>
    );
  }
}

export default withRoot(App);