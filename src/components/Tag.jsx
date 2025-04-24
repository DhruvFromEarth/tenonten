import React from 'react';
import './Tag.css';

const Tag = ({ name, color, onClick, selected }) => {
  return (
    <div 
      className={`tag ${selected ? 'selected' : ''}`}
      style={{ backgroundColor: color }}
      onClick={() => onClick(name)}
    >
      {name}
    </div>
  );
};

export default Tag; 