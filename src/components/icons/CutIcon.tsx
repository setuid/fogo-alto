import type { SVGProps } from 'react';

// Ícones SVG simples por corte. Stroke = currentColor, fill semi-transparente
// pra adaptar à paleta. Cada corte tem um shape característico (não fotográfico,
// mas reconhecível em ~24x24).

interface Props extends SVGProps<SVGSVGElement> {
  cutId: string;
}

const meatFill = 'rgba(241,90,34,0.18)';
const fatFill = 'rgba(255,244,224,0.85)';
const boneFill = 'rgba(255,251,242,0.95)';

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

export function CutIcon({ cutId, ...rest }: Props) {
  switch (cutId) {
    // Picanha: triângulo com capa de gordura no topo.
    case 'picanha':
      return (
        <svg {...baseProps(rest)}>
          <path d="M3 19 L26 8 L29 22 Z" fill={meatFill} />
          <path d="M5 18.4 L26 8 L29 10 L29 14 Z" fill={fatFill} />
        </svg>
      );

    // Fraldinha: corte fino e plano com fibras.
    case 'fraldinha':
      return (
        <svg {...baseProps(rest)}>
          <path d="M3 12 Q16 8 29 13 Q16 22 3 18 Z" fill={meatFill} />
          <path d="M6 13.5 Q16 11 26 14" />
          <path d="M6 16 Q16 13 26 17" />
          <path d="M6 18 Q16 15 26 19" />
        </svg>
      );

    // Maminha: gota/triângulo curvo.
    case 'maminha':
      return (
        <svg {...baseProps(rest)}>
          <path d="M5 22 Q18 6 28 18 Q22 26 5 22 Z" fill={meatFill} />
          <path d="M9 21 Q18 14 24 20" />
        </svg>
      );

    // Alcatra: bloco oval grande.
    case 'alcatra':
      return (
        <svg {...baseProps(rest)}>
          <ellipse cx="16" cy="16" rx="13" ry="8" fill={meatFill} />
          <path d="M6 16 Q16 13 26 16" />
        </svg>
      );

    // Contrafilé: bloco com capa de gordura.
    case 'contrafile':
      return (
        <svg {...baseProps(rest)}>
          <ellipse cx="16" cy="17" rx="13" ry="7" fill={meatFill} />
          <path d="M3 13 Q16 10 29 13 L29 14 Q16 11 3 14 Z" fill={fatFill} />
        </svg>
      );

    // Costela bovina: rack de costela com 4 ossos curvos.
    case 'costela_bovina':
    case 'costela_suina':
      return (
        <svg {...baseProps(rest)}>
          <rect x="3" y="6" width="26" height="20" rx="2" fill={meatFill} />
          <path d="M7 6 Q5 16 7 26" />
          <path d="M13 6 Q11 16 13 26" />
          <path d="M19 6 Q17 16 19 26" />
          <path d="M25 6 Q23 16 25 26" />
        </svg>
      );

    // Cupim: morro arredondado com veios.
    case 'cupim':
      return (
        <svg {...baseProps(rest)}>
          <path d="M3 24 Q16 4 29 24 Z" fill={meatFill} />
          <path d="M7 20 Q16 14 25 20" />
          <path d="M9 23 Q16 18 23 23" />
        </svg>
      );

    // Filé Mignon: cilindro liso (lombo).
    case 'file_mignon':
      return (
        <svg {...baseProps(rest)}>
          <rect x="3" y="11" width="26" height="10" rx="5" fill={meatFill} />
        </svg>
      );

    // Ribeye: oval grande com olho de marmoreio no centro.
    case 'ribeye':
    case 'bife_ancho':
      return (
        <svg {...baseProps(rest)}>
          <ellipse cx="16" cy="16" rx="13" ry="9" fill={meatFill} />
          <path d="M11 14 Q16 11 21 14 Q19 18 16 18 Q13 17 11 14 Z" fill={fatFill} />
        </svg>
      );

    // NY Strip: bife retangular com capa de gordura no topo.
    case 'ny_strip':
      return (
        <svg {...baseProps(rest)}>
          <rect x="3" y="11" width="26" height="12" rx="2" fill={meatFill} />
          <path d="M3 9 Q16 6 29 9 L29 12 Q16 9 3 12 Z" fill={fatFill} />
        </svg>
      );

    // T-Bone: T do osso central separando filé e contrafilé.
    case 't_bone':
      return (
        <svg {...baseProps(rest)}>
          <path d="M3 8 L29 8 L29 22 L18 22 L18 26 L14 26 L14 22 L3 22 Z" fill={meatFill} />
          <path d="M14 8 L18 8 L18 26 L14 26 Z" fill={boneFill} />
        </svg>
      );

    // Tomahawk: bife com osso longo lateral.
    case 'tomahawk':
      return (
        <svg {...baseProps(rest)}>
          <circle cx="11" cy="16" r="9" fill={meatFill} />
          <rect x="20" y="14.5" width="10" height="3" fill={boneFill} />
        </svg>
      );

    // Asado de Tira: 3 mantas com osso vertical.
    case 'asado_de_tira':
      return (
        <svg {...baseProps(rest)}>
          <rect x="3" y="9" width="26" height="14" rx="1" fill={meatFill} />
          <circle cx="9" cy="16" r="1.6" fill={boneFill} />
          <circle cx="16" cy="16" r="1.6" fill={boneFill} />
          <circle cx="23" cy="16" r="1.6" fill={boneFill} />
        </svg>
      );

    // Vacio: peça larga com gordura embaixo.
    case 'vacio':
      return (
        <svg {...baseProps(rest)}>
          <path d="M3 10 Q16 7 29 10 L29 22 Q16 25 3 22 Z" fill={meatFill} />
          <path d="M3 22 Q16 25 29 22 L29 24 Q16 27 3 24 Z" fill={fatFill} />
        </svg>
      );

    // Entranha: tira longa e estreita.
    case 'entranha':
      return (
        <svg {...baseProps(rest)}>
          <path d="M3 13 Q16 11 29 14 Q16 19 3 17 Z" fill={meatFill} />
          <path d="M5 14.5 Q16 13 27 15" />
          <path d="M5 16 Q16 14.5 27 16.5" />
        </svg>
      );

    // Matambre: lâmina fina e ampla.
    case 'matambre':
      return (
        <svg {...baseProps(rest)}>
          <rect x="3" y="11" width="26" height="10" rx="1" fill={meatFill} />
          <path d="M3 13.5 L29 13.5 M3 16 L29 16 M3 18.5 L29 18.5" />
        </svg>
      );

    // Pancetta: barriga estratificada (gordura/carne).
    case 'pancetta':
      return (
        <svg {...baseProps(rest)}>
          <rect x="3" y="7" width="26" height="18" rx="1" fill={meatFill} />
          <path d="M3 11 L29 11" stroke={fatFill} strokeWidth="2" />
          <path d="M3 16 L29 16" stroke={fatFill} strokeWidth="2" />
          <path d="M3 21 L29 21" stroke={fatFill} strokeWidth="2" />
        </svg>
      );

    // Bisteca suína: chop com osso.
    case 'bisteca_suina':
      return (
        <svg {...baseProps(rest)}>
          <path d="M5 8 Q5 4 14 4 Q26 4 27 14 Q27 26 14 26 Q5 26 5 18 Z" fill={meatFill} />
          <path d="M9 11 Q9 8 12 8 Q15 8 15 11 Q15 14 12 14 Q9 14 9 11 Z" fill={boneFill} />
        </svg>
      );

    // Linguiça / Salsichão: cilindro curvo com listras.
    case 'linguica':
    case 'salsichao':
      return (
        <svg {...baseProps(rest)}>
          <path d="M4 16 C 6 6 14 6 16 12 C 18 18 26 18 28 8" />
          <path d="M5 18 C 7 8 14 8 17 14 C 19 19 26 20 29 10" />
          <path d="M4 16 C 4 18 6 18 8 14 M16 12 C 18 14 20 14 22 10 M28 8 C 28 10 26 11 24 8" fill={meatFill} />
        </svg>
      );

    // Asinha de frango: triângulo arredondado da asa.
    case 'asinha_frango':
      return (
        <svg {...baseProps(rest)}>
          <path d="M5 18 Q4 6 16 8 Q26 10 27 18 Q22 24 14 22 Q7 22 5 18 Z" fill={meatFill} />
          <path d="M7 17 Q14 14 24 18" />
        </svg>
      );

    // Coração de frango: dois corações pequenos.
    case 'coracao_frango':
      return (
        <svg {...baseProps(rest)}>
          <path d="M10 18 C5 13 5 8 10 9 C13 7 14 11 10 18 Z" fill={meatFill} />
          <path d="M22 22 C17 17 17 12 22 13 C25 11 26 15 22 22 Z" fill={meatFill} />
        </svg>
      );

    // Sobrecoxa: drumstick (coxa).
    case 'sobrecoxa_frango':
      return (
        <svg {...baseProps(rest)}>
          <ellipse cx="11" cy="13" rx="8" ry="7" fill={meatFill} />
          <rect x="16" y="17" width="12" height="3" rx="1.5" fill={boneFill} transform="rotate(20 22 18)" />
          <circle cx="27" cy="22" r="2" fill={boneFill} />
        </svg>
      );

    // Salmão: filé/posta com listras.
    case 'salmao':
      return (
        <svg {...baseProps(rest)}>
          <path d="M3 16 Q16 7 26 16 Q16 25 3 16 Z" fill={meatFill} />
          <path d="M26 16 L30 12 L30 20 Z" fill={meatFill} />
          <path d="M9 14 Q16 12 22 14" />
          <path d="M9 18 Q16 16 22 18" />
        </svg>
      );

    // Queijo coalho: cubo no espeto.
    case 'queijo_coalho':
      return (
        <svg {...baseProps(rest)}>
          <rect x="9" y="6" width="14" height="14" rx="1" fill={fatFill} />
          <line x1="16" y1="20" x2="16" y2="29" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    // Pão de alho: pão fatiado.
    case 'pao_alho':
      return (
        <svg {...baseProps(rest)}>
          <path d="M3 22 Q3 8 16 8 Q29 8 29 22 L29 25 L3 25 Z" fill={fatFill} />
          <line x1="9" y1="13" x2="9" y2="22" />
          <line x1="14" y1="11" x2="14" y2="22" />
          <line x1="19" y1="11" x2="19" y2="22" />
          <line x1="24" y1="13" x2="24" y2="22" />
        </svg>
      );

    // Abacaxi: copa + corpo.
    case 'abacaxi':
      return (
        <svg {...baseProps(rest)}>
          <path d="M11 6 L13 2 L15 5 L17 1 L19 5 L21 3 L19 8 Z" fill={meatFill} />
          <ellipse cx="16" cy="19" rx="9" ry="10" fill={fatFill} />
          <path d="M10 13 L13 16 M10 19 L13 22 M19 13 L22 16 M19 19 L22 22 M16 11 L16 26" />
        </svg>
      );

    default:
      return (
        <svg {...baseProps(rest)}>
          <circle cx="16" cy="16" r="10" fill={meatFill} />
        </svg>
      );
  }
}
