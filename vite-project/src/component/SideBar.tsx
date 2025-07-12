// src/components/SideBar.tsx
import React, { useState } from 'react';
import css from '../style/layout.module.css';

interface SideBarProps {
  onSearch: (keyword: string) => void;
  resultList: { place_name: string; address_name: string }[];
}

const SideBar: React.FC<SideBarProps> = ({ onSearch, resultList }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      onSearch(input.trim());
    }
  };

  return (
    <div className={css.sidebar}>
      <h2>IT:PLACE</h2>
      <input
        type="text"
        placeholder="브랜드명 검색"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className={css.searchInput}
      />

      <ul className={css.resultList}>
        {resultList.map((place, idx) => (
          <li key={idx}>
            <strong>{place.place_name}</strong>
            <div style={{ fontSize: '0.9rem', color: '#555' }}>{place.address_name}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBar;
