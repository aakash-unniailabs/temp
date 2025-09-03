
import React from 'react';
import './CategoryList.css';

const categoryIcons = {
  'appetizers': '🥗',
  'main courses': '🍽️',
  'main course': '🍽️',
  'desserts': '🍰',
  'dessert': '🍰',
  'beverages': '🥤',
  'beverage': '🥤',
  'pizza': '🍕',
  'pasta': '🍝',
  'salads': '🥗',
  'salad': '🥗',
  'soups': '🍲',
  'soup': '🍲',
  'seafood': '🦐',
  'chicken': '🍗',
  'vegetarian': '🌱',
  'vegan': '🌿',
  'drinks': '🥤',
  'coffee': '☕',
  'tea': '🍵'
};

function CategoryList({ categories, selectedId, onSelect }) {
  const getCategoryIcon = (name) => categoryIcons[name.toLowerCase()] || '🍽️';

  return (
    <div className="category-list-container">
      <div className="category-list">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-item ${selectedId === cat.id ? 'active' : ''}`}
            onClick={() => onSelect(cat.id)}
          >
            <div className="category-icon-container">
              {cat.photoUrl ? (
                <img
                  src={cat.photoUrl}
                  alt={cat.name}
                  className="category-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="category-icon">{getCategoryIcon(cat.name)}</span>
              )}
            </div>
            <span className="category-name">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryList;
