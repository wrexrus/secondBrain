import React from 'react';

const BRAIN_NODES = [
  { id: 1, x: 200, y: 50, r: 8 },
  { id: 2, x: 120, y: 80, r: 6 },
  { id: 3, x: 280, y: 80, r: 6 },
  { id: 4, x: 70, y: 150, r: 5 },
  { id: 5, x: 160, y: 140, r: 7 },
  { id: 6, x: 240, y: 140, r: 7 },
  { id: 7, x: 330, y: 150, r: 5 },
  { id: 8, x: 90, y: 230, r: 6 },
  { id: 9, x: 170, y: 220, r: 8 },
  { id: 10, x: 230, y: 220, r: 8 },
  { id: 11, x: 310, y: 230, r: 6 },
  { id: 12, x: 140, y: 300, r: 5 },
  { id: 13, x: 260, y: 300, r: 5 },
  { id: 14, x: 200, y: 320, r: 7 },
  { id: 15, x: 200, y: 180, r: 10 }, 
];

const BRAIN_EDGES = [
  [1, 2], [1, 3], [1, 5], [1, 6],
  [2, 4], [2, 5], [3, 6], [3, 7],
  [4, 8], [4, 5], [5, 9], [5, 15],
  [6, 10], [6, 15], [7, 11], [7, 6],
  [8, 9], [8, 12], [9, 10], [9, 15], [9, 12],
  [10, 11], [10, 15], [10, 13], [11, 13],
  [12, 14], [13, 14], [12, 13], [15, 14]
];

const BrainHero = ({
  isActive,
  categories,
  isAuthenticated,
  setSearchMode,
  setIsGlobalSearchOpen,
  handleCategoryClick,
  handleBrainClick,
  getIndicatorText
}) => {
  return (
    <section className="hero-section">
      <div className="brain-wrapper">
        {/* Outer Ring */}
        <div className={`categories-ring ${isActive ? 'visible' : ''}`}>
          <svg className="ring-svg" viewBox="0 0 800 800">
            <ellipse cx="400" cy="400" rx="360" ry="260" className="category-circle-line" />
          </svg>
        
          {/* Dynamic Categories Rendered Around the Ring */}
          {(() => {
            const MAX_VISIBLE = 12;
            const hasOverflow = categories.length > MAX_VISIBLE;
            const visibleCategories = categories.slice(0, MAX_VISIBLE);
            const totalRingNodes = hasOverflow ? MAX_VISIBLE + 1 : Math.max(visibleCategories.length, 1);
            
            const renderNode = (name, i, isSearchNode = false) => {
              const rx = 360;
              const ry = 260;
              const angle = -90 + (i * (360 / totalRingNodes));
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * rx;
              const y = Math.sin(rad) * ry;

              return (
                <div 
                  key={`category-${i}`} 
                  className="category-item"
                  onClick={() => {
                    if (isSearchNode) {
                      if (isAuthenticated) {
                        setSearchMode('categories');
                        setIsGlobalSearchOpen(true);
                      }
                      else alert("LogIn to use Global Search!");
                    } else {
                      isAuthenticated ? handleCategoryClick(name) : alert("Sign up to view inside this category!");
                    }
                  }}
                  style={{
                    '--x': `${x}px`,
                    '--y': `${y}px`,
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    background: isSearchNode ? 'rgba(var(--primary-rgb), 0.2)' : undefined,
                    borderColor: isSearchNode ? 'var(--primary)' : undefined,
                    color: isSearchNode ? 'var(--primary)' : undefined
                  }}
                >
                  <span style={{ fontWeight: isSearchNode ? '700' : '500' }}>{name}</span>
                </div>
              );
            };

            const nodes = visibleCategories.map((cat, i) => renderNode(cat, i));
            if (hasOverflow) {
              const remaining = categories.length - MAX_VISIBLE;
              nodes.push(renderNode(`+ ${remaining}`, MAX_VISIBLE, true));
            }
            return nodes;
          })()}
        </div>

        <div className="brain-glow"></div>
        
        <div 
          className={`brain-container ${isActive ? 'active' : ''}`} 
          onClick={handleBrainClick}
          aria-label={isActive ? "Deactivate Synapse" : "Activate Synapse"}
          role="button"
          tabIndex={0}
        >
          <svg className="brain-svg" viewBox="0 0 400 400">
            {/* Draw Connections */}
            {BRAIN_EDGES.map((edge, index) => {
              const n1 = BRAIN_NODES.find(n => n.id === edge[0]);
              const n2 = BRAIN_NODES.find(n => n.id === edge[1]);
              if (!n1 || !n2) return null;

              return (
                <line
                  key={`edge-${index}`}
                  x1={n1.x}
                  y1={n1.x === 200 && n1.id === 15 && isActive ? n1.y + 10 : n1.y}
                  x2={n2.x}
                  y2={n2.y}
                  className="connection"
                  style={{ strokeDasharray: isActive ? '5,5' : '1000' }}
                />
              );
            })}
            
            {/* Draw Nodes */}
            {BRAIN_NODES.map((node) => (
              <circle
                key={`node-${node.id}`}
                cx={node.x}
                cy={node.id === 15 && isActive ? node.y + 10 : node.y}
                r={isActive ? node.r * 1.15 : node.r}
                className={`node ${node.id === 15 ? 'node-pulse' : ''}`}
              />
            ))}
          </svg>
        </div>
        
        <div className="status-indicator">
          <div className={`status-dot ${isActive ? 'active' : ''}`}></div>
          <span className="status-text">{getIndicatorText()}</span>
        </div>

      </div>
    </section>
  );
};

export default BrainHero;
