export default class ParallaxHeading {
  /**
   * @param {string|Element} target DOMの要素を取得
   * @param {Object} [options={}]
   * @param {speed} [options.speed=number] 移動スピード
   * @param {aspect} [options.aspect=number] 画像のアスペクト比 1 ~ 0.0
   * @param {isAspect} [options.isAspect=boolean] アスペクト比合わせて高さを変動させるかどうか
   */

  constructor (target, options = {}) {
    const { speed = 1.5, aspect = 0.66, isAspect = true } = options;

    // private
    this._$$headingWrap = this._getElements(target); // 親のdomを取得
    this._speed = speed; // 移動スピード
    this._aspect = aspect; // 画像のアスペクト比
    this._isAspect = isAspect; // アスペクト比合わせて高さを変動させるかどうか
    this._parentWidth = 0; // 親domの高さ
    this._scrollY = window.scrollY || window.pageYOffset; //スクロールの値を格納
    this._animationFrameId = 0; // requestAnimationFrameを管理
    this._originalHeight = this._$$headingWrap.clientHeight; // 純粋のdomの高さ

    // bind系
    this._onResize = this._onResize.bind(this);
  }

  init () {
    if (this._isAspect) {
      this._setAspect();
    }

    this._setOriginalHeight();
    this._onListener();
  }

  _onListener () {
    this._tick();
    window.addEventListener('resize', this._onResize);
  }

  // リサイズ処理
  _onResize () {
    this._scrollY = window.scrollY || window.pageYOffset;

    if (this._isAspect) {
      this._setAspect();
      this._setOriginalHeight();
    }
  }

  // 繰り返し処理をさせる
  _tick () {
    const scrollTop = window.scrollY || window.pageYOffset;
    if (this._scrollY !== this._scrollTop) {
      this._scrollY = scrollTop;
      this._onScroll();
    }

    this._animationFrameId = requestAnimationFrame(() => this._tick());
  }

  // スクロールイベント
  _onScroll () {
    const progress = 1 - (this._scrollY * this._speed) / this._originalHeight; // 進行具合を計算
    this._$$headingWrap.style.height = `${this._originalHeight * progress}px`; // 徐々に高さを変化させる
  }

  // 純粋なheightの高さを格納
  _setOriginalHeight () {
    let height = 0;

    if (this._isAspect) {
      height = this._$$headingWrap.clientWidth * this._aspect;
    } else {
      height = this._$$headingWrap.clientHeight;
    }

    this._originalHeight = height;
  }

  // アスペクト比にそった高さのスタイルをつける
  _setAspect () {
    this._parentWidth = this._$$headingWrap.clientWidth;
    this._$$headingWrap.style.height = `${this._parentWidth * this._aspect -
      this._scrollY}px`;
  }

  /**
   * domを取得
   * @param {string|Element} target
   * @param {string} context 親のdom
   */
  _getElements (target, context = document) {
    if (typeof target === 'string') {
      return context.getElementById(target);
    } else {
      // Element
      return target;
    }
  }
}
