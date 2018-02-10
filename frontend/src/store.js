import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import {reducer as taskListReducer} from './TaskList';
import {reducer as taskInfoReducer} from './TaskInfo';
import {reducer as taskPreviewReducer} from './TaskPreview';

const reducer = combineReducers({
  taskList: taskListReducer,
  taskInfo: taskInfoReducer,
  taskPreview: taskPreviewReducer
});
const store = createStore(reducer, applyMiddleware(thunk));

export default store;