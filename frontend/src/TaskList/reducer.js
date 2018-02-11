import {FETCH_SUCCESS, FETCH_FAILURE} from './actionTypes';

export default (state = {list: []}, action) => {
  switch (action.type) {
    case FETCH_SUCCESS:
      return {
        list: action.list,
        errMsg: undefined
      };
    case FETCH_FAILURE:
      return {
        list: state.list,
        errMsg: action.errMsg
      }
    default:
      return state;
  }
}