// ---------------------------------------------------------------------------
// Lista — design tokens
// Carried over 1:1 from the approved HTML prototype.
// Direction: clean fintech, subtle Filipino accents (8-ray sun, Taglish copy).
// ---------------------------------------------------------------------------

export const colors = {
  // surfaces
  paper: '#F6F2EA',       // app background (warm paper white)
  paperAlt: '#EEEBE3',    // receipt screen background
  card: '#FFFFFF',
  // brand
  navy: '#20306E',        // Tindahan Blue — primary
  navyDeep: '#1A2657',
  navyDarker: '#141D44',
  gold: '#F4B53C',        // Sun Gold — accent / scan
  // semantic
  ink: '#161A33',         // primary text
  utang: '#DC5B3F',       // debt / "+" entries
  bayad: '#1F9D6B',       // payment / "−" entries
  // neutrals
  muted: '#8A8896',
  mutedSoft: '#A09EAC',
  border: '#ECE6DA',
  borderWarm: '#E4DECF',
  // tints
  tintUtang: '#FBEAE4',
  tintBayad: '#E4F4EC',
  tintNavy: '#EEF1FB',
  tintNavyBorder: '#D7DEF6',
  // onboarding gradient stops
  gradient: ['#243478', '#1A2657', '#141D44'],
  // on-dark text
  onNavy: '#FFFFFF',
  onNavyMuted: '#B9C0E4',
  onNavyFaint: '#9AA2D0',
};

// @expo-google-fonts family keys (loaded in App.js)
export const fonts = {
  display: 'SpaceGrotesk_700Bold',     // big peso amounts, wordmark, mono-ish data
  displayMd: 'SpaceGrotesk_500Medium',
  body: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const radius = {
  sm: 11,
  md: 14,
  lg: 18,
  xl: 24,
};

// Soft elevation used on cards / hero.
export const shadow = {
  card: {
    shadowColor: '#161A33',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  hero: {
    shadowColor: '#20306E',
    shadowOpacity: 0.28,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
};

export const peso = (n) =>
  '\u20B1' + Number(n).toLocaleString('en-PH');
