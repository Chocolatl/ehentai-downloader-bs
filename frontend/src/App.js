import React from 'react';
import {Provider} from 'react-redux';
import store from './store';
import {view as MessgaeProvider} from './MessageProvider';
import {view as TaskList} from './TaskList';
import {view as AddTask} from './AddTask';
import {view as TaskInfo} from './TaskInfo';
import {view as TaskPreview} from './TaskPreview';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'

const Index = () => {
  return (
    <div>
      <AddTask />
      <TaskList />
    </div>
  )
}

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
        <MessgaeProvider time={4000}>
        <Switch>
          <Route exact path="/" component={Index} />
          <Route exact path="/info/:id" component={Info} />
          <Route exact path="/preview/:id" component={Preview} />
          <Route component={Index} />
        </Switch>
        </MessgaeProvider>
        </div>
      </Router>
      </Provider>
    );
  }
}


export default App;
