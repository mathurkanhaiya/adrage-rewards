export const CURRENCY_CONFIG = {
  ADR: {
    symbol: '🪙',
    name: 'ADR',
    icon: 'https://repgyetdcodkynrbxocg.supabase.co/storage/v1/object/public/images/telegram-1774444520342-5dcb136a.jpg',
    decimals: 4,
  },
  TON: {
    symbol: '💎',
    name: 'TON',
    icon: 'https://repgyetdcodkynrbxocg.supabase.co/storage/v1/object/public/images/telegram-1774025032244-b83509e3.png',
    decimals: 8,
  },
  USDT: {
    symbol: '💵',
    name: 'USDT',
    icon: 'https://repgyetdcodkynrbxocg.supabase.co/storage/v1/object/public/images/telegram-1774025041026-a79b84fc.png',
    decimals: 6,
  },
  TRX: {
    symbol: '⚡',
    name: 'TRX',
    icon: 'https://repgyetdcodkynrbxocg.supabase.co/storage/v1/object/public/images/telegram-1774444246826-f18c06da.png',
    decimals: 6,
  },
  DOGE: {
    symbol: '🐶',
    name: 'DOGE',
    icon: 'https://repgyetdcodkynrbxocg.supabase.co/storage/v1/object/public/images/telegram-1774444250996-e27db588.png',
    decimals: 8,
  },
} as const;

export type CurrencyKey = keyof typeof CURRENCY_CONFIG;
