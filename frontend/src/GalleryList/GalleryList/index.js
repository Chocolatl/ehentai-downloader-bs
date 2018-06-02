import React from 'react';
import classnames from 'classnames';
import {withStyles} from 'material-ui/styles';

const styles = theme => ({
  root: {
    padding: '8px 0 0 0',
    margin: 0,
    listStyle: 'none',
  }
});

export default withStyles(styles)(({children, classes, className, rootRef}) => (
  <ul ref={rootRef} className={classnames(classes.root, className)}>{children}</ul>
));
