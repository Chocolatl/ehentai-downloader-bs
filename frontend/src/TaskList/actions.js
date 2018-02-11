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

export const fetchTaskList = () => {
  return dispatch => {
    let isiE = navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;
    let fetchURL = isiE ? '/tasks/list?' + +new Date() : '/tasks/list';
    dispatch(fetchTaskListStarted());
    fetch(fetchURL).then(res => {
      if (res.status !== 200) {
        return dispatch(fetchTaskListFailure(`服务器返回了期望之外的状态码(${res.status})`));
      }
      return res.json().then(list => {
        dispatch(fetchTaskListSuccess(list));
      });
    }).catch(err => {
      console.error(err);
      dispatch(fetchTaskListFailure(err.message));
    });
  }
}

export const addTaskItem = (url, onSuccess = (f) => f, onFailure = (f) => f) => {
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
      if(res.status === 201) {
        return res.json().then(info => {
          onSuccess({id: info.id});
        });
      } else {
        return res.json().then(info => {
          onFailure({errMsg: info.errMsg});
        });
      }
    }).catch(err => {
      onFailure({errMsg: err.message});
      console.error(err);
    });
  }
}

export const retryTaskItem = (id, onSuccess = (f) => f, onFailure = (f) => f) => {
  return dispatch => {
    fetch('/task/' + id, {
      method: 'PUT'
    }).then(res => {
      dispatch(fetchTaskList());
      if(res.status === 204) {
        return onSuccess();
      } else {
        return res.json().then(info => {
          onFailure({errMsg: info.errMsg});
        });
      }
    }).catch(err => {
      onFailure({errMsg: err.message});
      console.error(err);
    });
  }
}