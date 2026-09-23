import React from 'react';
import { Link } from 'react-router-dom';

export default function BottomNavBar({ navigationItems, location }) {
  return (
    <nav className="bottom-nav-bar fixed bottom-0 left-0 right-0 z-50 block md:hidden px-4 pb-3 pt-2">
      <div className="mx-auto flex max-w-sm items-center gap-1 rounded-[26px] border border-border/60 bg-card/75 p-1.5 shadow-xl shadow-black/5 [backdrop-filter:blur(18px)_saturate(180%)]">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-[20px] text-[10px] font-semibold transition-all duration-200 ${
                isActive ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {React.createElement(item.icon, { className: 'w-5 h-5' })}
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}