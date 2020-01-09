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

  constructor (target, options = {}) {
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
    this.viewport = this.scrollY + window.innerHeight; // windowが見える範囲
    this.scrollY = window.scrollY || window.pageYOffset;

    window.addEventListener('resize', this._onResize);
    window.addEventListener('load', this._onLoad);

    this._cache();
    this._tick();
  }

  /**
   * willChange、高さなどの値をキャッシュをさせる
   */
  _cache () {
    this._windowHeight = window.innerHeight;

    // domを格納
    this._items = this._els.map(el => {
      el.style.transform = 'none';

      const willChange = window.getComputedStyle(el).willChange; // will-changeのスタイルを確認

      el.style.willChange = 'transform';
      if (!(willChange === 'auto' || willChange === 'transform'))
        el.style.willChange += ', ' + willChange;

      return this._cacheElementPos(el);
    });
  }

  /**
   * _cacheから送られてくるデータを返す
   * @param {HTMLElements} el パララックでつかDOM
   */
  _cacheElementPos (el) {
    const bounding = el.getBoundingClientRect(); // パララックス対象のDOMのcssを取得
    const parent = el.parentNode.getBoundingClientRect(); // パララックス対象のDOMを囲ってるDOMのcssを取得
    const top = parent.top + this.scrollY; // 要素の正しい高さを取得

    return {
      el,
      top,
      bottom: top + parent.height,
      max: parent.height - bounding.height // 親のDOMとparallaxにDOMの差分を抽出
    };
  }

  /**
   * 高さを撮り続け、処理を走らせる
   */
  _tick () {
    const scrollTop = this._scrollTarget.scrollTop;

    if (scrollTop !== this._scrollTop) {
      this.scrollY = window.scrollY || window.pageYOffset;
      this.viewport = this.scrollY + window.innerHeight;
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
  _update () {
    this._items.forEach(item => this._updateElement(item));
  }

  /**
   * ここでパララックスの処理をさせている
   */
  _updateElement (item) {
    if (this._scrollTop > item.bottom || this.viewport < item.top) {
      // 見なくなった後の処理を記入
    } else if (this.viewport > item.top && this._scrollTop < item.bottom) {
      // ここでパララックスの計算をしている
      const scroll = this.viewport - item.top; // 見える部分からのスクロール値
      const max = window.innerHeight + item.el.parentNode.clientHeight; // 見える部分の最大スクロール値
      const rate = scroll / max; // 移動値の%を算出
      const position = item.max * rate; // 移動値を算出

      item.el.style.transform = `translate3d(0, ${position}px, 0)`;
    }
  }
}
