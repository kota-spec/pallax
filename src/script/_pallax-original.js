export default class PallaxOriginal {
  constructor (target) {
    this.els = this.getElements(target);

    this.speed = 0.1;
    this.scrollY = window.scrollY || window.pageYOffset;
    this._scrollTop = 0;
    this.items = null; // domの色んな状態を格納
    this._scrollTarget = document.scrollingElement || document.documentElement;
    this.viewport = this.scrollY + window.innerHeight; // windowが見える範囲
  }

  init () {
    this.cache();
    this.update();
    this.tick();
  }

  // willchangeなどをつける
  cache () {
    this.speed *= window.innerWidth / window.innerHeight;
    this._windowHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;

    this.items = this.els
      .map(el => {
        el.style.transform = 'none';
        const willChange = window.getComputedStyle(el).willChange;
        el.style.willChange = 'transform';
        if (!(willChange === 'auto' || willChange === 'transform')) {
          el.style.willChange += ', ' + willChange;
        }

        return this.cacheElementPos(el, scrollY);
      })
      .filter(item => item);
  }

  // domの色々な情報を格納
  cacheElementPos (el, scrollY) {
    const bounding = el.getBoundingClientRect();
    const top = bounding.top + scrollY; // 純粋なtopの高さ

    return {
      el,
      top,
      center: top + bounding.height / 2, // domの真ん中からの高さ
      speed: parseFloat(el.dataset.speed) || this._speed,
      inPos: top - this._windowHeight, // domのtopの高さとwindowの高さの差分
      outPos: bounding.bottom + scrollY, // domの底辺からの高さ
      position: 0
    };
  }

  // スクロールをしたかどうか検知
  tick () {
    const scrollTop = this._scrollTarget.scrollTop;
    if (scrollTop !== this._scrollTop) {
      this.scrollY = window.scrollY || window.pageYOffset;
      this.viewport = this.scrollY + window.innerHeight;
      this._scrollTop = scrollTop;
      this.update();
    }

    this._animationFrameId = requestAnimationFrame(() => this.tick());
  }

  // domの位置を更新
  update () {
    this.items.forEach(item => this.updateElement(item));
  }

  // パララックスの処理
  updateElement (item) {
    if (this._scrollTop > item.center || this.viewport < item.center) {
      // 見なくなった後の処理を記入
    } else if (this.viewport > item.center && this._scrollTop < item.center) {
      // ここでパララックスの処理をしている

      // domの位置を更新
      const position = (this.viewport - item.center) * item.speed;

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
  makeArray (nodeList) {
    return nodeList ? Array.prototype.slice.call(nodeList, 0) : [];
  }

  /**
   * domを取得
   * @param {string|NodeList|Element|Element[]} target
   * @param {string} context 親のdom
   */
  getElements (target, context = document) {
    if (typeof target === 'string') {
      // string
      const nodeList = context.querySelectorAll(target);
      return this.makeArray(nodeList);
    } else if (target.length) {
      if (target.map) {
        // Array
        return target;
      } else {
        // NodeList
        return this.makeArray(target);
      }
    } else {
      // Element
      return [target];
    }
  }
}
