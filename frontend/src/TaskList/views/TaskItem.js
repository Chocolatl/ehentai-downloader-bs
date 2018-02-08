import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom'

class TaskItem extends React.Component {
  constructor() {
    super(...arguments);
    this.onClickDownload = this.onClickDownload.bind(this);
  }

  render() {
    const {id, state, title, gurl} = this.props;
    const stateText = ({
      'error': '发生异常',
      'failure': '下载失败',
      'success': '下载成功',
      'downloading': '正在下载',
      'waiting': '等待下载'
    })[state];

    return (
      <li>
        <span>{title || gurl}</span> 
        <div className="ctr">
          <span className={`state ${state}`}>{stateText}</span>
          <Link to={'/info/' + id}>详细信息</Link>
          <a href={`/task/${id}/download`} download onClick={this.onClickDownload}>下载文件</a>
        </div>
      </li>
    )
  }

  onClickDownload(ev) {
    if(this.props.task.state !== 'success') {
      alert('状态非下载成功');
      ev.preventDefault();
    }
  }
}


export default connect()(TaskItem);