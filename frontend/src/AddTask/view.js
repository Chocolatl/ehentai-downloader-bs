import React from 'react';
import {connect} from 'react-redux';
import {actions} from '../TaskList'
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
    if(/https?:\/\/e(-|x)hentai.org\/g/.test(url)) {
      this.props.addTaskItem(url);
      this.taskInput.value = '';
    } else {
      alert('请键入以下形式的URL: \r\nhttps://e-hentai.org/g/1177637/06dd559f50\r\nhttps://exhentai.org/g/1177637/06dd559f50');
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  addTaskItem: (url) => dispatch(actions.addTaskItem(url))
});

export default connect(null, mapDispatchToProps)(AddTask);