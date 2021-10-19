export default class BaseComponent {

    constructor (el, options = {}) {
        this.el = el;
        this.options = options;

        this.ui = {
            container: this.el,
        };

        this._setup();
    }

    _setup () {
        this._setupElements();
        this._setupListeners();
    }

    /*
      Setting default elements states, styles, attributes, etc.
    */
    _setupElements () {

    }

    /*
      Setting events listeners
    */
    _setupListeners () {

    }

}
