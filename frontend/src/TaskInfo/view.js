import React from 'react';
import './style.css';

class TaskInfo extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {};
  }

  render() {
    const info = this.state.info;
    if(!info) {
      return <div>正在加载...</div>;
    } else if (info.errMsg) {
      return <div>{info.errMsg}</div>;
    } else {
      return (
        <div className="task-info">
          <p>ID：{info.id}</p>
          <p>状态：{info.state}</p>
          <p>标题：{info.title}</p>
          <p>源地址：{info.gurl}</p>
          <p>下载的文件：</p>
          <pre>{info.files.map(JSON.stringify).join('\r\n')}</pre>
          <p>下载日志：</p>
          <pre>{info.logs.map(JSON.stringify).join('\r\n')}</pre>
        </div>
      )
    }
  }

  componentDidMount() {
    let isiE = navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;
    let url = `/task/${this.props.id}/info?` + (isiE ? +new Date() : '');
    
    fetch(url)
      .then(res => res.json())
      .then(info => this.setState({info}))
      .catch(err => this.setState({info: {errMsg: err.message}}));
  }
}

export default TaskInfo;
