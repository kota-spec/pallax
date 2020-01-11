export default class ParallaxBackground {
  /**
   * @param {string|NodeList|Element|Element[]} target - DOMの要素を取得
   * @param {Object} [options={}]
   * @param {onResize} [options.onResize=noop] - リサイズされた時のイベントを取得
   * @param {onScroll} [options.onScroll=noop] - スクロールした時のイベントを取得
   */

  constructor (target, options = {}) {
    this._els = this._getElements(target); // 指定されたDOMをここに格納
    const { speed = 1, onResize = () => null, onScroll = () => null } = options;

    // private
    this._speed = speed; // パララックスの移動速度
    this._optionOnResize = onResize; // リサイズ時に発火させたい処理を受け取る
    this._optionOnScroll = onScroll; // スクロール時に発火させたい処理を受け取る
    this._scrollTarget = document.scrollingElement || document.documentElement;
    this._viewport = this.scrollY + window.innerHeight; // windowで見える範囲
    this._items = null; // domの色々な情報を格納する

    this._onResize = this._onResize.bind(this);
  }

  init () {
    this._cache();
    this._tick();
    this._onListener();
  }

  _onListener () {
    window.addEventListener('resize', this._onResize);
  }

  // willChange、高さなどの値をキャッシュをさせる
  _cache () {
    this._windowHeight = window.innerHeight;

    // domの色々な情報を設定する
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
   * @param {HTMLElements} el パララックスで使うDOM
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

  // 処理を繰り返す行う
  _tick () {
    const scrollTop = this._scrollTarget.scrollTop;

    if (scrollTop !== this._scrollTop) {
      this._scrollTop = scrollTop;
      this._updateBg();
    }

    this._animationFrameId = requestAnimationFrame(() => this._tick());
  }

  // データを更新
  _updateBg () {
    this._viewport = this._scrollTop + window.innerHeight;

    this._items.map(r => {
      const bounding = r.el.getBoundingClientRect(); // パララックス対象のDOMのcssを取得
      const parent = r.el.parentNode.getBoundingClientRect(); // パララックス対象のDOMを囲ってるDOMのcssを取得
      r.top = parent.top + this._scrollTop; // 要素の正しい高さを取得
      r.bottom = r.top + parent.height;
      r.max = parent.height - bounding.height; // 親のDOMとparallaxにDOMの差分を抽出

      return r;
    });

    this._update();
  }

  // domを更新させる
  _update () {
    this._items.forEach(item => this._updateElement(item));
  }

  // ここでパララックスの処理をさせている
  _updateElement (item) {
    if (this._scrollTop > item.bottom || this._viewport < item.top) {
      // 見なくなった後の処理を記入
    } else if (this._viewport > item.top && this._scrollTop < item.bottom) {
      // ここでパララックスの計算をしている
      const scroll = this._viewport - item.top; // 見える部分からのスクロール値
      const max = window.innerHeight + item.el.parentNode.clientHeight; // 見える部分の最大スクロール値
      const rate = scroll / max; // 移動値の%を算出
      const value = item.max * this._speed * rate; // 移動値を算出
      const position = -item.max <= -value ? item.max : value; // position設定

      item.el.style.transform = `translate3d(0, ${position}px, 0)`;
    }
  }

  // リサイズ処理
  _onResize () {
    this._scrollTop = this._scrollTarget.scrollTop;
    this._updateBg();
    this._optionOnResize();
  }

  /**
   * domの入った配列を返す
   * @param {NodeList} nodeList NodeListをただのarrayに変換
   */
  _makeArray (nodeList) {
    return nodeList ? Array.prototype.slice.call(nodeList, 0) : [];
  }

  /**
   * domを取得
   * @param {string|NodeList|Element|Element[]} target
   * @param {string} context 親のdom
   */
  _getElements (target, context = document) {
    if (typeof target === 'string') {
      // string
      const nodeList = context.querySelectorAll(target);
      return this._makeArray(nodeList);
    } else if (target.length) {
      if (target.map) {
        // Array
        return target;
      } else {
        // NodeList
        return this._makeArray(target);
      }
    } else {
      // Element
      return [target];
    }
  }
}
