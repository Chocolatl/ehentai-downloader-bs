import {DISPLAY_MESSAGE} from './actionTypes';

export default (state = {}, action) => {
  switch (action.type) {
    case DISPLAY_MESSAGE:
      return {
        time: action.time,
        text: action.text
      };
    default:
      return state;
  }
}