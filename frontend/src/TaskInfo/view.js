import React from 'react';
import {connect} from 'react-redux';
import {fetchTaskInfo, cleanTaskInfo} from './actions';
import {actions as messageActions} from '../MessageProvider';
import './style.css';

class TaskInfo extends React.Component {
  render() {
    const info = this.props.info;
    if(!info) {
      return null;
    } else if (info.errMsg) {
      this.props.displayMessage(info.errMsg);
      return null;
    } else {
      let {id, state, title, gurl, logs, files} = info;
      return (
        <div className="task-info">
          <p>ID：{id}</p>
          <p>状态：{state}</p>
          <p>标题：{title}</p>
          <p>源地址：{gurl}</p>
          <p>下载的文件：</p>
          <pre>{files.map(JSON.stringify).join('\r\n')}</pre>
          <p>下载日志：</p>
          <pre>{logs.map(JSON.stringify).join('\r\n')}</pre>
        </div>
      )
    }
  }

  componentDidMount() {
    this.props.fetchTaskInfo(this.props.id);
  }

  componentWillUnmount() {
    this.props.cleanTaskInfo();
  }
}

const mapStateToProps = state => ({
  info: state.taskInfo
});

const mapDispatchToProps = dispatch => ({
  fetchTaskInfo: infoUrl => dispatch(fetchTaskInfo(infoUrl)),
  cleanTaskInfo: () => dispatch(cleanTaskInfo()),
  displayMessage: text => dispatch(messageActions.displayMessage(text))
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskInfo);
