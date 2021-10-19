import { mapRangeValue } from '../utils/mapRangeValue';

export default class SoundManager {

    constructor (el, options = {}) {
        this.el = el;
        this.options = {
            frequencyRange: options.frequencyRange || [50, 1300],
            gainRange: options.gainRange || [0, 1],
            ...options,
        };

        this._isPlaying = false;

        this.ui = {
            container: this.el,
            resumeButton: this.el.querySelector('[data-sm-button-resume]'),
        };

        if (this.options.eventEmitter) this._eventEmitter = this.options.eventEmitter;

        this._setup();
    }

    _setup () {
        this._setupAudio();
        this._setupListeners();
    }

    _setupAudio () {
        this._audioContext = new window.AudioContext() || window.webkitAudioContext();
        this._oscillator = this._audioContext.createOscillator();
        this._values = {
            gain: this._audioContext.createGain(),
        };
        this._oscillator.connect(this._values.gain).connect(this._audioContext.destination);
        this._oscillator.start();
        this._pause();
    }

    /*
      Setting events listeners
    */
    _setupListeners () {
        this.ui.resumeButton.addEventListener('click', () => this._handleClickResumeButton());
        this._eventEmitter.on('mouseAreaUpdated', mouthArea => this._handleMouthAreaUpdated(mouthArea));
    }

    _handleClickResumeButton () {
        if (this._isPlaying) this._pause();
        else this._resume();
    }

    _handleMouthAreaUpdated (mouthArea) {
        if (typeof mouthArea !== 'number') return;
        this._updateFrequency(mouthArea);
    }

    _updateFrequency (inputValue) {
        this._oscillator.frequency.value = mapRangeValue(inputValue, 0, 9000, this.options.frequencyRange[0], this.options.frequencyRange[1]);
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
