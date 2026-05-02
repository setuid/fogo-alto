import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="light"
      toastOptions={{
        classNames: {
          toast:
            'group toast bg-cream-paper text-ink border border-ink/10 shadow-card rounded-2xl',
          description: 'text-ink/60',
          actionButton: 'bg-tomato text-white',
          cancelButton: 'bg-ink/10 text-ink',
        },
      }}
    />
  );
}

export { toast } from 'sonner';
