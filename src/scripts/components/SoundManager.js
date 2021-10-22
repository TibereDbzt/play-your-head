import { mapRangeValue } from '../utils/mapRangeValue';
import { lerp } from '../utils/lerp';

export default class SoundManager {

    constructor (el, options = {}) {
        this.el = el;
        this.options = {
            audiosUrls: options.audioUrls || [],
            gainBoostRange: options.gainBoostRange || [0, 2],
            ...options,
        };

        this.ui = {
            container: this.el,
            startButton: this.el.querySelector('[data-sm-button-start]'),
            resumeButton: this.el.querySelector('[data-sm-button-resume]'),
            canvas: this.el.querySelector('[data-sm-canvas]'),
        };

        this._isReady = false;
        this._isPlaying = false;
        this._gainBoost = 0;
        this._maxGainTrigger = false;

        if (this.options.eventEmitter) this._eventEmitter = this.options.eventEmitter;

        this._setup();
    }

    _setup () {
        this._setupCanvas();
        this._setupListeners();
    }

    _setupCanvas () {
        this.ui.canvas.width = this.ui.container.getBoundingClientRect().width;
        this.ui.canvas.height = 300;
        this._gap = 2;
        this._bandsLarger = this.ui.canvas.width / this.options.audiosUrls.length - this._gap;
        this._contextCanvas = this.ui.canvas.getContext('2d');
    }

    /*
      Setting events listeners
    */
    _setupListeners () {
        this.ui.resumeButton.addEventListener('click', () => this._handleClickResumeButton());
        this._eventEmitter.on('mouthAreaUpdated', mouthArea => this._handleMouthAreaUpdated(mouthArea));
        this._eventEmitter.on('distanceLeftEyeBrowUpdated', distanceLeftEyeBrow => this._handleDistanceLeftEyeBrowUpdated(distanceLeftEyeBrow));
    }

    _handleClickResumeButton () {
        if (this._isPlaying) this._pause();
        else this._resume();
    }

    _handleMouthAreaUpdated (mouthArea) {
        if (!this._isReady || typeof mouthArea !== 'number') return;
        const targetVoice = Math.round(mapRangeValue(mouthArea, 1400, 5000, 0, 11));
        this._updateGainVoices(targetVoice);
    }

    _updateGainVoices (targetVoice) {
        this._voices.forEach((voice, i) => {
            voice.gainNode.gain.value = ((1 - (Math.abs(targetVoice - i) * 0.1))) * this._gainBoost;
        });
    }

    _handleDistanceLeftEyeBrowUpdated (distanceLeftEyeBrow) {
        if (!this._isReady || typeof distanceLeftEyeBrow !== 'number') return;
        this._gainBoost = mapRangeValue(distanceLeftEyeBrow, 23, 38, this.options.gainBoostRange[0], this.options.gainBoostRange[1]);
        if (this._isPlaying && !this._maxGainTrigger && this._gainBoost > 1.5) {
            console.log(this._maxGainTrigger);
            this._maxGainTrigger = true;
            this._eventEmitter.emit('maxGain');
        }
    }

    setupAudio () {
        const BaseAudioContext = window.AudioContext || window.webkitAudioContext;
        this._audioContext = new BaseAudioContext();
        this._pause();
        const voicesPromises = [];
        this.options.audioUrls.forEach(audioUrl => {
            voicesPromises.push(this._createVoice(audioUrl.sample));
        });
        Promise.all(voicesPromises).then(voices => {
            this._voices = voices;
            this._isReady = true;
            this._draw();
        });
    }

    _createVoice (audioUrl) {
        const player = this._audioContext.createBufferSource();
        const gainNode = this._audioContext.createGain();
        player.connect(gainNode);
        gainNode.connect(this._audioContext.destination);
        return fetch(audioUrl)
            .then(response => response.arrayBuffer())
            .then(binAudio => this._audioContext.decodeAudioData(binAudio))
            .then(buffer => {
                player.buffer = buffer;
                player.loop = true;
                player.start();
                return {
                    player: player,
                    gainNode: gainNode,
                    lastGainValue: 0,
                };
            });
    }

    _draw () {
        const baseHeight = this._isPlaying ? 200 : 0;
        if (!this._voices) return;
        this._contextCanvas.fillStyle = 'white';
        this._contextCanvas.fillRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);

        this._contextCanvas.fillStyle = 'black';
        this._voices.forEach((voice, i) => {
            const height = lerp(voice.gainNode.gain.value * baseHeight, voice.lastGainValue, 0.4);
            voice.lastGainValue = height;
            this._contextCanvas.fillRect(this._bandsLarger * i + this._gap * i, this.ui.canvas.height, this._bandsLarger - this._gap, -height);
        });
        requestAnimationFrame(() => this._draw());
    }

    _pause () {
        this._audioContext.suspend().then(() => {
            this._isPlaying = false;
            this.ui.resumeButton.innerText = 'play';
        });
    }

    _resume () {
        this._audioContext.resume().then(() => {
            this._isPlaying = true;
            this.ui.resumeButton.innerText = 'pause';
        });
    }

}
