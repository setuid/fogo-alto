import { useCallback, useEffect, useState } from 'react';

// Persistência local do guest_token por share_token.
// Permite ao convidado voltar e editar o RSVP/contribuições sem login.

const STORAGE_KEY = 'fogo-alto.guest-tokens';

type Map = Record<string, string>;

function read(): Map {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Map;
  } catch {
    return {};
  }
}

function write(map: Map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useGuestSession(shareToken: string | undefined) {
  const [guestToken, setGuestTokenState] = useState<string | null>(null);

  useEffect(() => {
    if (!shareToken) return;
    setGuestTokenState(read()[shareToken] ?? null);
  }, [shareToken]);

  const setGuestToken = useCallback(
    (token: string | null) => {
      if (!shareToken) return;
      const map = read();
      if (token) map[shareToken] = token;
      else delete map[shareToken];
      write(map);
      setGuestTokenState(token);
    },
    [shareToken],
  );

  return { guestToken, setGuestToken };
}
