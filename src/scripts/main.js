import '../styles/main.scss';

import BaseComponent from 'src/scripts/components/BaseComponent';

const init = () => {
    const baseComponent = new BaseComponent(document, {});
};

document.addEventListener('DOMContentLoaded', () => init());
