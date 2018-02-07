import React from 'react';
import {Provider} from 'react-redux';
import store from './store';
import {view as TaskList} from './TaskList';
import {view as AddTask} from './AddTask';
import {view as TaskInfo} from './TaskInfo';
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

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
      <Router>
        <div className="App">
          <Switch>
          <Route exact path="/" component={Index} />
          <Route exact path="/info/:id" component={Info} />
          <Route component={Index} />
          </Switch>
        </div>
      </Router>
      </Provider>
    );
  }
}


export default App;
