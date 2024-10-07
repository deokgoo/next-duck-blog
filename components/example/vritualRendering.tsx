'use client';

import { useEffect, useRef } from 'react';

const VirtualRendering = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const htmlContent = `
        <!doctype html>
        <html lang="ko">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Optimized Virtual Rendering with Heavy Content</title>
            <style>
              #outer-container {
                height: 500px;
                overflow-y: auto;
                border: 1px solid #ccc;
                position: relative;
              }
              #container {
                position: relative;
                padding-top: 0;
                padding-bottom: 0;
              }
              .item {
                height: 100px;
                border-bottom: 1px solid #eee;
                width: 100%;
                display: flex;
                align-items: center;
                padding: 10px;
              }
              .item img {
                height: 80px;
                width: 80px;
                margin-right: 10px;
              }
            </style>
          </head>
          <body>
            <div id="outer-container">
              <div id="container">
                <div id="items"></div>
              </div>
            </div>
          </body>
        </html>
      `;

      containerRef.current.innerHTML = htmlContent;

      const script = document.createElement('script');
      script.textContent = `
        const outerContainer = document.getElementById('outer-container');
        const container = document.getElementById('container');
        const itemsContainer = document.getElementById('items');
        const itemHeight = 100;
        const totalItems = 1000;
        const visibleItems = Math.ceil(outerContainer.clientHeight / itemHeight) + 1;

        let startIndex = 0;
        let isRendering = false;

        function createItem(index) {
          const item = document.createElement('div');
          item.className = 'item';

          const img = document.createElement('img');
          img.setAttribute('data-src', \`https://via.placeholder.com/80?text=Item+\${index}\`);
          img.alt = \`Item \${index}\`;
          img.className = 'lazy';

          const content = document.createElement('div');
          content.textContent = 'Item ' + index;

          item.setAttribute('data-index', index);
          item.appendChild(img);
          item.appendChild(content);

          return item;
        }

        function lazyLoad() {
          const lazyImages = document.querySelectorAll('.lazy');
          lazyImages.forEach((img) => {
            if (
              img.getAttribute('data-src') &&
              img.getBoundingClientRect().top < window.innerHeight
            ) {
              img.src = img.getAttribute('data-src');
              img.removeAttribute('data-src');
              img.classList.remove('lazy');
            }
          });
        }

        function renderItems() {
          const endIndex = Math.min(startIndex + visibleItems, totalItems);
          const fragment = document.createDocumentFragment();

          for (let i = startIndex; i < endIndex; i++) {
            let item;

            if (itemsContainer.childNodes[i - startIndex]) {
              item = itemsContainer.childNodes[i - startIndex];
              item.querySelector('div').textContent = 'Item ' + i;

              item.setAttribute('data-index', i);

              item
                .querySelector('img')
                .setAttribute('data-src', \`https://via.placeholder.com/80?text=Item+\${i}\`);
            } else {
              item = createItem(i);
              fragment.appendChild(item);
            }
          }

          itemsContainer.appendChild(fragment);

          while (itemsContainer.childNodes.length > endIndex - startIndex) {
            itemsContainer.removeChild(itemsContainer.lastChild);
          }

          container.style.paddingTop = \`\${startIndex * itemHeight}px\`;
          container.style.paddingBottom = \`\${(totalItems - endIndex) * itemHeight}px\`;
          isRendering = false;

          lazyLoad();
        }

        function onScroll() {
          if (isRendering) return;
          isRendering = true;
          requestAnimationFrame(() => {
            const scrollTop = outerContainer.scrollTop;
            const newStartIndex = Math.floor(scrollTop / itemHeight);

            if (newStartIndex !== startIndex) {
              startIndex = newStartIndex;
              renderItems();
            } else {
              isRendering = false;
            }
          });
        }

        outerContainer.addEventListener('scroll', onScroll);

        renderItems();
      `;

      containerRef.current.appendChild(script);
    }
  }, []);

  return <div ref={containerRef} />;
};

export default VirtualRendering;
