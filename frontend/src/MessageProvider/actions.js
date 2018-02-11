import {DISPLAY_MESSAGE} from "./actionTypes";

// displayMessage通过react-thunk异步派发，而不是同步派发
// 因为displayMessage会在其他子组件的render等生命周期中被派发，
// 如果同步派发会改变store，导致其他子组件的render成为非纯函数
export const displayMessage = (text) => {
  return dispatch => {
    setTimeout(function() {
      dispatch({
      type: DISPLAY_MESSAGE,
      time: +new Date(),
      text: text
      });
    }, 0);
  }
};