import { createStore, combineReducers, applyMiddleware, compose} from 'redux';
import { authReducer } from '../redux/reducers/auth';
import { userReducer } from '../redux/reducers/user';
import { roomsReducer } from '../redux/reducers/rooms';
import { notifReducer } from '../redux/reducers/notif';
import thunk from 'redux-thunk';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const rootReducer = combineReducers({
	authReducer,
	userReducer,
	roomsReducer,
	notifReducer
});


export const store = createStore(
	rootReducer,
	composeEnhancers(
	applyMiddleware(
		thunk,
	)
));