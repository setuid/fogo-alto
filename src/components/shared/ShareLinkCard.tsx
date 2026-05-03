import { Check, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

export function ShareLinkCard({ shareToken }: { shareToken: string }) {
  const { t } = useTranslation(['barbecue', 'common']);
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}${window.location.pathname}#/g/${shareToken}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('common:actions.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('common:error_generic'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Share2 className="h-5 w-5 text-tomato" />
          {t('barbecue:share.title')}
        </CardTitle>
        <CardDescription>{t('barbecue:share.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {/* min-w-0 é essencial: sem isso, o flex-1 deixa o code esticar
              à medida que precisa, empurrando a viewport e quebrando o
              layout responsivo. */}
          <code className="block flex-1 min-w-0 truncate rounded-xl bg-ink/5 px-3 py-2 text-xs text-ink/70">
            {url}
          </code>
          <Button onClick={copy} variant="default" size="default" className="shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">{t('barbecue:share.copy_link')}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
