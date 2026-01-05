import { usePerformance } from '@/contexts/PerformanceContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Zap, ZapOff, Gauge, Sparkles, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceToggleProps {
  className?: string;
  variant?: 'icon' | 'full';
}

export function PerformanceToggle({ className, variant = 'icon' }: PerformanceToggleProps) {
  const { performanceLevel, setPerformanceLevel, isEnabled, setIsEnabled, detectPerformance } = usePerformance();

  const levelIcons = {
    high: <Sparkles className="h-4 w-4" />,
    medium: <Gauge className="h-4 w-4" />,
    low: <Cpu className="h-4 w-4" />,
  };

  const levelLabels = {
    high: 'High Quality',
    medium: 'Balanced',
    low: 'Performance',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === 'icon' ? 'icon' : 'sm'}
          className={cn(
            'transition-colors',
            isEnabled ? 'text-primary' : 'text-muted-foreground',
            className
          )}
        >
          {isEnabled ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
          {variant === 'full' && (
            <span className="ml-2">{isEnabled ? levelLabels[performanceLevel] : 'Disabled'}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>3D Animations</span>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            aria-label="Toggle 3D animations"
          />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isEnabled && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Quality Preset
            </DropdownMenuLabel>
            {(['high', 'medium', 'low'] as const).map((level) => (
              <DropdownMenuItem
                key={level}
                onClick={() => setPerformanceLevel(level)}
                className={cn(
                  'flex items-center gap-2 cursor-pointer',
                  performanceLevel === level && 'bg-accent'
                )}
              >
                {levelIcons[level]}
                <span>{levelLabels[level]}</span>
                {performanceLevel === level && (
                  <span className="ml-auto text-xs text-primary">Active</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={detectPerformance} className="cursor-pointer">
              <Cpu className="h-4 w-4 mr-2" />
              Auto-detect
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
