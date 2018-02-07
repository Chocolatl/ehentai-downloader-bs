import React from 'react';
import {connect} from 'react-redux';
import {fetchTaskList} from '../actions';
import TaskItem from './TaskItem';
import '../style.css';

class TaskList extends React.Component {
  render() {
    return (
      <ul className="task-list">
        {
          this.props.list.map(item => (
            <TaskItem
              key={item.id}
              task={item}
            />
          ))
        }
      </ul>
    )
  }

  componentDidMount() {
    this.props.fetchTaskList();
    this.intervalID = setInterval(this.props.fetchTaskList, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }
}

const mapStateToProps = state => ({
  list: state.taskList
});

const mapDispatchToProps = dispatch => ({
  fetchTaskList: () => dispatch(fetchTaskList())
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);