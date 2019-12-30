import { getElements } from './modules/utility';

/**
 * Parallax library
 */
export default class NormalParallax {
  /**
   * @param {string|NodeList|Element|Element[]} target -
   * @param {Object} [options={}]
   * @param {onResize} [options.onResize=noop] - リサイズ時の処理を受け取る
   * @param {onScroll} [options.onScroll=noop] - スクロールイベントの処理を受け取る
   * @param {boolean} [options.isRound=false] - 小数点の有無を受け取る
   * @param {boolean} [options.autoRun=true] - パララックスを自動で発火させるか受け取る
   * @param {boolean} [options.isHeading=false] - 見出しのパララックス確認
   * @param {number} [options.speed=0.1] - パララックスの移動速度を受け取る
   * @param {number} [options.speedSp=options.speed] - spの時のスピードを受け取る
   * @param {Function} [options.isSP=noop] - spの場合の処理を受け取る
   */

  constructor(target, options = {}) {
    this._els = getElements(target);
    if (this._els.length === 0) {
      this._disabled = true;
      return;
    }

    const {
      speed = 0.1,
      speedSp = speed,
      isSP = () => null,
      onResize = () => null,
      onScroll = () => null,
      isRound = false,
      autoRun = true,
      isHeading = false
    } = options;

    this._optionOnResize = onResize;
    this._optionOnScroll = onScroll;
    this._fTansform = `_getTransform${isRound ? 'Round' : ''}`;
    this._scrollTarget = document.scrollingElement || document.documentElement;
    this._speedPc = speed;
    this._speedSp = speedSp;
    this._isSP = isSP;
    this._isHeading = isHeading;

    // リサイズのイベント
    this._onResize = () => {
      this.update();
      this._optionOnResize(this._windowHeight);
    };
    window.addEventListener('resize', this._onResize);

    this._onLoad = () => {
      this.update();
    };
    window.addEventListener('load', this._onLoad);

    autoRun && this.run();
  }

  /**
   *
   */
  _cache() {
    this._isSpCurrent = this._isSP();
    this._speed = this._isSpCurrent ? this._speedSp : this._speedPc;
    this._speed *= window.innerWidth / window.innerHeight;
    this._windowHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    this._items = this._els
      .map(el => {
        el.style.transform = 'none';
        const willChange = window.getComputedStyle(el).willChange;
        el.style.willChange = 'transform';
        if (!(willChange === 'auto' || willChange === 'transform'))
          el.style.willChange += ', ' + willChange;

        return this._cacheElementPos(el, scrollY);
      })
      .filter(item => item);
  }

  _tick() {
    const scrollTop = this._scrollTarget.scrollTop;
    if (scrollTop !== this._scrollTop) {
      // When the scroll position changes
      this._scrollTop = scrollTop;
      this._update();
    }

    this._animationFrameId = requestAnimationFrame(() => {
      this._tick();
    });
  }

  _update() {
    this._centerViewport = this._scrollTop + this._windowHeight / 2;

    this._items.forEach(item => this._updateElement(item));

    this._optionOnScroll(this._scrollTop);
  }

  _getTransform(position) {
    return `translate3d(0, ${position}px, 0)`;
  }

  _getTransformRound(position) {
    return `translate3d(0, ${Math.round(position)}px, 0)`;
  }

  /**
   * Cache various values of one element
   */
  _cacheElementPos(el, scrollY) {
    // Do not parallax if it is specified to invalidate by SP
    if (this._isSpCurrent && el.dataset.sp === 'false') return;

    const bounding = el.getBoundingClientRect();
    const top = bounding.top + scrollY;

    return {
      el,
      top,
      center: top + bounding.height / 2,
      speed: parseFloat(el.dataset.speed, 10) || this._speed,
      inPos: top - this._windowHeight,
      outPos: bounding.bottom + scrollY
    };
  }

  _updateElement(item) {
    if (this._scrollTop > item.outPos) {
      // 見なくなった後の処理を記入
    } else if (this._scrollTop > item.inPos) {
      // ここでパララックスの処理をしている

      // 見出しの部分parallaxの処理かそうじゃないか判断
      const position = !this._isHeading
        ? (item.center - this._centerViewport) * item.speed
        : this._scrollTop * item.speed;

      item.el.style.transform = this[this._fTansform](position);
    }
  }
  run() {
    if (this._disabled) return;

    this._cache();
    this._animationFrameId = requestAnimationFrame(() => {
      this._tick();
    });
  }

  update() {
    if (this._disabled) return;

    this._cache();
    this._update();
  }

  destroy() {
    if (!this._els) return;

    cancelAnimationFrame(this._animationFrameId);

    this._els.forEach(el => {
      el.style.transform = null;
      el.style.willChange = null;
    });

    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('load', this._onLoad);
  }
}
