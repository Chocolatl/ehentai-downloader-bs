import React from 'react';
import { connect } from 'react-redux';
import { fetchTaskList } from '../actions';
import TaskItem from './TaskItem';
import { withRouter } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';

import Snackbar from 'material-ui/Snackbar';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';

import GalleryList from '../../GalleryList/GalleryList';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
  },
  taskList: {
    flexGrow: 1,
    overflowY: 'auto'
  }
});

const TaskList = withStyles(styles)(withRouter(class extends React.Component {
  state = {
    snackOpen: false,
    snackMsg: ''
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      snackOpen: !!nextProps.errMsg,
      snackMsg: nextProps.errMsg
    });
  }

  render() {
    const {classes, className, hidden} = this.props;
    
    return (
      <div
        className={classes.root + (className ? ' ' + className : '')}
        style={hidden ? {display: 'none'} : {}}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography className={classes.title} variant="title" color="inherit">
              Tasks
            </Typography>
          </Toolbar>
        </AppBar>

        <GalleryList className={classes.taskList}>
          {
            this.props.list.map(item => (
              <TaskItem
                key={item.id}
                id={item.id}
                state={item.state}
                title={item.title}
                gurl={item.gurl}
              />
            ))
          }
        </GalleryList>

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

  handleSnackClose = () => {
    this.setState({ snackOpen: false });
  }

  componentDidMount() {
    this.props.fetchTaskList();
    this.intervalID = setInterval(this.props.fetchTaskList, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }
}));

const mapStateToProps = state => ({
  list: state.taskList.list,
  errMsg: state.taskList.errMsg
});

const mapDispatchToProps = dispatch => ({
  fetchTaskList: () => dispatch(fetchTaskList())
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);