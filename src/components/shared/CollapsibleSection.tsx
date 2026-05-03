import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  title: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

// Cabeçalho clicável + chevron animado + área que esconde/mostra. Estado
// é local — não persiste; suficiente pro caso de "menos rolagem na tela".
export function CollapsibleSection({ title, defaultOpen = true, className, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-3 flex w-full items-center justify-between gap-2 rounded-lg text-left text-stamp text-tomato-deep transition-colors hover:text-tomato"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            open ? '' : '-rotate-90'
          }`}
        />
      </button>
      {open && children}
    </div>
  );
}
