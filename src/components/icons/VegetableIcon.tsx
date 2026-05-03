import type { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  vegetableId: string;
}

const baseProps = (props: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 32 32',
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

const fillCarrot = 'rgba(241,90,34,0.25)';
const fillGreen = 'rgba(122,139,61,0.35)';
const fillRed = 'rgba(196,50,23,0.30)';
const fillYellow = 'rgba(232,147,12,0.30)';
const fillTomato = 'rgba(196,50,23,0.35)';
const fillCream = 'rgba(255,244,224,0.85)';
const fillOnion = 'rgba(255,244,224,0.7)';
const fillEggplant = 'rgba(122,40,40,0.4)';
const fillMushroom = 'rgba(255,251,242,0.85)';

export function VegetableIcon({ vegetableId, ...rest }: Props) {
  switch (vegetableId) {
    // Cenoura: triângulo laranja com folhas verdes.
    case 'cenoura':
      return (
        <svg {...baseProps(rest)}>
          <path d="M14 5 L13 11 L17 11 L19 5 Z" fill={fillGreen} />
          <path d="M11 11 L21 11 L18 28 L14 28 Z" fill={fillCarrot} />
          <line x1="14" y1="14" x2="13.5" y2="22" />
          <line x1="18" y1="14" x2="18.5" y2="22" />
        </svg>
      );

    // Palmito pupunha: cilindro creme.
    case 'palmito_pupunha':
      return (
        <svg {...baseProps(rest)}>
          <ellipse cx="16" cy="7" rx="5" ry="2" fill={fillCream} />
          <path d="M11 7 L11 25 Q16 28 21 25 L21 7" fill={fillCream} />
          <path d="M11 12 Q16 15 21 12 M11 17 Q16 20 21 17" />
        </svg>
      );

    // Batata: oval marrom claro com olhinhos.
    case 'batata':
      return (
        <svg {...baseProps(rest)}>
          <ellipse cx="16" cy="16" rx="11" ry="9" fill={fillCream} />
          <circle cx="11" cy="14" r="0.8" />
          <circle cx="20" cy="13" r="0.8" />
          <circle cx="18" cy="19" r="0.8" />
        </svg>
      );

    // Cebola: bulbo redondo com listras e talo.
    case 'cebola':
      return (
        <svg {...baseProps(rest)}>
          <path d="M16 4 L14 8 M16 4 L18 8 M16 4 L16 8" fill="none" />
          <path d="M16 8 Q5 10 6 19 Q8 28 16 28 Q24 28 26 19 Q27 10 16 8 Z" fill={fillOnion} />
          <path d="M16 8 Q12 14 12 28 M16 8 Q20 14 20 28" />
        </svg>
      );

    // Tomate: bola vermelha com chapéu verde.
    case 'tomate':
      return (
        <svg {...baseProps(rest)}>
          <circle cx="16" cy="18" r="11" fill={fillTomato} />
          <path d="M11 8 L13 11 L16 7 L19 11 L21 8 L17 13 L15 13 Z" fill={fillGreen} />
        </svg>
      );

    // Pimentão vermelho.
    case 'pimentao_vermelho':
      return (
        <svg {...baseProps(rest)}>
          <path d="M11 8 L13 11 M16 7 L16 11 M21 8 L19 11" />
          <path d="M9 11 Q5 14 7 22 Q10 28 16 28 Q22 28 25 22 Q27 14 23 11 Q19 9 16 11 Q13 9 9 11 Z" fill={fillRed} />
        </svg>
      );

    // Pimentão amarelo.
    case 'pimentao_amarelo':
      return (
        <svg {...baseProps(rest)}>
          <path d="M11 8 L13 11 M16 7 L16 11 M21 8 L19 11" />
          <path d="M9 11 Q5 14 7 22 Q10 28 16 28 Q22 28 25 22 Q27 14 23 11 Q19 9 16 11 Q13 9 9 11 Z" fill={fillYellow} />
        </svg>
      );

    // Pimentão verde.
    case 'pimentao_verde':
      return (
        <svg {...baseProps(rest)}>
          <path d="M11 8 L13 11 M16 7 L16 11 M21 8 L19 11" />
          <path d="M9 11 Q5 14 7 22 Q10 28 16 28 Q22 28 25 22 Q27 14 23 11 Q19 9 16 11 Q13 9 9 11 Z" fill={fillGreen} />
        </svg>
      );

    // Aspargos: 3 talos verticais.
    case 'aspargos':
      return (
        <svg {...baseProps(rest)}>
          <path d="M11 5 L9 9 L11 28" fill={fillGreen} />
          <path d="M16 4 L14 9 L16 28" fill={fillGreen} />
          <path d="M21 5 L19 9 L21 28" fill={fillGreen} />
          <path d="M9 9 L13 9 M14 9 L18 9 M19 9 L23 9" />
        </svg>
      );

    // Abobrinha: cilindro verde longo.
    case 'abobrinha':
      return (
        <svg {...baseProps(rest)}>
          <path d="M5 18 Q5 10 14 8 Q24 6 27 14 Q28 22 19 24 Q9 26 5 18 Z" fill={fillGreen} />
          <line x1="22" y1="9" x2="24" y2="6" />
        </svg>
      );

    // Berinjela: pera roxa com chapéu.
    case 'berinjela':
      return (
        <svg {...baseProps(rest)}>
          <path d="M14 5 L12 9 L20 9 L18 5 Z" fill={fillGreen} />
          <path d="M12 9 Q6 13 8 22 Q12 28 18 27 Q26 25 24 16 Q22 9 12 9 Z" fill={fillEggplant} />
        </svg>
      );

    // Cogumelo (champignon): chapéu + talo.
    case 'cogumelo':
      return (
        <svg {...baseProps(rest)}>
          <path d="M5 16 Q5 7 16 7 Q27 7 27 16 L5 16 Z" fill={fillCream} />
          <path d="M11 16 L11 26 Q16 28 21 26 L21 16" fill={fillMushroom} />
          <circle cx="11" cy="11" r="1" />
          <circle cx="16" cy="9" r="1" />
          <circle cx="21" cy="11" r="1" />
        </svg>
      );

    default:
      return (
        <svg {...baseProps(rest)}>
          <circle cx="16" cy="16" r="9" fill={fillGreen} />
        </svg>
      );
  }
}
