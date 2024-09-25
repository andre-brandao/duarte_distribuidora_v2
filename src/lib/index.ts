// place files you want to import through the `$lib` alias in this folder.
export const themes = [
  'bumblebee',
  'light',
  'dark',
  'cupcake',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
] as const

export type Theme = (typeof themes)[number]

export function changeTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_NAME = 'total';
export const DEFAULT_VALUE = 0;
export const DEFAULT_FRACTION_DIGITS = 2;

export const DEFAULT_CLASS_WRAPPER = 'currencyInput';
export const DEFAULT_CLASS_UNFORMATTED = 'currencyInput__unformatted';
export const DEFAULT_CLASS_FORMATTED = 'currencyInput__formatted';
export const DEFAULT_CLASS_FORMATTED_POSITIVE = 'currencyInput__formatted--positive';
export const DEFAULT_CLASS_FORMATTED_NEGATIVE = 'currencyInput__formatted--negative';
export const DEFAULT_CLASS_FORMATTED_ZERO = 'currencyInput__formatted--zero';

export interface InputClasses {
  wrapper?: string;
  unformatted?: string;
  formatted?: string;
  formattedPositive?: string;
  formattedNegative?: string;
  formattedZero?: string;
}

export type Callback = (value: number) => any;