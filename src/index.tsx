import React from 'react';
import ReactDOM from 'react-dom/client'; // 使用新的 API
import App from './App';

// 获取挂载的 DOM 节点
const rootElement = document.getElementById('root');

// 检查是否获取到 root 节点
if (rootElement) {
  // 使用 createRoot 创建根
  const root = ReactDOM.createRoot(rootElement);
  root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
  );
} else {
  console.error('Root element not found. Please ensure index.html contains a div with id="root".');
}