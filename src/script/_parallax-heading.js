export default class ParallaxHeading {
  constructor (target) {
    this.$$headingWrap = this.getElements(target); // 親のdomを取得
    this.parentWidth = 0; // 親domの高さ
    this.scrollY = window.scrollY || window.pageYOffset; //スクロールの値を格納
    this._animationFrameId = 0; // requestAnimationFrameを管理
    this.originalHeight = this.$$headingWrap.clientHeight; // 純粋のdomの高さ

    // bind系
    this.onResize = this.onResize.bind(this);
  }

  init () {
    this.setAspect();
    this.setOriginalHeight();
    this.onListener();
  }

  onListener () {
    this.tick();
    window.addEventListener('resize', this.onResize);
  }

  // リサイズ処理
  onResize () {
    this.setAspect();
    this.setOriginalHeight();
  }

  // 繰り返し処理をさせる
  tick () {
    const scrollTop = window.scrollY || window.pageYOffset;
    if (this.scrollY !== this._scrollTop) {
      this.scrollY = scrollTop;
      this.onScroll();
    }

    this._animationFrameId = requestAnimationFrame(() => this.tick());
  }

  // スクロールイベント
  onScroll () {
    const progress = 1 - this.scrollY / this.originalHeight; // 進行具合を計算
    this.$$headingWrap.style.height = `${this.originalHeight * progress}px`; // 徐々に高さを変化させる
  }

  // 純粋なheightの高さを格納
  setOriginalHeight () {
    const height = this.$$headingWrap.clientHeight + this.scrollY;
    this.originalHeight = height;
  }

  // アスペクト比にそった高さのスタイルをつける
  setAspect () {
    this.parentWidth = this.$$headingWrap.clientWidth;
    this.$$headingWrap.style.height = `${this.parentWidth * 0.66 -
      this.scrollY}px`;
  }

  /**
   * domを取得
   * @param {string|Element} target
   * @param {string} context 親のdom
   */
  getElements (target, context = document) {
    if (typeof target === 'string') {
      return context.getElementById(target);
    } else {
      // Element
      return target;
    }
  }
}
