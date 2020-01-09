import BackgroundParallax from './_BackgroundParallax';
import PallaxOriginal from './_pallax-original';

(() => {
  window.addEventListener('DOMContentLoaded', () => {
    const $$bg = document.querySelector('.js-test-bg');
    const $$dom = document.querySelectorAll('.js-test-panele');

    const bgPallax = new BackgroundParallax($$bg);
    const original = new PallaxOriginal($$dom);

    original.init();

    const $$headingWrap = document.getElementById('js-test-heading-wrap');
    const height = 700;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const progress = 1 - scrollY / height;
      $$headingWrap.style.height = `${height * progress}px`;
    });
  });
})();
