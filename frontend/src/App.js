import React from 'react';
import {Provider} from 'react-redux';
import store from './store';
import GallerySearch from './GallerySearch';
import TaskList from './TaskList';
import TaskPreview from './TaskPreview';
import TaskInfo from './TaskInfo';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import withRoot from './withRoot';

import Tabs, {Tab} from 'material-ui/Tabs';
import Icon from 'material-ui/Icon';
import Slide from 'material-ui/transitions/Slide';
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

class EventComponent extends React.Component {
  componentDidMount() {
    this.props.onMount && this.props.onMount();
  }
  componentWillUnmount() {
    this.props.onUnmount && this.props.onUnmount();
  }
  render() {
    return null;
  }
}

class TaskPreviewRoute extends React.Component {
  state = {
    in: false,
    id: '',
    url: ''
  };

  render() {
    return (
      <React.Fragment>
        <Slide direction="left" timeout={300} in={this.state.in} mountOnEnter unmountOnExit>
          <TaskPreview id={this.state.id} url={this.state.url} className={this.props.className} />
        </Slide>
    
        <Route
          path="/preview/:id"
          render={
            ({match}) => (
              <EventComponent
                onMount={() => this.setState({in: true, id: match.params.id, url: match.url})}
                onUnmount={() => this.setState({in: false})}
              />
            )
          }
        />
      </React.Fragment>
    );
  }
}

class TaskInfoRoute extends React.Component {
  state = {
    in: false,
    id: ''
  };

  render() {
    return (
      <React.Fragment>
        <Slide direction="left" timeout={300} in={this.state.in} mountOnEnter unmountOnExit>
          <TaskInfo id={this.state.id} className={this.props.className} />
        </Slide>
    
        <Route
          path="/info/:id"
          render={
            ({match}) => (
              <EventComponent
                onMount={() => this.setState({in: true, id: match.params.id})}
                onUnmount={() => this.setState({in: false})}
              />
            )
          }
        />
      </React.Fragment>
    );
  }
}

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

        <TaskPreviewRoute className={classes.subPage} />
        <TaskInfoRoute className={classes.subPage} />
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
          <Index />
        </div>
      </Router>
      </Provider>
    );
  }
}

export default withRoot(App);