import { colors, shadows, transitions, borderRadius, typography } from './index';

export const premiumComponents = {
  // Premium Card Component
  Card: {
    base: {
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.medium,
      padding: '24px',
      transition: transitions.smooth,
      boxShadow: shadows.regular,
    },
    premium: {
      backgroundColor: colors.background.premium,
      borderRadius: borderRadius.premium,
      boxShadow: shadows.premium,
      border: `1px solid rgba(123, 97, 255, 0.1)`,
      backdropFilter: 'blur(10px)',
    },
    elite: {
      background: `linear-gradient(135deg, rgba(123, 97, 255, 0.05), rgba(0, 255, 148, 0.05))`,
      boxShadow: shadows.elite,
      border: `1px solid rgba(255, 215, 0, 0.2)`,
    }
  },

  // Quality Indicator Component
  QualityIndicator: {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: borderRadius.large,
      fontFamily: typography.fontFamily.premium,
    },
    basic: {
      backgroundColor: colors.background.paper,
      color: colors.text.secondary,
    },
    premium: {
      background: colors.premium.gradient,
      color: '#FFFFFF',
    },
    elite: {
      background: colors.premium.elite,
      color: '#FFFFFF',
    }
  },

  // Premium Button Component
  Button: {
    base: {
      padding: '12px 24px',
      borderRadius: borderRadius.medium,
      fontFamily: typography.fontFamily.premium,
      fontWeight: typography.fontWeights.semibold,
      transition: transitions.premium,
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
    },
    primary: {
      background: colors.primary.main,
      color: '#FFFFFF',
      '&:hover': {
        background: colors.primary.dark,
        transform: 'translateY(-2px)',
      }
    },
    premium: {
      background: colors.premium.gradient,
      color: '#FFFFFF',
      boxShadow: shadows.premium,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(123, 97, 255, 0.2)',
      }
    }
  },

  // Premium Header Component
  Header: {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      background: colors.background.default,
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    },
    premium: {
      background: colors.background.premium,
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(123, 97, 255, 0.1)',
    }
  },

  // Call Interface Component
  CallInterface: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px',
    },
    controls: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      padding: '16px',
      borderRadius: borderRadius.large,
      background: colors.background.paper,
    },
    premium: {
      background: colors.background.premium,
      boxShadow: shadows.premium,
    }
  },

  // Translation Status Component
  TranslationStatus: {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: borderRadius.medium,
      fontFamily: typography.fontFamily.premium,
    },
    active: {
      background: colors.status.success,
      color: '#FFFFFF',
    },
    error: {
      background: colors.status.error,
      color: '#FFFFFF',
    }
  }
}; 