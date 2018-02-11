import {FETCH_STARTED, FETCH_SUCCESS, FETCH_FAILURE} from './actionTypes';

const fetchTaskFilesStarted = () => ({
  type: FETCH_STARTED
});

const fetchTaskFilesSuccess = (info) => ({
  type: FETCH_SUCCESS,
  info: {
    id: info.id,
    state: info.state,
    title: info.title,
    files: info.files
  }
});

const fetchTaskFilesFailure = () => ({
  type: FETCH_FAILURE,
  info: {
    errMsg: '获取详情失败'
  }
});

export const fetchTaskFilesInfo = (id) => {
  return dispatch => {
    let isiE = navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;
    let fetchURL = isiE ? `/task/${id}/info?${+new Date()}` : `/task/${id}/info`;
    dispatch(fetchTaskFilesStarted());
    fetch(fetchURL).then(res => {
      if (res.status !== 200) {
        return dispatch(fetchTaskFilesFailure());
      }
      res.json().then(info => {
        dispatch(fetchTaskFilesSuccess(info));
      }).catch(err => {
        console.error(err);
        dispatch(fetchTaskFilesFailure());
      });
    }).catch(err => {
      console.error(err);
      dispatch(fetchTaskFilesFailure());
    });
  }
}