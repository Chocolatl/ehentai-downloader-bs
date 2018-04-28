import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import ButtonBase from 'material-ui/ButtonBase';

const styles = theme => ({
  root: {
    height: 120,
    display: 'flex',
    marginBottom: 8
  },
  imgWrap: {
    height: 120,
    width: 90,
    overflow: 'hidden',
    float: 'left',
    display: 'flex',
    alignItems: 'center',
    '& > img': {
      width: '100%'
    }
  },
  buttonBase: {
    flexGrow: 1,
    width: 100,
    padding: '0 8px',
    wordBreak: 'break-all'
  },
  rightButton: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }
});

export default withStyles(styles)(class extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.imgSrc !== this.props.imgSrc ||
      nextProps.button !== this.props.button ||
      nextProps.onClick !== this.props.onClick ||
      nextProps.children !== this.props.children
    ) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    const {classes} = this.props;
    return (
      <li className={classes.root}>
        <div className={classes.imgWrap}>
          <img src={this.props.imgSrc} alt="cover" />
        </div>

        <ButtonBase onClick={this.props.onClick} className={classes.buttonBase}>
          {this.props.children}
        </ButtonBase>

        <div className={classes.rightButton}>
          {this.props.button}
        </div>        
      </li>
    )
  }

  static propTypes = {
    imgSrc: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    children: PropTypes.node,
    button: PropTypes.node
  }
});
