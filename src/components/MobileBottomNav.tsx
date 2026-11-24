import React from 'react';
import { NavLink } from 'react-router-dom';

export const MobileBottomNav: React.FC = () => {
  const items = [
    { to: '/home', label: 'Home', icon: 'home' },
    { to: '/events', label: 'Explore', icon: 'explore' },
    { to: '/my-registrations', label: 'My Events', icon: 'confirmation_number' },
    { to: '/clubs', label: 'Clubs', icon: 'groups' },
    { to: '/my-profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <nav
      aria-label="Student mobile navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-light-surface-container-lowest border-t border-light-outline-variant grid grid-cols-5 shadow-lg"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[11px] font-label no-underline transition-colors ${
              isActive
                ? 'text-light-primary font-bold'
                : 'text-light-on-surface-variant hover:text-light-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            {item.icon}
          </span>
          <span className="truncate max-w-full px-1">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
