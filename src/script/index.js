import BackgroundParallax from './_BackgroundParallax';
import NormalParallax from './_normal-pallax';

(() => {
  window.addEventListener('DOMContentLoaded', () => {
    const $$bg = document.querySelector('.js-test-bg');
    const $$heading = document.querySelector('.js-test-heading');
    const $$dom = document.querySelectorAll('.js-test-panele');

    console.log($$dom);

    const bgPallax = new BackgroundParallax($$bg);

    const headingParallax = new NormalParallax($$heading, {
      isHeading: true,
      isRound: false
    });

    const pallax = new NormalParallax($$dom, {
      onScroll: () => {
        console.log('scroll');
      }
    });

    headingParallax;
    pallax;
    bgPallax;
  });
})();
