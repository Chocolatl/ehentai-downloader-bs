import React from 'react';

import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';
import Fade from 'material-ui/transitions/Fade';
import Icon from 'material-ui/Icon';

class FadeMenu extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { anchorEl } = this.state;

    return (
      <div>
        <IconButton
          aria-owns={anchorEl ? 'fade-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <Icon>more_vert</Icon>
        </IconButton>
        <Menu
          id="fade-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          transition={Fade}
        >
          {
            this.props.options.map(([text, func]) => (
              <MenuItem
                key={text}
                onClick={() => {this.handleClose(); func();}}
              >
                {text}
              </MenuItem>
            ))
          }
        </Menu>
      </div>
    );
  }
}

export default FadeMenu;
