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
    width: '100vw',
    position: 'absolute',
    zIndex: 500
  },
  tabPanel: {
    flexGrow: 1,
    overflow: 'hidden'
  },
  tab: {
    maxWidth: '50%'
  },
  subPage: {
    position: 'absolute',
    zIndex: 501
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
    const {value} = this.state;
    return (
      <React.Fragment>
        <div className={classes.root}>
          <GallerySearch className={classes.tabPanel} hidden={value !== 0} />
          <TaskList className={classes.tabPanel} hidden={value !== 1} />
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

        <Route
          path="/info/:id"
          render={
            ({match}) => <TaskInfo id={match.params.id} className={classes.subPage} />
          }
        />
        <Route
          path="/preview/:id"
          render={
            ({match}) => <TaskPreview id={match.params.id} className={classes.subPage} />
          }
        />
      </React.Fragment>
    );
  }
});

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
      <Router>
        <div className="App">
        <Switch>
          <Route exact path="/" component={Index} />
          <Route component={Index} />
        </Switch>
        </div>
      </Router>
      </Provider>
    );
  }
}

export default withRoot(App);