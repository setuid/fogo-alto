import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';

export function AuthPage() {
  const { t } = useTranslation('common');
  const { signInWithPassword, signUpWithPassword, signInWithMagicLink, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  if (!configured) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Supabase não configurado</CardTitle>
            <CardDescription>
              Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no seu
              <code> .env</code> e reinicie o dev server.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const onMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithMagicLink(email);
      setMagicSent(true);
      toast.success('Link enviado. Confira seu e-mail.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const onPassword = async (e: React.FormEvent, mode: 'sign-in' | 'sign-up') => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'sign-in') await signInWithPassword(email, password);
      else {
        await signUpWithPassword(email, password);
        toast.success('Conta criada — verifique seu e-mail se houver confirmação.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flame className="h-9 w-9 text-tomato animate-ember" strokeWidth={2.25} />
          <div>
            <h1 className="font-display text-3xl font-semibold leading-none">{t('app_name')}</h1>
            <p className="mt-1 text-sm text-ink/60">{t('tagline')}</p>
          </div>
        </div>
        <LanguageToggle />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Anfitriões usam e-mail para entrar. Convidados acessam pelo link compartilhado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="magic">
            <TabsList className="w-full">
              <TabsTrigger value="magic" className="flex-1">
                Link mágico
              </TabsTrigger>
              <TabsTrigger value="password" className="flex-1">
                Senha
              </TabsTrigger>
            </TabsList>

            <TabsContent value="magic">
              {magicSent ? (
                <p className="rounded-xl bg-olive/15 p-4 text-sm text-olive-deep">
                  Enviamos um link para <strong>{email}</strong>. Clique para entrar.
                </p>
              ) : (
                <form onSubmit={onMagic} className="space-y-4">
                  <div>
                    <Label htmlFor="email-magic">E-mail</Label>
                    <Input
                      id="email-magic"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="voce@exemplo.com"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? t('loading') : 'Enviar link'}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="password">
              <form className="space-y-4" onSubmit={(e) => onPassword(e, 'sign-in')}>
                <div>
                  <Label htmlFor="email-pw">E-mail</Label>
                  <Input
                    id="email-pw"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? t('loading') : 'Entrar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={(e) => onPassword(e as unknown as React.FormEvent, 'sign-up')}
                    className="flex-1"
                  >
                    Criar conta
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
