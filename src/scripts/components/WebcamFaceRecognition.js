import * as faceAPI from 'face-api.js';

import { getAreaFromCoords } from '../utils/getAreaFromCoords';

export default class WebcamFaceRecognition {

    constructor (el, options = {}) {
        this.el = el;
        this.options = {
            ...options,
        };

        if (this.options.eventEmitter) this._eventEmitter = this.options.eventEmitter;

        this._faceLandMarksAreas = {
            mouth: 0,
        };

        this.ui = {
            container: this.el,
            video: this.el.querySelector('[data-webcam-feedback]'),
        };

        this._setup();
    }

    _setup () {
        Promise.all([
            faceAPI.nets.tinyFaceDetector.loadFromUri('./assets/models'),
            faceAPI.nets.faceLandmark68Net.loadFromUri('./assets/models'),
            // faceAPI.nets.faceRecognitionNet.loadFromUri('./assets/models'),
            // FaceAPI.nets.faceExpressionNet.loadFromUri('./assets/models')
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
        this._eventEmitter.on('mouseAreaCalculated', mouthArea => this._handleNewMouseArea(mouthArea));
    }

    _handleNewMouseArea (mouthArea) {
        if (typeof mouthArea !== 'number') return;
        this._faceLandMarksAreas.mouth = mouthArea;
        this._eventEmitter.emit('mouseAreaUpdated', this._faceLandMarksAreas.mouth);
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
                const mouthCoords = this._fullFaceDescriptions.landmarks.getMouth();
                const mouthArea = getAreaFromCoords(mouthCoords);
                this._eventEmitter.emit('mouseAreaCalculated', mouthArea);
            });
        requestAnimationFrame(() => this._detectFace());
    }

    getAreaOf (faceLandmark) {
        return this._faceLandMarksAreas[faceLandmark] || null;
    }

}
