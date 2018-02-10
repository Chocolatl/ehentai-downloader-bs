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
    let isiE = navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;
    let fetchURL = isiE ? `/task/${id}/info?${+new Date()}` : `/task/${id}/info`;
    dispatch(fetchTaskInfoStarted());
    fetch(fetchURL).then(res => {
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