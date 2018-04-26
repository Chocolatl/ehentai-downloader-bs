import React from 'react';
import GalleryList from '../../GalleryList/GalleryList';
import GalleryListItem from '../../GalleryList/GalleryListItem';

import IconButton from 'material-ui/IconButton';
import Icon from 'material-ui/Icon';

export default ({ start, className, results, onClickItem }) => {
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
      <GalleryList className={className}>
        {
          results.items.map(item => {
            let Button = () => (
              <IconButton onClick={() => onClickItem(item.url)}>
                <Icon>file_download</Icon>
              </IconButton>
            );
            return (
              <GalleryListItem imgSrc={item.cover} button={<Button />}>
                <div style={{ lineHeight: 1.4 }}>{item.title}</div>
              </GalleryListItem>
            );
          })
        }
      </GalleryList>
    )
  }
};