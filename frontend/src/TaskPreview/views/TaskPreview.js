import React from 'react';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router-dom';
import {actions as messageActions} from '../../MessageProvider';
import PhotoSwipeComponent from './PhotoSwipe';
import './style.css';

class TaskPreview extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {};
    this.firstPrompt = true;
  }

  render() {
    if(!this.state.info) {
      return <div>正在加载...</div>;
    }

    let info = this.state.info;
    if(info.errMsg) {
      this.props.displayMessage(info.errMsg);
      return null;
    }

    if(info.files.length === 0) {
      this.props.displayMessage('没有可以加载的东西');
      return null;
    }

    if(this.firstPrompt && info.state !== 'success') {
      this.firstPrompt = false;
      this.props.displayMessage('当前任务没有完成下载，仅可以预览部分图片');
    }

    let items = info.files.map(file => ({
      src: `/task/${info.id}/preview/${file.index}`,
      title: file.fileName,
      w: file.width,
      h: file.height
    }));

    let matchedURL = this.props.match.url;

    return (
      <div className="task-preview">
        <header>
          <h2 className="title">{info.title}</h2>
        </header>
        <div className="view-area">
          {
            info.files.map(({index, fileName}, arrIndex) => (
              <div key={index} className="thumb">
                <Link to={matchedURL + (/\/$/.test(matchedURL) ? '' : '/') + arrIndex}>
                <img
                  src={`/task/${info.id}/preview/${index}?thumb=yes`}
                  alt={fileName}
                  onLoad={this.onImageLoad}
                />
                </Link>
              </div>
            ))
          }
          {/* 用来对齐flex最后一行的空元素 */}
          <div className="thumb empty"></div>
          <div className="thumb empty"></div>
          <div className="thumb empty"></div>
          <div className="thumb empty"></div>
          <div className="thumb empty"></div>
          <div className="thumb empty"></div>
          <div className="thumb empty"></div>
          <div className="thumb empty"></div>
        </div>
        <PhotoSwipeComponent items={items} match={this.props.match} />
      </div>
    )
  }

  onImageLoad(ev) {
    ev.target.classList.add('load');
  }

  componentDidMount() {
    let isiE = navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;
    let url = `/task/${this.props.id}/info?` + (isiE ? +new Date() : '');

    fetch(url)
      .then(res => res.json())
      .then(info => this.setState({info}))
      .catch(err => this.setState({info: {errMsg: err.errMsg}}));
  }
}

const mapDispatchToProps = dispatch => ({
  displayMessage: text => dispatch(messageActions.displayMessage(text))
});

export default withRouter(connect(null, mapDispatchToProps)(TaskPreview));