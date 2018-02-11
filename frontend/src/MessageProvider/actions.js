import {DISPLAY_MESSAGE} from "./actionTypes";

export const displayMessage = (text) => ({
  type: DISPLAY_MESSAGE,
  time: +new Date(),
  text: text
});