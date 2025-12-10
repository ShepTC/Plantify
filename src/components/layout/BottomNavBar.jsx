import React from 'react';
import { Link } from 'react-router-dom';

export default function BottomNavBar({ navigationItems, location }) {
  return (
    <nav className="bottom-nav-bar bg-transparent my-2 p-2 block md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/70 dark:bg-black/60 [backdrop-filter:blur(16px)_saturate(180%)] border border-white/50 dark:border-white/15 rounded-2xl shadow-lg flex justify-around items-center h-16 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center justify-center w-full h-full rounded-lg transition-colors duration-200 ${
              isActive ? 'text-primary' : 'text-gray-600 dark:text-white hover:text-primary'}`
              }>

              {React.createElement(item.icon, { className: "w-7 h-7" })}
            </Link>);

        })}
      </div>
    </nav>);

}