import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import {reducer as taskListReducer} from './TaskList';
import {reducer as messageProviderReducer} from './MessageProvider';

const reducer = combineReducers({
  taskList: taskListReducer,
  messageProvider: messageProviderReducer
});
const store = createStore(reducer, applyMiddleware(thunk));

export default store;