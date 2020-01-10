import BackgroundParallax from './_BackgroundParallax';
import PallaxOriginal from './_pallax-original';
import HeadingPallax from './_headingParallax';

(() => {
  window.addEventListener('DOMContentLoaded', () => {
    const $$bg = document.querySelector('.js-test-bg');
    const $$dom = document.querySelectorAll('.js-test-panele');

    const original = new PallaxOriginal($$dom);
    const headingPallax = new HeadingPallax('js-test-heading-wrap');
    const bgPallax = new BackgroundParallax($$bg);

    original.init();
    headingPallax.init();
    bgPallax.init();
  });
})();
