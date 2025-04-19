export const theme = {
  colors: {
    primary: "#A020F0", // 브랜드 메인 컬러로 변경
    secondary: "#8A2BE2", // 보라계열 보조색상 조정
    background: "#ffffff",
    text: "#2b2d42",
    success: "#38b000",
    danger: "#e5383b",
    warning: "#ffba08",
    info: "#00b4d8",
    light: "#f8f9fa",
    dark: "#212529",
    accent: "#D891EF", // 액센트 컬러 조정
    neutral: "#6c757d", // 중립 컬러
  },
  fonts: {
    bodySize: "1rem",
    titleSize: "1.5rem",
    headingSize: "2rem",
  },
  spacing: {
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
