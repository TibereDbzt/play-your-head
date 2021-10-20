import { mapRangeValue } from '../utils/mapRangeValue';

export default class SoundManager {

    constructor (el, options = {}) {
        this.el = el;
        this.options = {
            frequencyRange: options.frequencyRange || [50, 1300],
            gainRange: options.gainRange || [0, 1],
            ...options,
        };

        this._inputs = [];
        this._isPlaying = false;

        this.ui = {
            container: this.el,
            resumeButton: this.el.querySelector('[data-sm-button-resume]'),
        };

        if (this.options.eventEmitter) this._eventEmitter = this.options.eventEmitter;

        this._setup();
    }

    _setup () {
        // this._setupAudio();
        this._setupListeners();
    }

    _setupAudio () {
        this._audioContext = new window.AudioContext() || window.webkitAudioContext();
        this._oscillator = this._audioContext.createOscillator();
        this._oscillator.type = 'triangle';
        this._values = {
            gain: this._audioContext.createGain(),
        };
        this._oscillator.connect(this._values.gain).connect(this._audioContext.destination);
        this._oscillator.start();
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
        if (this._audioContext === undefined) this._setupAudio();
        else {
            if (this._isPlaying) this._pause();
            else this._resume();
        }
    }

    _handleMouthAreaUpdated (mouthArea) {
        if (!this._audioContextIsRunning() || typeof mouthArea !== 'number') return;
        // this._updateFrequency(mouthArea);
    }

    _handleDistanceLeftEyeBrowUpdated (distanceLeftEyeBrow) {
        if (!this._audioContextIsRunning() || typeof distanceLeftEyeBrow !== 'number') return;
        this._updateFrequency(distanceLeftEyeBrow);
    }

    _updateFrequency (inputValue) {
        // this._oscillator.frequency.value = mapRangeValue(inputValue, 0, 9000, this.options.frequencyRange[0], this.options.frequencyRange[1]);
        this._oscillator.frequency.value = mapRangeValue(inputValue, 21, 38, this.options.frequencyRange[0], this.options.frequencyRange[1]);
        // console.log(this._oscillator.frequency.value);
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

    _audioContextIsRunning () {
        return this._audioContext && this._audioContext.state === 'running';
    }

}
