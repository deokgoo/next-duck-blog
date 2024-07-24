'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FixedSizeList as List } from 'react-window';

const itemCount = 100000;
const items = Array.from({ length: itemCount }, (_, index) => `Item ${(index + 1) % 4}`);
const itemWidth = 100; // 각 아이템의 너비

function InfiniteSwipe() {
  const listRef = useRef(null);
  const [listWidth, setListWidth] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    // 중앙으로 스크롤 위치 설정
    if (list && list.scrollToItem) {
      list.scrollToItem(Math.floor(itemCount / 2), 'center');
    }
    setListWidth(window.innerWidth);
  }, []);

  const ItemRenderer = ({ index, style }) => (
    <div
      style={{
        ...style,
        width: `${itemWidth}px`,
        height: '100px',
        boxSizing: 'border-box',
        border: '1px solid #000',
        textAlign: 'center',
        lineHeight: '100px',
        display: 'inline-block',
      }}
    >
      {items[index]}
    </div>
  );

  return (
    <>
      <h1> 가상 컴포넌트 horizontal 스크롤</h1>
      <br />
      item0, item1, item2, item3
      <br />
      <br />
      <div style={{ width: '100%', height: '300px', overflow: 'hidden', backgroundColor: 'blue' }}>
        <List
          ref={listRef}
          height={300}
          width={listWidth}
          itemCount={items.length}
          itemSize={itemWidth}
          layout="horizontal"
          style={{ display: 'flex' }}
        >
          {ItemRenderer}
        </List>
      </div>
    </>
  );
}

export default InfiniteSwipe;
