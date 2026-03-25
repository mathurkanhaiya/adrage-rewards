import { useLocation, useNavigate } from 'react-router-dom';
import { Pickaxe, Factory, Gift, ListTodo, Trophy } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Pickaxe },
  { path: '/mine', label: 'Mine', icon: Factory },
  { path: '/earn', label: 'Earn', icon: Gift },
  { path: '/tasks', label: 'Tasks', icon: ListTodo },
  { path: '/ranking', label: 'Rank', icon: Trophy },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-primary scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium font-display tracking-wider">{label}</span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-6 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
