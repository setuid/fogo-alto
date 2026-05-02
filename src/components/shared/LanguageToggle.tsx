import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LANGUAGES: { code: 'pt-BR' | 'en'; labelKey: 'language_pt' | 'language_en' }[] = [
  { code: 'pt-BR', labelKey: 'language_pt' },
  { code: 'en', labelKey: 'language_en' },
];

export function LanguageToggle() {
  const { i18n, t } = useTranslation('common');
  const current = (i18n.resolvedLanguage ?? i18n.language) as 'pt-BR' | 'en';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label={t('language')}>
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {current === 'pt-BR' ? 'PT' : 'EN'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map(({ code, labelKey }) => (
          <DropdownMenuCheckboxItem
            key={code}
            checked={current === code}
            onCheckedChange={() => void i18n.changeLanguage(code)}
          >
            {t(labelKey)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
