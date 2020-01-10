export default class PallaxOriginal {
  /**
   * @param {string|NodeList|Element|Element[]} target - DOMの要素を取得
   */

  constructor (target) {
    this.els = this._getElements(target);

    this._speed = 0.1;
    this._items = null; // domの色んな状態を格納
    this._scrollTarget = document.scrollingElement || document.documentElement;
    this._animationFrameId = 0; // requestAnimationFrameを管理
    this._scrollTop = this._scrollTarget.scrollTop;
    this._viewport = this._scrollTop + window.innerHeight; // windowが見える範囲

    this._onResize = this._onResize.bind(this);
  }

  init () {
    this._cache();
    this._update();
    this._tick();
    this._onListener();
  }

  _onListener () {
    window.addEventListener('resize', this._onResize);
  }

  // willchangeなどをつける
  _cache () {
    this._speed *= window.innerWidth / window.innerHeight;
    this._windowHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    this._items = this.els
      .map(el => {
        el.style.transform = 'none';
        const willChange = window.getComputedStyle(el).willChange;
        el.style.willChange = 'transform';
        if (!(willChange === 'auto' || willChange === 'transform')) {
          el.style.willChange += ', ' + willChange;
        }

        return this._cacheElementPos(el, scrollY);
      })
      .filter(item => item);
  }

  // domの色々な情報を格納
  _cacheElementPos (el) {
    const bounding = el.getBoundingClientRect();
    const top = bounding.top + this._scrollTop; // 純粋なtopの高さ

    return {
      el,
      top,
      center: top + bounding.height / 2, // domの真ん中からの高さ
      speed: parseFloat(el.dataset.speed) || this._speed,
      inPos: top - this._windowHeight, // domのtopの高さとwindowの高さの差分
      outPos: bounding.bottom + this._scrollTop, // domの底辺からの高さ
      position: 0
    };
  }

  // スクロールをしたかどうか検知
  _tick () {
    const scrollTop = this._scrollTarget.scrollTop;
    if (scrollTop !== this._scrollTop) {
      this._scrollTop = scrollTop;
      this._updateData();
    }

    this._animationFrameId = requestAnimationFrame(() => this._tick());
  }

  // データを更新
  _updateData () {
    this._viewport = this._scrollTop + window.innerHeight;

    this._items.map(r => {
      const bounding = r.el.getBoundingClientRect();
      const top = bounding.top + this._scrollTop; // 純粋なtopの高さ

      r.top = top; // 要素の正しい高さを取得
      r.center = top + bounding.height / 2;

      return r;
    });

    this._update();
  }

  // domの位置を更新
  _update () {
    this._items.forEach(item => this._updateElement(item));
  }

  // リサイズ処理
  _onResize () {
    this._updateData();
  }

  // パララックスの処理
  _updateElement (item) {
    if (this._scrollTop > item.center || this._viewport < item.center) {
      // 見なくなった後の処理を記入
    } else if (this._viewport > item.center && this._scrollTop < item.center) {
      // ここでパララックスの処理をしている

      // domの位置を更新
      const position = (this._viewport - item.center) * item.speed;

      if (position <= 300) {
        item.position = position;
        item.el.style.transform = `translate3d(0, ${position}px, 0)`;
      }
    }
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
