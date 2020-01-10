import ParallaxBackground from './_parallax-background';
import ParallaxNormal from './_parallax-normal';
import ParallaxHeading from './_parallax-heading';

(() => {
  window.addEventListener('DOMContentLoaded', () => {
    const $$bg = document.querySelector('.js-test-bg');
    const $$dom = document.querySelectorAll('.js-test-panele');

    const original = new ParallaxNormal($$dom);
    const headingParallax = new ParallaxHeading('js-test-heading-wrap');
    const bgParallax = new ParallaxBackground($$bg);

    original.init();
    headingParallax.init();
    bgParallax.init();
  });
})();
