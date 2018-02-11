import React from 'react';
import {connect} from 'react-redux';
import {fetchTaskFilesInfo} from './actions';
import {actions as messageActions} from '../MessageProvider';
import './style.css';

class TaskPreview extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      currentIndex: 0
    }
    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
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
    let currentIndex = this.state.currentIndex;
    if(files.length === 0) {
      this.props.displayMessage('没有可以加载的东西');
      return null;
    }
    return (
      <div className="task-preview">
        <header>
          <h2 className="title">{title}[{files[currentIndex].fileName}]</h2>
          <nav className="page-nav-wrap">
          <div className="page-nav">
            <button className="prev" onClick={this.prev}>上一张</button>
            <span className="pos-info">{currentIndex + 1} / {files.length}</span>
            <button className="next" onClick={this.next}>下一张</button>
          </div>
          </nav>
        </header>
        <div className="view-area">
          <img src={`/task/${id}/preview/${files[currentIndex].index}`} alt={files[currentIndex].fileName} />
        </div>
      </div>
    )
  }

  prev() {
    if(this.state.currentIndex !== 0) {
      this.setState({
        currentIndex: this.state.currentIndex - 1
      });
    }
  }

  next() {
    if(this.state.currentIndex < this.props.info.files.length - 1) {
      this.setState({
        currentIndex: this.state.currentIndex + 1
      });
    }
  }

  componentDidMount() {
    this.props.fetchTaskFilesInfo(this.props.id);
  }
}

const mapStateToProps = state => ({
  info: state.taskPreview
});

const mapDispatchToProps = dispatch => ({
  fetchTaskFilesInfo: (id) => dispatch(fetchTaskFilesInfo(id)),
  displayMessage: text => dispatch(messageActions.displayMessage(text))
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskPreview);