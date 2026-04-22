export const ACTIVITY_TYPES = [
  'Pekerjaan',
  'Olahraga',
  'Hiburan',
  'Belajar',
  'Lainnya'
];

export const GOAL_OPTIONS = [
  'Bulking',
  'Cutting',
  'Maintenance'
];

export const EQUIPMENT_OPTIONS = [
  'Gym / Dengan Alat',
  'Tanpa Alat / Bodyweight'
];

export const GENDER_OPTIONS = [
  { id: 'male', label: 'Laki-laki' },
  { id: 'female', label: 'Perempuan' }
];

export const INITIAL_MEAL_FORM = {
  name: '',
  protein: 0,
  calories: 0,
  carbs: 0
};

export const EXPENSE_CATEGORIES = [
  { id: 'makanan', label: 'Makanan', icon: 'Utensils' },
  { id: 'transportasi', label: 'Transportasi', icon: 'Car' },
  { id: 'hiburan', label: 'Hiburan', icon: 'Gamepad2' },
  { id: 'tagihan', label: 'Tagihan', icon: 'Receipt' },
  { id: 'kesehatan', label: 'Kesehatan', icon: 'HeartPulse' },
  { id: 'pendidikan', label: 'Pendidikan', icon: 'GraduationCap' },
  { id: 'tabungan', label: 'Tabungan', icon: 'Wallet' },
  { id: 'lainnya', label: 'Lainnya', icon: 'MoreHorizontal' }
];

export const INCOME_CATEGORIES = [
  { id: 'gaji', label: 'Gaji / Kerja', icon: 'Briefcase' },
  { id: 'orang_tua', label: 'Dari Orang Tua', icon: 'Heart' },
  { id: 'tabungan', label: 'Ambil dari Tabungan', icon: 'ArrowUpRight' },
  { id: 'bonus', label: 'Bonus / Komisi', icon: 'Sparkles' },
  { id: 'investasi', label: 'Investasi', icon: 'TrendingUp' },
  { id: 'lainnya', label: 'Lainnya', icon: 'MoreHorizontal' }
];

// Helper to get unique categories by ID for lookups (like icons/labels)
const allCats = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
export const TRANSACTION_CATEGORIES = Array.from(new Map(allCats.map(c => [c.id, c])).values());

export const THEME = {
  colors: {
    olive: '#606C38',
    darkOlive: '#283618',
    bg: '#FEFAE0',
    peach: '#DDA15E',
    terracotta: '#BC6C25',
    ink: '#2B2D42',
    mute: '#8D99AE',
    line: '#EDF2F4'
  }
};
