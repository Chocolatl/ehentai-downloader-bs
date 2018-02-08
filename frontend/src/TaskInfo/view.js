import React from 'react';
import {connect} from 'react-redux';
import {fetchTaskInfo} from './actions';
import './style.css';

class TaskInfo extends React.Component {
  render() {
    const info = this.props.info;
    if(!info) {
      return <div>请稍等</div>
    } else if (info.errMsg) {
      return <div>{info.errMsg}</div>
    } else {
      let {id, state, title, gurl, logs} = info;
      return (
        <div className="task-info">
          <p>ID：{id}</p>
          <p>状态：{state}</p>
          <p>标题：{title}</p>
          <p>源地址：{gurl}</p>
          <p>下载日志：</p>
          <pre>{logs.map(log => JSON.stringify(log)).join('\r\n')}</pre>
        </div>
      )
    }
  }

  componentDidMount() {
    this.props.fetchTaskInfo(this.props.id);
  }
}

const mapStateToProps = state => ({
  info: state.taskInfo
});

const mapDispatchToProps = dispatch => ({
  fetchTaskInfo: infoUrl => dispatch(fetchTaskInfo(infoUrl))
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskInfo);
