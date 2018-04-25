import React from 'react';
import TaskInfo from './view/TaskInfo';
import { withStyles } from 'material-ui/styles';
import { withRouter } from 'react-router-dom';

import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import Icon from 'material-ui/Icon';

const styles = theme => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		height: '100vh',
		'& > :last-child:not(:first-child)': {
			overflowY: 'auto',
			flexGrow: 1
		}
	},
	toolBar: {
		display: 'flex'
	},
	title: {
		flexGrow: 1
	}
});

export default withRouter(withStyles(styles)(({ classes, id, history }) => (
	<div className={classes.root}>
		<AppBar position="static">
			<Toolbar>
				<Typography className={classes.title} variant="title" color="inherit">
					Info
				</Typography>
				<IconButton color="inherit" style={{marginRight: -16}} onClick={history.goBack}>
					<Icon>clear</Icon>
				</IconButton>
			</Toolbar>
		</AppBar>
		<TaskInfo id={id} />
	</div>
)));