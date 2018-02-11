import React from 'react';
import PropTypes from 'prop-types';
import {displayMessage} from './actions';
import './style.css';

class MessageProvider extends React.Component {
  constructor() {
    super(...arguments);
    
    this.state = {
      time: +new Date(),
      text: ''
    }

    this.timerID = 0;
    this.firstRender = true;
  }

  componentWillUpdate(nextProps, nextState) {
    if(nextState.time !== this.state.time) {
      let id = ++this.timerID;
      if(nextState.text) {
        setTimeout(() => {
          if(id === this.timerID) {
            this.context.store.dispatch(displayMessage(''));
          };
        }, this.props.time || 3000);
      }
    }
  }

  render() {
    let elClass = 'message';

    // 以下逻辑用于确保在初次渲染时(this.state.text = '')不添加'hide'和'show'类
    // 使得初次渲染时'message'元素不触发'hide'的动画
    // 当this.state.text的值第一次不为空时，添加'show'类
    // 之后每次this.state.text不为空时添加'show'类，为空时添加'hide'类
    if(this.state.text) {
      this.firstRender = false;
      elClass += ' show';
    } else if (!this.firstRender && !this.state.text) {
      elClass += ' hide';
    }

    // this.lastText用来保存最后一次不为空的消息
    if(this.state.text) {
      this.lastText = this.state.text
    }

    return (
      <div className="message-provider">
        {this.props.children}
        <div className={elClass}>
          {this.lastText}
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.unsubscribe = this.context.store.subscribe(() => {
      this.setState(this.context.store.getState().messageProvider)
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }
}

MessageProvider.contextTypes = {
  store: PropTypes.object
};

export default MessageProvider;