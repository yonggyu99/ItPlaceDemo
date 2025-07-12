// src/App.tsx
import React, { useState } from 'react';
import SideBar from './component/SideBar';
import MapView from './component/MapView';
import CameraARView from './component/CameraARView';
import css from './style/layout.module.css';

const App: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isARMode, setIsARMode] = useState(false); // ✅ AR 모드 여부

  return (
    <div className={css.container}>
      {!isARMode && (
        <>
          <SideBar onSearch={setSearchKeyword} resultList={searchResults} />
          <div className={css.mapArea}>
            <MapView keyword={searchKeyword} onSearchResult={setSearchResults} />
          </div>
        </>
      )}

      {isARMode && (
        <div style={{ width: '100vw', height: '100vh' }}>
          <CameraARView />
        </div>
      )}

      {/* 모드 전환 버튼 */}
      <button
        onClick={() => setIsARMode(!isARMode)}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          background: '#ff567a',
          color: '#fff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        {isARMode ? '지도 보기' : 'AR 보기'}
      </button>
    </div>
  );
};

export default App;
