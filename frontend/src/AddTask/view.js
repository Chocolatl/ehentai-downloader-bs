import React from 'react';
import {connect} from 'react-redux';
import {actions as taskActions} from '../TaskList';
import {actions as messageActions} from '../MessageProvider';
import './style.css';

class AddTask extends React.Component {
  constructor() {
    super(...arguments);
    this.taskInputRef = this.taskInputRef.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  render() {
    return (
      <div className="add-task">
        <form onSubmit={this.onSubmit}>
          <input type="text" ref={this.taskInputRef} placeholder="键入Gallery的URL开始下载"/>
          <input type="submit" value="开始下载"/>
        </form>
      </div>     
    )
  }

  taskInputRef(el) {
    this.taskInput = el;
  }

  onSubmit(ev) {
    ev.preventDefault();
    let url = this.taskInput.value.trim();
    let done = (message) => {
      this.props.fetchTaskList();
      this.props.displayMessage(message);
    };
    if(/^https?:\/\/e(-|x)hentai.org\/g[/0-9a-zA-Z]+$/.test(url)) {
      this.props.addTaskItem(url, (info) => done('任务创建成功'), (info) => done(info.errMsg));
      this.taskInput.value = '';
    } else {
      this.props.displayMessage('请键入以下形式的URL: \r\nhttps://e-hentai.org/g/1177637/06dd559f50\r\nhttps://exhentai.org/g/1177637/06dd559f50');
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  fetchTaskList: () => dispatch(taskActions.fetchTaskList()),
  addTaskItem: (url, onSuccess, onFailure) => dispatch(taskActions.addTaskItem(url, onSuccess, onFailure)),
  displayMessage: (text) => dispatch(messageActions.displayMessage(text))
});

export default connect(null, mapDispatchToProps)(AddTask);