import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import {reducer as taskListReducer} from './TaskList';

const reducer = combineReducers({
  taskList: taskListReducer
});
const store = createStore(reducer, applyMiddleware(thunk));

export default store;