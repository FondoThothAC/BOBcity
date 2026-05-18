import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================
// Card Component
// ============================================================

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/5 backdrop-blur-xl p-6',
            'shadow-lg shadow-black/20',
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================
// Badge Component
// ============================================================

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
  className?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', children, className, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      danger: 'bg-red-500/20 text-red-400 border-red-500/30',
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };

    return (
      <span
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
            variantStyles[variant],
            className
          )
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// ============================================================
// Progress Bar Component
// ============================================================

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: 'emerald' | 'amber' | 'red' | 'blue';
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  color = 'emerald'
}: ProgressBarProps) {
  const percentage = (value / max) * 100;

  const colorStyles = {
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500',
    red: 'bg-gradient-to-r from-red-500 to-rose-500',
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500'
  };

  return (
    <div className={className}>
      <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorStyles[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-400 mt-1">{Math.round(percentage)}%</span>
      )}
    </div>
  );
}

// ============================================================
// Stat Card Component
// ============================================================

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ label, value, change, icon, trend = 'neutral' }: StatCardProps) {
  const trendStyles = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${trendStyles[trend]}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {Math.abs(change)}%
            </p>
          )}
        </div>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
    </Card>
  );
}

// ============================================================
// Tabs Component
// ============================================================

interface TabsProps {
  tabs: { id: string; label: string; content: ReactNode }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-emerald-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        ))}
      </div>
      <div>{tabs.find(t => t.id === activeTab)?.content}</div>
    </div>
  );
}

// ============================================================
// Button Component
// ============================================================

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30',
      secondary: 'bg-gray-700 text-white hover:bg-gray-600',
      ghost: 'bg-transparent text-gray-300 hover:bg-white/5'
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(
          clsx(
            'rounded-lg font-medium transition-all',
            variantStyles[variant],
            sizeStyles[size],
            (disabled || loading) && 'opacity-50 cursor-not-allowed',
            className
          )
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Cargando...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================
// Input Component
// ============================================================

interface InputProps extends HTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-300">{label}</label>
        )}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10',
              'text-white placeholder-gray-500',
              'focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
              'transition-colors',
              error && 'border-red-500 focus:border-red-500',
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================
// Select Component
// ============================================================

interface SelectProps extends HTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-300">{label}</label>
        )}
        <select
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10',
              'text-white',
              'focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
              'transition-colors',
              className
            )
          )}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';