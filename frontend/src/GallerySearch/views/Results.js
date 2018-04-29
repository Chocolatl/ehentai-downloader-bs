import React from 'react';
import GalleryList from '../../GalleryList/GalleryList';
import GalleryListItem from '../../GalleryList/GalleryListItem';

import IconButton from 'material-ui/IconButton';
import Icon from 'material-ui/Icon';
import Chip from 'material-ui/Chip';

export default class extends React.Component {
  
  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.start !== this.props.start ||
      nextProps.className !== this.props.className ||
      nextProps.results !== this.props.results ||
      nextProps.onScrollToBottom !== this.props.onScrollToBottom ||
      nextProps.onClickItem !== this.props.onClickItem
    ) {
      return true;
    } else {
      return false;
    }
  }
  
  rootRef = (node) => {
    if(node == null) return;
    node.addEventListener('scroll', ev => {
      if(node.scrollHeight - node.scrollTop === node.clientHeight) {
        this.props.onScrollToBottom();
      }
    });
  };

  render() {
    const { start, className, results, onClickItem } = this.props;
    const style = {
      textAlign: 'center',
      marginTop: 40
    };
    if (start) {
      return <div style={style}>正在搜索...</div>
    } else if (results.errMsg) {
      return <div style={style}>{results.errMsg}</div>
    } else if (results.items.length === 0) {
      return <div style={style}>搜索结果为空</div>
    } else {
      return (
        <GalleryList rootRef={this.rootRef} className={className}>
          {
            results.items.map(item => {
              let Button = () => (
                <IconButton onClick={() => onClickItem(item.url)}>
                  <Icon>file_download</Icon>
                </IconButton>
              );
              return (
                <GalleryListItem key={item.id} imgSrc={'/eh/proxy?url=' + encodeURIComponent(item.cover)} button={<Button />}>
                  <div>
                    <div style={{lineHeight: 1.6}}>{item.title}</div>
                    <Chip label={item.category} style={{height: 26, marginRight: 8}} />
                    <Chip label={'rating≈' + item.rating} style={{height: 26}} />
                  </div>
                </GalleryListItem>
              );
            })
          }
        </GalleryList>
      )
    }
  }
};