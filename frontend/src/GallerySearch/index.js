import React from 'react';
import {connect} from 'react-redux';
import {actions as taskActions} from '../TaskList';
import {withStyles} from 'material-ui/styles';
import Tips from './views/Tips';
import Results from './views/Results';

import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import Icon from 'material-ui/Icon';
import Input from 'material-ui/Input';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
  },
  searchForm: {
    margin: '8px 16px',
  },
  inputWrap: {
    position: 'relative'
  },
  searchInput: {
    height: '40px',
    paddingRight: '42px'
  },
  searchButton: {
    position: 'absolute',
    right: 0,
    paddingBottom: 8
  },
  searchResult: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    '& > :first-child': {
      padding: '0 8px',
      flexGrow: 1
    }
  },
  tips: {
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    '& > p': {
      color: '#173c5a',
      margin: '6px'
    }
  },
  list: {
    overflowY: 'auto'
  }
});

const TaskSearch = withStyles(styles)(class extends React.Component {

  state = {
    snackOpen: false,
    snackMsg: '',
    start: false,
    startNext: false,
    isUrl: false,
    results: null
  };

  render() {
    const {classes, className, style} = this.props;

    return (
      <div style={style} className={classes.root + (className ? ' ' + className : '')}>
        <AppBar position="static">
          <Toolbar>
            <Typography className={classes.title} variant="title" color="inherit">
              Search
            </Typography>
          </Toolbar>
        </AppBar>

        <form className={classes.searchForm} onSubmit={this.onSearch}>
          <div className={classes.inputWrap}>
            <Input
              fullWidth
              className={classes.searchInput}
              inputRef={this.searchInputRef}
              disabled={this.state.start || this.state.startNext}
              onChange={this.onSearchInputChange}
            />
            <IconButton
              className={classes.searchButton}
              onClick={this.onSearch}
              disabled={this.state.start || this.state.startNext}
            >
              <Icon>{this.state.isUrl ? 'file_download' : 'search'}</Icon>
            </IconButton>
          </div>
        </form>
        
        <div className={classes.searchResult}>
          {
            (this.state.start || this.state.results) ? 
              <Results
                start={this.state.start}
                className={classes.list}
                onClickItem={this.onClickItem}
                results={this.state.results}
                onScrollToBottom={this.loadNextPage}
              /> : 
              <Tips className={classes.tips} />
          }
        </div>

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

  onSearchInputChange = () => {
    if(/^https?:\/\/e(-|x)hentai.org\/g[/0-9a-zA-Z]+$/.test(this.searchInput.value.trim())) {
      this.setState({isUrl: true});
    } else {
      this.setState({isUrl: false});
    }
  }

  searchInputRef = (el) => {
    this.searchInput = el;
  }

  onSearch = (ev) => {
    ev.preventDefault();    
    if(this.state.isUrl) {
      this.onClickItem(this.searchInput.value.trim());
      this.searchInput.value = '';
      return;
    }
    let keywords = this.searchInput.value.trim();
    this.setState({start: true});
    fetch('/eh/search?keywords=' + keywords)
      .then(res => res.json())
      .then(results => {
        this.setState({results});
      })
      .catch(err => this.setState({results: {errMsg: err.message}}))
      .then(() => this.setState({start: false}));
  }

  loadNextPage = () => {
    const {results} = this.state;
    
    if(!results || results.errMsg || results.page === results.maxPage) return;
    if(this.state.startNext === true) return;

    this.setState({startNext: true});
    fetch(`/eh/search?keywords=${results.keywords}&page=${results.page + 1}`)
      .then(res => res.json())
      .then(currentResults => {
        this.setState({ results: {...currentResults, items: [...results.items, ...currentResults.items]} });
      })
      .catch(err => {
        this.setState({ snackOpen: true, snackMsg: err.message });
      })
      .then(() => this.setState({startNext: false}));
  }

  onClickItem = (url) => {
    let done = (message) => this.setState({ snackOpen: true, snackMsg: message });
    this.props.addTaskItem(url, (info) => done('任务创建成功'), (info) => done(info.errMsg));
  }
});

const mapDispatchToProps = (dispatch) => ({
  fetchTaskList: () => dispatch(taskActions.fetchTaskList()),
  addTaskItem: (url, onSuccess, onFailure) => dispatch(taskActions.addTaskItem(url, onSuccess, onFailure))
});

export default connect(null, mapDispatchToProps)(TaskSearch);