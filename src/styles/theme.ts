export const theme = {
  colors: {
    primary: "#A020F0",
    secondary: "#8A2BE2",
    background: "#ffffff",
    text: "#2b2d42",
    success: "#38b000",
    danger: "#e5383b",
    warning: "#ffba08",
    info: "#00b4d8",
    light: "#f8f9fa",
    dark: "#212529",
    accent: "#D891EF",
    neutral: "#6c757d",
  },
  fonts: {
    bodySize: "1rem",
    titleSize: "1.5rem",
    headingSize: "2rem",
  },
  spacing: {
    xsmall: "0.25rem",
    small: "0.5rem",
    medium: "1rem",
    large: "1.5rem",
    xlarge: "2rem",
  },
  breakpoints: {
    mobile: "576px",
    tablet: "768px",
    desktop: "992px",
    largeDesktop: "1200px",
  },
};

export type Theme = typeof theme;
export default theme;
