export const theme = {
  colors: {
    primary: '#1a73e8',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#212529',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
  },
  fonts: {
    bodySize: '1rem',
    titleSize: '1.5rem',
    headingSize: '2rem',
  },
  spacing: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    xlarge: '2rem',
  },
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '992px',
    largeDesktop: '1200px',
  },
};

export type Theme = typeof theme;
export default theme;