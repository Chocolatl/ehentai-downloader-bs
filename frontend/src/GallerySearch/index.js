import React from 'react';
import {connect} from 'react-redux';
import {actions as taskActions} from '../TaskList';
import {withStyles} from 'material-ui/styles';

import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import Icon from 'material-ui/Icon';
import Input from 'material-ui/Input';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import GalleryList from '../GalleryList/GalleryList';
import GalleryListItem from '../GalleryList/GalleryListItem';

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
    isUrl: false,
    results: null
  };

  Tips = ({className = ''}) => (
    <div className={className}>
      <p>请输入关键字进行搜索，如：</p>
      <p>東方Project chinese、chino kafuu chinese</p>
      <p>或输入完整的Gallery URL，如：</p>
      <p>https://e-hentai.org/g/1177637/06dd559f50、</p>
      <p>https://exhentai.org/g/1177637/06dd559f50</p>
    </div>
  );

  Results = ({className = '', onClickItem}) => {
    const {results} = this.state;
    const style = {
      textAlign: 'center',
      marginTop: 40
    };
    if(this.state.start) {
      return <div style={style}>正在搜索...</div>
    } else if (results.errMsg) {
      return <div style={style}>{results.errMsg}</div>
    } else if (results.items.length === 0) {
      return <div style={style}>搜索结果为空</div>
    } else {
      return (
        <GalleryList className={className}>
          {
            results.items.map(item => {
              let Button = () => (
                <IconButton onClick={() => onClickItem(item.url)}>
                  <Icon>file_download</Icon>
                </IconButton>
              );
              return (
                <GalleryListItem imgSrc={item.cover} button={<Button />}>
                  <div style={{lineHeight: 1.4}}>{item.title}</div>
                </GalleryListItem>
              )
            })
          }
        </GalleryList>
      )
    }
  };

  render() {
    const {classes} = this.props;
    return (
      <div className={classes.root}>
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
              disabled={this.state.start}
              onChange={this.onSearchInputChange}
            />
            <IconButton className={classes.searchButton} onClick={this.onSearch} disabled={this.state.start}>
              <Icon>{this.state.isUrl ? 'file_download' : 'search'}</Icon>
            </IconButton>
          </div>
        </form>
        
        <div className={classes.searchResult}>
          {
            (this.state.start || this.state.results) ? 
              <this.Results className={classes.list} onClickItem={this.onClickItem} /> : 
              <this.Tips className={classes.tips} />
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
    // BUG：当在搜索未完成时切换选项卡导致组件被卸载，在完成搜索时控制台会报错
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