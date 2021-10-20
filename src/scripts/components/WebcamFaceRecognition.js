import * as faceAPI from 'face-api.js';
import '../../styles/04_components/_webcam.sass';

import { getAreaFromCoords } from '../utils/getAreaFromCoords';

export default class WebcamFaceRecognition {

    constructor (el, options = {}) {
        this.el = el;
        this.options = {
            ...options,
        };

        if (this.options.eventEmitter) this._eventEmitter = this.options.eventEmitter;

        this._faceLandMarks = {
            mouth: {
                area: 0,
            },
            leftEyeBrown: {
                distance: 0,
            }
        };

        this.ui = {
            container: this.el,
            video: this.el.querySelector('[data-webcam-video]'),
            canvas: this.el.querySelector('[data-webcam-canvas]'),
        };

        this._setup();
    }

    _setup () {
        Promise.all([
            faceAPI.nets.tinyFaceDetector.loadFromUri('./assets/models'),
            faceAPI.nets.faceLandmark68Net.loadFromUri('./assets/models'),
        ]).then(() => this._setupWebcam());
        this._setupElements();
        this._setupListeners();
    }

    /*
      Sets default elements states, styles, attributes, etc.
    */
    _setupElements () {
    }

    /*
      Sets events listeners
    */
    _setupListeners () {
        this.ui.video.addEventListener('play', () => this._setupCanvas());
        this._eventEmitter.on('mouthAreaCalculated', mouthArea => this._handleMouthAreaCalculated(mouthArea));
        this._eventEmitter.on('distanceLeftEyeBrowCalculated', distanceLeftEyeBrow => this._handleDistanceLeftEyeBrowCalculated(distanceLeftEyeBrow));
    }

    _handleMouthAreaCalculated (mouthArea) {
        if (typeof mouthArea !== 'number') return;
        this._faceLandMarks.mouth.area = mouthArea;
        this._eventEmitter.emit('mouthAreaUpdated', this._faceLandMarks.mouth.area);
    }

    _handleDistanceLeftEyeBrowCalculated (distanceLeftEyeBrow) {
        if (typeof distanceLeftEyeBrow !== 'number') return;
        this._faceLandMarks.leftEyeBrown.distance = distanceLeftEyeBrow;
        this._eventEmitter.emit('distanceLeftEyeBrowUpdated', this._faceLandMarks.leftEyeBrown.distance);
    }

    _setupWebcam () {
        navigator.getUserMedia(
            { video: {} },
            stream => this.ui.video.srcObject = stream,
            err => console.error(err)
        );
    }

    _setupCanvas () {
        // this.ui.canvas = faceAPI.createCanvasFromMedia(this.ui.video);
        // this.ui.container.append(this.ui.canvas);

        this._detectFace();
    }

    _detectFace () {
        faceAPI.detectSingleFace(this.ui.video, new faceAPI.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .then(response => {
                if (!response || !response.landmarks) return;
                this._fullFaceDescriptions = response;
                this._draw();

                const mouthCoords = this._fullFaceDescriptions.landmarks.getMouth();
                const mouthArea = getAreaFromCoords(mouthCoords);
                this._eventEmitter.emit('mouthAreaCalculated', mouthArea);
                const leftEyeBrowCoords = this._fullFaceDescriptions.landmarks.getLeftEyeBrow();

                const leftEyeCoords = this._fullFaceDescriptions.landmarks.getLeftEye();
                const distanceLeftEyeBrow = this._calculateDistanceOfEyeBrow(leftEyeBrowCoords, leftEyeCoords);
                this._eventEmitter.emit('distanceLeftEyeBrowCalculated', distanceLeftEyeBrow);
            });
        requestAnimationFrame(() => this._detectFace());
    }

    _draw () {
        let displaySize = {
            width: this.ui.canvas.width,
            height: this.ui.canvas.height,
        };

        const resizeDetection = faceAPI.resizeResults(
            this._fullFaceDescriptions,
            displaySize
        );

        this.ui.canvas
            .getContext('2d')
            .clearRect(0, 0, displaySize.width, displaySize.height);

        faceAPI.draw.drawDetections(this.ui.canvas, resizeDetection);
        faceAPI.draw.drawFaceLandmarks(this.ui.canvas, resizeDetection);
    }

    _calculateDistanceOfEyeBrow (eyeBrowCoords, eyeCoords) {
        const eyeBrowCoordsY = [];
        const eyeCoordsY = [];
        eyeBrowCoords.forEach(point => eyeBrowCoordsY.push(point.y));
        eyeCoords.forEach(point => eyeCoordsY.push(point.y));
        const eyeBrowAverageY = eyeBrowCoordsY.reduce((a, b) => a + b) / eyeBrowCoordsY.length;
        const eyeAverageY = eyeCoordsY.reduce((a, b) => a + b) / eyeCoordsY.length;
        return eyeAverageY - eyeBrowAverageY;
    }

    getAreaOf (faceLandmark) {
        // return this._faceLandMarksAreas[faceLandmark] || null;
    }

}
