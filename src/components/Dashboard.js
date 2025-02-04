import React from 'react';
import { colors, shadows, typography } from '../theme';
import { premiumComponents } from '../theme/components';

const Dashboard = ({ children, userTier = 'basic' }) => {
  const isPremium = userTier === 'premium' || userTier === 'elite';
  const isElite = userTier === 'elite';

  return (
    <div className="dashboard" style={{
      minHeight: '100vh',
      background: isPremium ? colors.background.premium : colors.background.default,
    }}>
      {/* Header */}
      <header style={{
        ...premiumComponents.Header.container,
        ...(isPremium && premiumComponents.Header.premium)
      }}>
        <div className="logo" style={{
          fontFamily: typography.fontFamily.premium,
          fontWeight: typography.fontWeights.bold,
          fontSize: typography.sizes.h3,
          background: isPremium ? colors.premium.gradient : 'none',
          WebkitBackgroundClip: isPremium ? 'text' : 'none',
          WebkitTextFillColor: isPremium ? 'transparent' : colors.text.primary,
        }}>
          Albanian Translator
        </div>

        {/* Quality Indicator */}
        <div style={{
          ...premiumComponents.QualityIndicator.container,
          ...(isPremium ? premiumComponents.QualityIndicator.premium : premiumComponents.QualityIndicator.basic),
          ...(isElite && premiumComponents.QualityIndicator.elite)
        }}>
          <span className="material-icons">
            {isElite ? 'workspace_premium' : (isPremium ? 'stars' : 'check_circle')}
          </span>
          {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Quality
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          ...premiumComponents.Card.base,
          ...(isPremium && premiumComponents.Card.premium),
          ...(isElite && premiumComponents.Card.elite),
        }}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        color: colors.text.secondary,
        fontFamily: typography.fontFamily.main,
      }}>
        <p>© 2024 Albanian Translator. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard; 