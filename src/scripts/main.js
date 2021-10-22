import '../styles/main.sass';
import '../styles/04_components/_loader.sass';
import WebcamFaceRecognition from './components/WebcamFaceRecognition';
import SoundManager from './components/SoundManager';

const EventEmitter = require('events');

const audioUrls = [
    {
        name: '01',
        main: './assets/audio/01/01.mp3',
        sample: './assets/audio/01/01.mp3',
    },
    {
        name: '02',
        main: './assets/audio/02/02.mp3',
        sample: './assets/audio/02/02.mp3',
    },
    {
        name: '03',
        main: './assets/audio/03/03.mp3',
        sample: './assets/audio/03/03.mp3',
    },
    {
        name: '04',
        main: './assets/audio/04/04.mp3',
        sample: './assets/audio/04/04.mp3',
    },
    {
        name: '05',
        main: './assets/audio/05/05.mp3',
        sample: './assets/audio/05/05.mp3',
    },
    {
        name: '06',
        main: './assets/audio/06/06.mp3',
        sample: './assets/audio/06/06.mp3',
    },
    {
        name: '07',
        main: './assets/audio/07/07.mp3',
        sample: './assets/audio/07/07.mp3',
    },
    {
        name: '08',
        main: './assets/audio/08/08.mp3',
        sample: './assets/audio/08/08.mp3',
    },
    {
        name: '09',
        main: './assets/audio/09/09.mp3',
        sample: './assets/audio/09/09.mp3',
    },
    {
        name: '10',
        main: './assets/audio/10/10.mp3',
        sample: './assets/audio/10/10.mp3',
    },
    {
        name: '11',
        main: './assets/audio/11/11.mp3',
        sample: './assets/audio/11/11.mp3',
    },
    {
        name: '12',
        main: './assets/audio/12/12.mp3',
        sample: './assets/audio/12/12.mp3',
    },
];

const mainElement = document.querySelector('main');

const loader = () => {
    const loaderContainer = document.querySelector('[data-loader]');
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 80;
    canvas.style.width = `${canvas.width / 2}px`
    canvas.style.height = `${canvas.height / 2}px`
    const context = canvas.getContext('2d');
    let i = 0;

    const orbit = (centerx, centery, angle, distance) => {
        const x = centerx + Math.sin(angle) * distance;
        const y = centery + Math.cos(angle) * distance;
        return { x, y };
    };

    const trigoAngle = ([cx, cy], [mousex, mousey]) =>
        Math.atan2(mousex - cx, mousey - cy);

    const loop = () => {
        console.log('dsfq');
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const movingPoint = new Path2D();
        const orbitLeft = orbit(canvas.width / 4, canvas.height / 2, i / 4, canvas.width / 8);
        if (orbitLeft.x === canvas.width / 2) {
            console.log('middle');
        }
        movingPoint.arc(orbitLeft.x, orbitLeft.y, 4, 0, 2 * Math.PI, true);

        // const movingPointAngle = trigoAngle([canvas.width / 4, canvas.height / 2], [mouse.x, mouse.y])

        context.fillStyle = 'black';
        context.fill(movingPoint);

        i++;
        requestAnimationFrame(loop);
    };

    loaderContainer.append(canvas);
    loop();
};

const takeScreenshot = () => {
    fetch('http://localhost:3000/screenshot', {
        method: 'POST',
    })
        .then(response => {
            console.log(response);
            const screenshotMessageElement = document.createElement('div');
            screenshotMessageElement.innerText = 'screenshot taken!';
            mainElement.append(screenshotMessageElement);
        })
        .catch(error => console.log(error));
};

const init = () => {
    // loader();
    const globalEmitter = new EventEmitter();
    new WebcamFaceRecognition(mainElement, {
        eventEmitter: globalEmitter
    });
    const soundManager = new SoundManager(mainElement, {
        audioUrls: audioUrls,
        eventEmitter: globalEmitter
    });

    const loaderContainer = document.querySelector('[data-loader]');
    const loaderButton = document.querySelector('[data-loader-button]');
    globalEmitter.on('faceRecognitionReady', () => {
        console.log('ready');
        loaderButton.innerText = 'Start';
        loaderButton.addEventListener('click', () => {
            loaderContainer.style.display = 'none';
            soundManager.setupAudio();
        });
    });
    // globalEmitter.on('maxGain', () => takeScreenshot());
};

document.addEventListener('DOMContentLoaded', () => init());
