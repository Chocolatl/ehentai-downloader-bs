import {FETCH_SUCCESS} from './actionTypes';

export default (state = [], action) => {
  switch (action.type) {
    case FETCH_SUCCESS:
      return action.list;
    default:
      return state;
  }
}