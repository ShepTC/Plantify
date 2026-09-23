import React from 'react';
import { Link } from 'react-router-dom';

export default function BottomNavBar({ navigationItems, location }) {
  return (
    <nav className="bottom-nav-bar bg-transparent my-2 p-2 block md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-lg flex justify-around items-center h-16 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col gap-1 items-center justify-center w-full h-full rounded-xl transition-colors duration-200 ${
              isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`
              }>

              {React.createElement(item.icon, { className: "w-5 h-5" })}
              <span className="text-[11px] font-semibold">{item.title}</span>
            </Link>);

        })}
      </div>
    </nav>);

}