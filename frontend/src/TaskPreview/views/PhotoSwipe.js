import React from 'react';
import {Route} from 'react-router-dom';
import PhotoSwipe from 'photoswipe/dist/photoswipe.js';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default.js';
import 'photoswipe/dist/default-skin/default-skin.css';
import 'photoswipe/dist/photoswipe.css';

class PhotoSwipeContainer extends React.Component{
  constructor() {
    super(...arguments);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.pswpRef = this.pswpRef.bind(this);
  }

  render () {
    let that = this;
    return (
      <div>
        <div className="pswp" tabIndex="-1" role="dialog" aria-hidden="true" ref={this.pswpRef}>
          <div className="pswp__bg"></div>
          <div className="pswp__scroll-wrap">
            <div className="pswp__container">
              <div className="pswp__item"></div>
              <div className="pswp__item"></div>
              <div className="pswp__item"></div>
            </div>
    
            <div className="pswp__ui pswp__ui--hidden">
    
              <div className="pswp__top-bar">
                <div className="pswp__counter"></div>
                <button className="pswp__button pswp__button--close" title="Close (Esc)"></button>
                <button className="pswp__button pswp__button--share" title="Share"></button>
                <button className="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
                <button className="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
    
                <div className="pswp__preloader">
                  <div className="pswp__preloader__icn">
                    <div className="pswp__preloader__cut">
                      <div className="pswp__preloader__donut"></div>
                    </div>
                  </div>
                </div>
              </div>
    
              <div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                <div className="pswp__share-tooltip"></div>
              </div>
              <button className="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>
    
              <button className="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>
    
              <div className="pswp__caption">
                <div className="pswp__caption__center"></div>
              </div>
            </div>
          </div>
        </div>

        <Route exact strict path={this.props.match.url + '/:index'} component={
          class extends React.Component {
            render() {
              return null;
            }

            componentDidMount() {
              that.open(that.props.items, +this.props.match.params.index);
              this.href = window.location.href;   // 获取打开PhotoSwipe时的URL
              that.gallery.listen('destroy', () => {
                // PhotoSwipe被销毁时URL没有改变(即通过ESC键等方式关闭PhotoSwipe，而不是通过浏览器后退按钮触发componentWillUnmount关闭时)
                if(this.href === window.location.href) {
                  window.history.go(-1);  // 模拟后退
                }
              });
            }
            
            componentWillUnmount() {
              // 路由不匹配时关闭PhotoSwipe
              that.close();
            }
          }
        }
        />
      </div>
    )
  }

  pswpRef(node) {

    // 貌似是在卸载组件的时候，ref的回调函数还会被调用，传递了一个null进来...无语
    if(node == null) {
      return;
    }

    this.pswp = node;
  }

  open(items, index) {
    let options = {
      history: false,
      focus: false,
      showAnimationDuration: 600,
      hideAnimationDuration: 200,
      shareEl: false,
      zoomEl: false,
      index: index
    };

    this.gallery = new PhotoSwipe(this.pswp, PhotoSwipeUI_Default, items, options);    
    this.gallery.init();
  }

  close() {
    this.gallery.close();
  }
}

export default PhotoSwipeContainer;