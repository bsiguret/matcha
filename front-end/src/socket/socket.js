import io from 'socket.io-client';
import initListeners from './listeners/init';

const socket = io('ws://localhost:8082', {transports: ['websocket']});
const socketInit = initListeners;

export { socket, socketInit };