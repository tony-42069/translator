export const colors = {
  primary: {
    main: '#7B61FF',
    light: '#9D89FF',
    dark: '#5A3FFF',
  },
  secondary: {
    main: '#00FF94',
    light: '#33FFA8',
    dark: '#00CC76',
  },
  premium: {
    gradient: 'linear-gradient(45deg, #7B61FF, #00FF94)',
    elite: 'linear-gradient(45deg, #FFD700, #FF8C00)',
  },
  background: {
    default: '#FFFFFF',
    paper: '#F8F9FA',
    premium: 'rgba(123, 97, 255, 0.02)',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    disabled: '#999999',
  },
  status: {
    success: '#00E676',
    error: '#FF1744',
    warning: '#FFA000',
    info: '#00B0FF',
  }
};

export const shadows = {
  regular: '0 2px 4px rgba(0, 0, 0, 0.1)',
  premium: '0 4px 12px rgba(123, 97, 255, 0.15)',
  elite: '0 8px 24px rgba(255, 215, 0, 0.2)',
};

export const transitions = {
  smooth: 'all 0.3s ease-in-out',
  premium: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const borderRadius = {
  small: '4px',
  medium: '8px',
  large: '12px',
  premium: '16px',
};

export const typography = {
  fontFamily: {
    main: '"Inter", sans-serif',
    premium: '"Poppins", sans-serif',
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  sizes: {
    h1: '2.5rem',
    h2: '2rem',
    h3: '1.75rem',
    h4: '1.5rem',
    body1: '1rem',
    body2: '0.875rem',
    caption: '0.75rem',
  }
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const breakpoints = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
}; 