import {FETCH_STARTED, FETCH_SUCCESS, FETCH_FAILURE} from './actionTypes';

const fetchTaskListStarted = () => ({
  type: FETCH_STARTED
});

const fetchTaskListSuccess = (list) => ({
  type: FETCH_SUCCESS,
  list: list
});

const fetchTaskListFailure = () => ({
  type: FETCH_FAILURE
});

export const fetchTaskList = () => {
  return dispatch => {
    dispatch(fetchTaskListStarted());
    fetch('/tasks/list').then(res => {
      if (res.status !== 200) {
        return dispatch(fetchTaskListFailure());
      }
      res.json().then(list => {
        dispatch(fetchTaskListSuccess(list));
      }).catch(err => {
        console.log(err);
        dispatch(fetchTaskListFailure());
      });
    }).catch(err => {
      console.error(err);
      dispatch(fetchTaskListFailure());
    });
  }
}

export const addTaskItem = (url) => {
  return dispatch => {
    fetch('/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url
      })
    }).then(res => {
      dispatch(fetchTaskList());
    }).catch(err => {
      console.error(err);
    });
  }
}