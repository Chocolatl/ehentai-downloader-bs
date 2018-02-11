import {FETCH_STARTED, FETCH_SUCCESS, FETCH_FAILURE, CLEAN_TASKINFO} from './actionTypes';

const fetchTaskInfoStarted = () => ({
  type: FETCH_STARTED
});

const fetchTaskInfoSuccess = (info) => ({
  type: FETCH_SUCCESS,
  info: info
});

const fetchTaskInfoFailure = (errMsg) => ({
  type: FETCH_FAILURE,
  info: {
    errMsg: errMsg || '获取详情失败'
  }
});

export const fetchTaskInfo = (id) => {
  return dispatch => {
    let isiE = navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;
    let fetchURL = isiE ? `/task/${id}/info?${+new Date()}` : `/task/${id}/info`;
    dispatch(fetchTaskInfoStarted());
    fetch(fetchURL).then(res => {
      return res.json().then(info => {
        if(info.errMsg) {
          dispatch(fetchTaskInfoFailure(info.errMsg));
        } else {
          dispatch(fetchTaskInfoSuccess(info));
        }
      });
    }).catch(err => {
      console.error(err);
      dispatch(fetchTaskInfoFailure(err.message));
    });
  }
}

export const cleanTaskInfo = () => ({
  type: CLEAN_TASKINFO
});