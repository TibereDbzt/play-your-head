import '../styles/main.sass';
import WebcamFaceRecognition from './components/WebcamFaceRecognition';
import SoundManager from './components/SoundManager';

const EventEmitter = require('events');

const init = () => {
    const globalEmitter = new EventEmitter();
    const mainElement = document.querySelector('main');
    new WebcamFaceRecognition(mainElement, {  eventEmitter: globalEmitter });
    new SoundManager(mainElement, { eventEmitter: globalEmitter });
};

document.addEventListener('DOMContentLoaded', () => init());
