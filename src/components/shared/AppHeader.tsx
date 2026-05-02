import { Flame, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '@/lib/auth';

interface AppHeaderProps {
  showAuthControls?: boolean;
}

export function AppHeader({ showAuthControls = true }: AppHeaderProps) {
  const { t } = useTranslation('common');
  const { user, signOut, configured } = useAuth();

  return (
    <header className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-6 sm:py-8">
      <Link to="/" className="flex items-center gap-3">
        <Flame className="h-8 w-8 text-tomato animate-ember" strokeWidth={2.25} aria-hidden />
        <div>
          <span className="block font-display text-2xl font-semibold leading-none">
            {t('app_name')}
          </span>
          <span className="text-xs text-ink/55">{t('tagline')}</span>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        {showAuthControls && configured && user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void signOut()}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
