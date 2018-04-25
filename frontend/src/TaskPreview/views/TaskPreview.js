import React from 'react';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router-dom';
import PhotoSwipeComponent from './PhotoSwipe';

import Snackbar from 'material-ui/Snackbar';
import './style.css';

class TaskPreview extends React.Component {

  state = {
    snackOpen: false,
    snackMsg: '',
    info: null
  };

  handleSnackClose = () => {
    this.setState({ snackOpen: false });
  }

  render() {
    let info = this.state.info;

    if(!info) return (
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={this.state.snackOpen}
        onClose={this.handleSnackClose}
        message={<span>{this.state.snackMsg}</span>}
        autoHideDuration={3000}
      />
    );

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

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.state.snackOpen}
          onClose={this.handleSnackClose}
          message={<span>{this.state.snackMsg}</span>}
          autoHideDuration={3000}
        />
      </div>
    )
  }

  onImageLoad(ev) {
    ev.target.classList.add('load');
  }

  componentDidMount() {
    let isiE = navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;
    let url = `/task/${this.props.id}/info?` + (isiE ? +new Date() : '');

    this.setState({info: null});
    fetch(url)
      .then(res => res.json())
      .then(info => {
        if(info.errMsg) throw new Error(info.errMsg);
        if(info.files.length === 0) throw new Error('没有可以加载的东西');
        if(info.state !== 'success') {
          this.setState({info, snackOpen: true, snackMsg: '当前任务没有完成下载，仅可以预览部分图片'});
        } else {
          this.setState({info});
        }
      })
      .catch(err => {
        this.setState({snackOpen: true, snackMsg: err.message});
      });
  }
}

export default withRouter(connect(null, null)(TaskPreview));