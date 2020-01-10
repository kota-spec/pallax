import ParallaxBackground from './_parallax-background';
import ParallaxNormal from './_parallax-normal';
import PallaxHeading from './_parallax-heading';

(() => {
  window.addEventListener('DOMContentLoaded', () => {
    const $$bg = document.querySelector('.js-test-bg');
    const $$dom = document.querySelectorAll('.js-test-panele');

    const original = new ParallaxNormal($$dom);
    const headingPallax = new PallaxHeading('js-test-heading-wrap');
    const bgPallax = new ParallaxBackground($$bg);

    original.init();
    headingPallax.init();
    bgPallax.init();
  });
})();
