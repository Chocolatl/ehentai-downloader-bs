import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {fetchTaskList, retryTaskItem} from '../actions';
import Menu from './Menu';
import GalleryListItem from '../../GalleryList/GalleryListItem';

import Snackbar from 'material-ui/Snackbar';
import Chip from 'material-ui/Chip';

class TaskItem extends React.Component {

  state = {
    snackOpen: false,
    snackMsg: ''
  };

  toPreview = () => {
    this.props.history.push('/preview/' + this.props.id);
  }

  toInfo = () => {
    this.props.history.push('/info/' + this.props.id);
  }

  toDownload = () => {
    window.location.href = `/task/${this.props.id}/download`;
  }

  onClickRetry = () => {
    let done = (message) => {
      this.props.fetchTaskList();
      this.setState({ snackOpen: true, snackMsg: message });
    };
    this.props.retryTaskItem(this.props.id, () => done('任务创建成功'), (info) => done(info.errMsg));
  }

  handleSnackClose = () => {
    this.setState({ snackOpen: false });
  }

  render() {
    const { id, state, title, gurl } = this.props;
    const [stateText, stateColor] = ({
      'error'      : ['发生异常', '#FF7043'],
      'failure'    : ['下载失败', '#FF7043'],
      'success'    : ['下载成功', '#66BB6A'],
      'downloading': ['正在下载', '#29B6F6'],
      'waiting'    : ['等待下载', '#BDBDBD']
    })[state];

    let options = [['查看详情', this.toInfo]];
    if(state === 'success' || state === 'downloading')
      options.push(['在线预览', this.toPreview]);
    if(state === 'failure' || state === 'error')
      options.push(['重新下载', this.onClickRetry]);
    if(state === 'success')
      options.push(['下载文件', this.toDownload]);

    return (
      <GalleryListItem
        imgSrc={`/task/${id}/preview/0?thumb=yes`}
        onClick={this.toPreview}
        button={<Menu options={options} />}
      >
        <div>
          <div style={{lineHeight: 1.6}}>
            {title || gurl}
          </div>
          <Chip label={stateText} style={{height: 26, marginRight: 8, backgroundColor: stateColor}} />
          <Chip label={id} style={{height: 26}} />
        </div>

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.state.snackOpen}
          onClose={this.handleSnackClose}
          message={<span>{this.state.snackMsg}</span>}
          autoHideDuration={3000}
        />
      </GalleryListItem>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  fetchTaskList: () => dispatch(fetchTaskList()),
  retryTaskItem: (id, onSuccess, onFailure) => dispatch(retryTaskItem(id, onSuccess, onFailure))
});

export default connect(null, mapDispatchToProps)(withRouter(TaskItem));