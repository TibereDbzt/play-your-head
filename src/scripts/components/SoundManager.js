import { mapRangeValue } from '../utils/mapRangeValue';

export default class SoundManager {

    constructor (el, options = {}) {
        this.el = el;
        this.options = {
            inputsNumber: options.inputsNumber || 1,
            frequencyRange: options.frequencyRange || [50, 1300],
            gainRange: options.gainRange || [0, 1],
            ...options,
        };

        this._oscillators = [];
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
        this._values = {
            gain: this._audioContext.createGain(),
        };
        for (let i = 0; i < this.options.inputsNumber; i++) {
            const osc = this._audioContext.createOscillator();
            osc.connect(this._values.gain).connect(this._audioContext.destination);
            osc.start();
            this._oscillators.push(osc);
        }
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
        this._updateFrequency(this._oscillators[0], {
            current: mouthArea,
            min: 0,
            max: 9000,
        });
    }

    _handleDistanceLeftEyeBrowUpdated (distanceLeftEyeBrow) {
        if (!this._audioContextIsRunning() || typeof distanceLeftEyeBrow !== 'number') return;
        this._updateFrequency(this._oscillators[1], {
            current: distanceLeftEyeBrow,
            min: 21,
            max: 38,
        });
    }

    _updateFrequency (oscillator, values) {
        oscillator.frequency.value = mapRangeValue(values.current, values.min, values.max, this.options.frequencyRange[0], this.options.frequencyRange[1]);
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
