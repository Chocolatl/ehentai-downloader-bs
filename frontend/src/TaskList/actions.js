import {FETCH_STARTED, FETCH_SUCCESS, FETCH_FAILURE} from './actionTypes';

const fetchTaskListStarted = () => ({
  type: FETCH_STARTED
});

const fetchTaskListSuccess = (list) => ({
  type: FETCH_SUCCESS,
  list: list
});

const fetchTaskListFailure = (errMsg) => ({
  type: FETCH_FAILURE,
  errMsg: errMsg
});

export const fetchTaskList = () => dispatch => {
  let isiE = navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;
  let url = `/tasks/list?` + (isiE ? +new Date() : '');

  dispatch(fetchTaskListStarted());
  fetch(url).then(res => {
    if (res.status !== 200) return dispatch(fetchTaskListFailure(`服务器返回了期望之外的状态码(${res.status})`));
    return res.json().then(list => dispatch(fetchTaskListSuccess(list)));
  }).catch(err => {
    dispatch(fetchTaskListFailure(err.message));
  });
}

let doNothing = () => null;

export const addTaskItem = (url, onSuccess = doNothing, onFailure = doNothing) => dispatch => {
  fetch('/task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({url})
  }).then(res => {
    if(res.status === 500) throw new Error('服务器错误');
    return res.json();
  }).then(info => {
    info.id ? onSuccess({id: info.id}) : onFailure({errMsg: info.errMsg});
  }).catch(err => {
    onFailure({errMsg: err.message});
  });
}

export const retryTaskItem = (id, onSuccess = doNothing, onFailure = doNothing) => dispatch => {
  fetch('/task/' + id, {
    method: 'PUT'
  }).then(res => {
    if(res.status === 204) return onSuccess();
    if(res.status === 500) throw new Error('服务器错误');
    return res.json().then(info => {
      throw new Error(info.errMsg);
    });
  }).catch(err => {
    onFailure({errMsg: err.message});
  });
}