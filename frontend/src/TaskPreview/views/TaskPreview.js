import React from 'react';
import {connect} from 'react-redux';
import {fetchTaskFilesInfo, cleanTaskInfo} from '../actions';
import {actions as messageActions} from '../../MessageProvider';
import PhotoSwipe from 'photoswipe/dist/photoswipe.js';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default.js';
import PhotoSwipeComponent from './PhotoSwipe';
import './style.css';

class TaskPreview extends React.Component {
  constructor() {
    super(...arguments);
    this.pswp = this.pswp.bind(this);
    this.open = this.open.bind(this);
    this.firstPrompt = true;
  }

  render() {
    if(!this.props.info) {
      return null;
    }

    if(this.props.info.errMsg) {
      this.props.displayMessage(this.props.info.errMsg);
      return null;
    }

    let {id, title, state, files} = this.props.info;

    if(files.length === 0) {
      this.props.displayMessage('没有可以加载的东西');
      return null;
    }

    if(this.firstPrompt && state !== 'success') {
      this.firstPrompt = false;
      this.props.displayMessage('当前任务没有完成下载，仅可以预览部分图片');
    }

    return (
      <div className="task-preview">
        <header>
          <h2 className="title">{title}</h2>
        </header>
        <div className="view-area">
          {
            files.map(({index, fileName}, arrIndex) => (
              <img
                key={index}
                src={`/task/${id}/preview/${index}?thumb=yes`}
                alt={fileName}
                onClick={() => this.open(arrIndex)}
              />
            ))
          }
        </div>
        <PhotoSwipeComponent pswpRef={this.pswp} />
      </div>
    )
  }

  pswp(node) {

    // 貌似是在卸载组件的时候，ref的回调函数还会被调用，传递了一个null进来...无语
    if(node == null) {
      return;
    }

    this.pswp = node;
  }

  open(index) {
    let items = this.props.info.files.map(file => ({
      src: `/task/${this.props.info.id}/preview/${file.index}`,
      title: `${this.props.info.title}[${file.fileName}]`,
      w: file.width,
      h: file.height
    }));

    let options = {
      history: false,
      focus: false,
      showAnimationDuration: 600,
      hideAnimationDuration: 200,
      shareEl: false,
      zoomEl: false,
      index: index
    };

    let gallery = new PhotoSwipe(this.pswp, PhotoSwipeUI_Default, items, options);    
    gallery.init();
  }

  componentDidMount() {
    this.props.fetchTaskFilesInfo(this.props.id);
  }

  componentWillUnmount() {
    this.props.cleanTaskInfo();
  }
}

const mapStateToProps = state => ({
  info: state.taskPreview
});

const mapDispatchToProps = dispatch => ({
  fetchTaskFilesInfo: (id) => dispatch(fetchTaskFilesInfo(id)),
  cleanTaskInfo: () => dispatch(cleanTaskInfo()),
  displayMessage: text => dispatch(messageActions.displayMessage(text))
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskPreview);