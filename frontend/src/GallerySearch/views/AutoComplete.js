import React from 'react';
import PropTypes from 'prop-types';
import Downshift from 'downshift';
import { withStyles } from 'material-ui/styles';
import suggestions from '../suggestions';

import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Chip from 'material-ui/Chip';
import {MenuItem} from 'material-ui/Menu';

const styles = theme => ({
  root: {
    // 
  },  
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0
  },
  sugList: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  selectedListWrap: {
    background: '#fafafa',
    overflowX: 'auto',
    paddingBottom: theme.spacing.unit,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  selectedList: {
    display: 'inline-flex',
    minWidth: '100%'
  },
  chip: {
    height: 28,
    '&:not(:first-child)': {
      marginLeft: theme.spacing.unit / 2
    }
  }
});

function getSuggestions(inputValue) {
  let count = 0;
  const match = str => str.toLowerCase().includes(inputValue.toLowerCase());
  return !inputValue ? [] : suggestions.filter(([e, c]) => 
  count < 6 && (match(e) || match(c)) && ++count
  );
}

class AutoComplete extends React.Component {

  constructor(props) {
    super(...arguments);
    this.state = {
      inputValue: props.inputValue,
      selectedItem: [],
      selectedListVisible: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      inputValue: nextProps.inputValue
    });
  }

  handleChange = item => {
    const {onInputValueChange, onSelectedTagsChange} = this.props;
    const valueChangeCb = () => onInputValueChange(this.state.inputValue);
    const selectedChangeCb = () => onSelectedTagsChange(this.state.selectedItem);

    this.setState({inputValue: ''}, valueChangeCb);   // 触发onInputValueChange

    if(!this.state.selectedItem.includes(item)) {
      this.setState({
        selectedItem: [...this.state.selectedItem, item]
      }, selectedChangeCb);   // 触发onSelectedTagsChange
    }
  }

  deleteSelectedItem = item => () => {
    const cb = () => this.props.onSelectedTagsChange(this.state.selectedItem);
    this.setState({
      selectedItem: [...this.state.selectedItem.filter(i => i !== item)]
    }, cb);   // 触发onSelectedTagsChange
  }

  handleInputChange = event => {
    const value = event.target.value;
    const cb = () => this.props.onInputValueChange(this.state.inputValue);
    this.setState({inputValue: value}, cb);      // 触发onInputValueChange
  };

  onClickSelectedList = () => {
    this.inputEl.focus();   // 如果用户点击了已选择项目列表，输入框重新获得焦点
  }

  onInputFocus = () => {
    clearTimeout(this.deferHiddenClock);  // 如果上一次onInputBlur还没执行，取消执行
    this.setState({selectedListVisible: true});
  }

  onInputBlur = () => {
    this.deferHiddenClock = setTimeout(() => {
      this.setState({selectedListVisible: false});
    }, 50);   // 留出短暂时间使用户有机会点击已选择项目列表
  }

  inputRef = el => {
    this.inputEl = el;
    this.props.inputRef(el);
  }

  render() {
    const {
      classes,
      className,
      disabled
    } = this.props;

    const {
      inputValue,
      selectedItem,
      selectedListVisible
    } = this.state;

    const InputProps = {
      classes: {
        root: classes.inputRoot
      },
      placeholder: selectedItem.length ? 
        '根据已选择的标签搜索' :
        '添加关键字与标签开始搜索'
      ,
      className: className,
      disabled: disabled,
      inputRef: this.inputRef,
      onChange: this.handleInputChange,
      onFocus: this.onInputFocus,
      onBlur: this.onInputBlur
    };

    const visible = selectedListVisible ? {} : {display: 'none'};

    return (
      <div className={classes.root}>
        <Downshift
          inputValue={inputValue}
          onChange={this.handleChange}
          selectedItem={selectedItem}
        >
          {({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue,
            highlightedIndex
          }) => (
            <div className={classes.container}>
              <TextField
                fullWidth
                InputProps={getInputProps(InputProps)}
              />
              <div className={classes.paper}>
                <div
                  className={classes.selectedListWrap}
                  style={{...visible}}
                  onClick={this.onClickSelectedList}
                >
                  <div className={classes.selectedList}>
                    {selectedItem.map(item => (
                      <Chip
                        key={item[0]}
                        className={classes.chip}
                        label={`${item[1]} (${item[0]})`}
                        onClick={this.deleteSelectedItem(item)}
                      />
                    ))}
                  </div>
                </div>
                {isOpen ? (
                  <Paper className={classes.sugList} square>
                    {getSuggestions(inputValue).map((suggestion, index) => (
                      <MenuItem
                        key={suggestion[0]}
                        component="div"
                        selected={index === highlightedIndex}
                        {...getItemProps({item: suggestion})}
                      >
                        {`${suggestion[1]} (${suggestion[0]})`}
                      </MenuItem>
                    ))}
                  </Paper>
                ) : null}
              </div>
            </div>
          )}
        </Downshift>
      </div>
    );
  }
}

AutoComplete.defaultProps = {
  className: '',
  disabled: false,
  inputRef: f => f,
  inputValue: '',
  onSelectedTagsChange: f => f,
  onInputValueChange: f => f
}

AutoComplete.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  inputRef: PropTypes.func,
  inputValue: PropTypes.string,
  onSelectedTagsChange: PropTypes.func,
  onInputValueChange: PropTypes.func
};

export default withStyles(styles)(AutoComplete);