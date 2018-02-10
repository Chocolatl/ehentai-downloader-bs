import {FETCH_STARTED, FETCH_SUCCESS, FETCH_FAILURE} from './actionTypes';

const fetchTaskInfoStarted = () => ({
  type: FETCH_STARTED
});

const fetchTaskInfoSuccess = (info) => ({
  type: FETCH_SUCCESS,
  info: info
});

const fetchTaskInfoFailure = () => ({
  type: FETCH_FAILURE,
  info: {
    errMsg: '获取详情失败'
  }
});

export const fetchTaskInfo = (id) => {
  return dispatch => {
    dispatch(fetchTaskInfoStarted());
    fetch(`/task/${id}/info`).then(res => {
      if (res.status !== 200) {
        return dispatch(fetchTaskInfoFailure());
      }
      res.json().then(info => {
        dispatch(fetchTaskInfoSuccess(info));
      }).catch(err => {
        console.error(err);
        dispatch(fetchTaskInfoFailure());
      });
    }).catch(err => {
      console.error(err);
      dispatch(fetchTaskInfoFailure());
    });
  }
}