import { getElements } from './modules/utility';

export default class BackgroundParallax {
  /**
   * @param {string|NodeList|Element|Element[]} target - DOMの要素を取得
   * @param {Object} [options={}]
   * @param {onResize} [options.onResize=noop] - リサイズされた時のイベントを取得
   * @param {onScroll} [options.onScroll=noop] - リサイズした時のイベントを取得
   * @param {boolean} [options.isRound=false] - 小数点ありか受け取る
   * @param {boolean} [options.autoRun=true] - 自動的にパララックスの処理をさせるか受け取る
   *
   * @example
   *  // 通常の向きで移動
   *  <div data-speed='0.3'></div>
   *
   *  // 反対の向きで移動
   *  <div data-speed='-0.3'></div>
   */

  constructor(target, options = {}) {
    this._els = getElements(target); // 指定されたDOMをここに格納

    // 指定されたDOMの有無を確認。
    if (this._els.length === 0) {
      this._disabled = true;
      return;
    }

    const {
      onResize = () => null,
      onScroll = () => null,
      isRound = false,
      autoRun = true
    } = options;

    this._optionOnResize = onResize;
    this._optionOnScroll = onScroll;
    this._fTansform = `_getTransform${isRound ? 'Round' : ''}`;
    this._scrollTarget = document.scrollingElement || document.documentElement;

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
   * データを更新させる
   */
  update() {
    if (this._disabled) return;

    this._cache();
    this._update();
  }

  /**
   * willChange、高さなどの値をキャッシュをさせる
   */
  _cache() {
    this._windowHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    // domを格納
    this._items = this._els.map(el => {
      el.style.transform = 'none';

      const willChange = window.getComputedStyle(el).willChange; // will-changeのスタイルを確認

      el.style.willChange = 'transform';
      if (!(willChange === 'auto' || willChange === 'transform'))
        el.style.willChange += ', ' + willChange;

      return this._cacheElementPos(el, scrollY);
    });
  }

  /**
   * _cacheから送られてくるデータを返す
   * @param {HTMLElements} el パララックでつかDOM
   * @param {number} scrollY windowの高さ
   */
  _cacheElementPos(el, scrollY) {
    const bounding = el.getBoundingClientRect(); // パララックス対象のDOMのcssを取得
    const boundingParent = el.parentNode.getBoundingClientRect(); // パララックス対象のDOMを囲ってるDOMのcssを取得
    const top = boundingParent.top + scrollY; // 要素の正しい高さを取得
    const inPos = top - this._windowHeight; // ウインドウの高さと要素の高さを引いた分
    const outPos = boundingParent.bottom + scrollY; // 要素の正しい底辺の高さを取得

    return {
      el,
      max: boundingParent.height - bounding.height, // 親のDOMとparallaxにDOMの差分を抽出
      inPos,
      outPos,
      distance: outPos - inPos,
      offset: boundingParent.top - bounding.top
    };
  }

  /**
   * 高さを撮り続け、処理を走らせる
   */
  _tick() {
    const scrollTop = this._scrollTarget.scrollTop;

    if (scrollTop !== this._scrollTop) {
      this._scrollTop = scrollTop;
      this._update();
    }

    this._animationFrameId = requestAnimationFrame(() => {
      this._tick();
    });
  }

  /**
   * domを更新させてる
   */
  _update() {
    this._items.forEach(item => this._updateElement(item));

    this._optionOnScroll(this._scrollTop);
  }

  /**
   * ここでパララックスの処理をさせている
   */
  _updateElement(item) {
    if (this._scrollTop > item.outPos) {
      // 見なくなった後の処理
    } else {
      // ここでパララックスの計算をしている
      const diff = this._scrollTop - item.inPos;

      if (diff > 0) {
        const rate = diff / item.distance;

        const position = item.offset + item.max - item.max * rate; // max - (max - min) * rate

        item.el.style.transform = this[this._fTansform](position);
      }
    }
  }

  /**
   * translateを格納
   */
  _getTransform(position) {
    return `translate3d(0, ${position}px, 0)`;
  }

  /**
   * 四捨五入をしたtranslateの値を返す
   */
  _getTransformRound(position) {
    return `translate3d(0, ${Math.round(position)}px, 0)`;
  }

  /**
   * パララックスを発火
   */
  run() {
    if (this._disabled) return;

    this._cache();
    this._animationFrameId = requestAnimationFrame(() => this._tick());
  }

  /**
   * 要素を削除
   */
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
