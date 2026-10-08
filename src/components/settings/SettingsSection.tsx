import type { ComponentType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
  danger?: boolean;
}

export const SettingsSection = ({ icon: Icon, title, children, danger }: SettingsSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border overflow-hidden",
        danger 
          ? "border-destructive/30 bg-destructive/5" 
          : "border-border bg-card"
      )}
    >
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 border-b",
        danger ? "border-destructive/20" : "border-border"
      )}>
        <Icon className={cn(
          "w-5 h-5",
          danger ? "text-destructive" : "text-primary"
        )} />
        <h3 className={cn(
          "font-semibold text-sm uppercase tracking-wide",
          danger ? "text-destructive" : "text-foreground"
        )}>
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {children}
      </div>
    </motion.div>
  );
};
