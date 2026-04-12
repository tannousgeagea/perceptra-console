import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const THEMES = [
  { value: 'light',  icon: Sun,     label: 'Light'  },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark',   icon: Moon,    label: 'Dark'   },
] as const;

type ThemeValue = typeof THEMES[number]['value'];

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export function ThemeToggle({ isCollapsed }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch on first render
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Collapsed: single icon that cycles to the next theme on click
  if (isCollapsed) {
    const idx = THEMES.findIndex(t => t.value === theme);
    const current = THEMES[idx >= 0 ? idx : 1];
    const next    = THEMES[(idx + 1) % THEMES.length];
    const Icon    = current.icon;
    return (
      <button
        onClick={() => setTheme(next.value as ThemeValue)}
        title={`Theme: ${current.label} — click to switch`}
        className="w-full flex items-center justify-center p-2 rounded-md
                   text-white/60 hover:text-white hover:bg-white/10
                   transition-colors duration-200"
      >
        <Icon size={18} />
      </button>
    );
  }

  // Expanded: pill-style segmented control
  return (
    <div className="flex items-center gap-0.5 bg-white/10 rounded-lg p-1 mx-1">
      {THEMES.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value as ThemeValue)}
          title={label}
          className={cn(
            'flex flex-1 items-center justify-center gap-1 py-1.5 rounded-md',
            'text-[11px] font-medium transition-all duration-200',
            theme === value
              ? 'bg-white/25 text-white shadow-sm'
              : 'text-white/50 hover:text-white/80 hover:bg-white/10',
          )}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}
