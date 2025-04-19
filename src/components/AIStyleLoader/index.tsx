import React from "react";
import styled, { keyframes } from "styled-components";

type LoaderSize = "sm" | "md" | "lg";

interface AIStyleLoadingProps {
  statusText?: string;
  size?: LoaderSize;
  color?: string;
}

// Keyframes
const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const ping = keyframes`
  0% {
    transform: scale(1);
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

// Size mapping
const getSize = (size: LoaderSize): string => {
  switch (size) {
    case "sm":
      return "8rem"; // 128px
    case "lg":
      return "24rem"; // 384px
    case "md":
    default:
      return "16rem"; // 256px
  }
};

// Container
const LoaderContainer = styled.div<{ size: LoaderSize }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => getSize(props.size)};
  height: ${(props) => getSize(props.size)};
`;

// Background triangular grid
const BackgroundGrid = styled.div<{ color: string }>`
  position: absolute;
  inset: 0;
  opacity: 0.2;
`;

// Rotating triangles container
const RotatingTrianglesContainer = styled.div`
  position: absolute;
  inset: 0;
`;

// Single rotating triangle
const RotatingTriangle = styled.div<{ index: number; color: string }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .triangle-spinner {
    position: relative;
    width: 75%;
    height: 75%;
    animation: ${spin} linear infinite;
    animation-duration: ${(props) => 10 + props.index * 5}s;
    transform: rotate(${(props) => props.index * 120}deg);
  }

  .triangle-dot {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    background-color: ${(props) => props.color};
  }

  .triangle-line {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0.125rem;
    height: 50%;
    background-color: ${(props) => props.color};
    opacity: 0.4;
  }
`;

// Holographic rings container
const HolographicRingsContainer = styled.div`
  position: absolute;
  inset: 0;
`;

// Holographic ring
const HolographicRing = styled.div<{ ring: number; color: string }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .ring {
    width: 50%;
    height: 50%;
    border: 1px solid ${(props) => props.color};
    opacity: 0.6;
    transform: rotate(${(props) => props.ring * 30}deg);
  }
`;

// Pulsing rings container
const PulsingRingsContainer = styled.div`
  position: absolute;
  inset: 0;
`;

// Pulsing ring
const PulsingRing = styled.div<{ ring: number; color: string }>`
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 1px solid ${(props) => props.color};
  opacity: 0;
  animation: ${ping} cubic-bezier(0, 0, 0.2, 1) infinite;
  animation-duration: ${(props) => 2 + props.ring}s;
  animation-delay: ${(props) => props.ring * 0.5}s;
`;

// Central element container
const CentralElement = styled.div`
  position: relative;
  width: 33.333%;
  height: 33.333%;
`;

// Triangle element
const TriangleElement = styled.div<{ color: string }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .triangle {
    width: 66.666%;
    height: 66.666%;
    background-color: ${(props) => props.color};
    opacity: 0.2;
    animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  }
`;

// Center circle
const CenterCircle = styled.div<{ color: string }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .outer-circle {
    width: 50%;
    height: 50%;
    border-radius: 9999px;
    border: 1px solid ${(props) => props.color};
  }

  .inner-circle {
    position: absolute;
    width: 33.333%;
    height: 33.333%;
    border-radius: 9999px;
    background-color: ${(props) => props.color};
    opacity: 0.3;
    animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

// Energy beams container
const EnergyBeamsContainer = styled.div`
  position: absolute;
  inset: 0;
`;

// Energy beam
const EnergyBeam = styled.div<{ angle: number; index: number; color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(${(props) => props.angle}deg)
    scaleX(0.7);
  width: 100%;
  height: 0.125rem;
  background: linear-gradient(
    to right,
    transparent,
    ${(props) => props.color},
    transparent
  );
  opacity: 0.4;
  animation-delay: ${(props) => props.index * 0.2}s;
`;

// Status text container
const StatusTextContainer = styled.div<{ color: string }>`
  position: absolute;
  bottom: 1rem;
  width: 100%;
  text-align: center;
  font-family: monospace;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  color: ${(props) => props.color};

  .text-wrapper {
    position: relative;
  }

  .glow-text {
    position: absolute;
    inset: 0;
    filter: blur(4px);
    animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

const AIStyleLoading: React.FC<AIStyleLoadingProps> = ({
  statusText = "INITIALIZING SYSTEM",
  size = "md",
  color = "#b946eb",
}) => {
  // Generate a unique ID for SVG patterns
  const patternId = React.useMemo(
    () => `trianglePattern-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  return (
    <LoaderContainer size={size}>
      <BackgroundGrid color={color}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={patternId}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(2)"
            >
              <path
                d="M0,0 L20,0 L10,17.32 Z"
                fill="none"
                stroke={color}
                strokeWidth="0.3"
                transform="translate(0,0)"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </BackgroundGrid>

      <RotatingTrianglesContainer>
        {[0, 1, 2].map((idx) => (
          <RotatingTriangle key={idx} index={idx} color={color}>
            <div className="triangle-spinner">
              <div className="triangle-dot"></div>
              <div className="triangle-line"></div>
            </div>
          </RotatingTriangle>
        ))}
      </RotatingTrianglesContainer>

      <HolographicRingsContainer>
        {[1, 2, 3].map((ring) => (
          <HolographicRing key={ring} ring={ring} color={color}>
            <div className="ring"></div>
          </HolographicRing>
        ))}
      </HolographicRingsContainer>

      <PulsingRingsContainer>
        {[1, 2].map((ring) => (
          <PulsingRing key={ring} ring={ring} color={color} />
        ))}
      </PulsingRingsContainer>

      <CentralElement>
        <TriangleElement color={color}>
          <div className="triangle"></div>
        </TriangleElement>

        <CenterCircle color={color}>
          <div className="outer-circle"></div>
          <div className="inner-circle"></div>
        </CenterCircle>
      </CentralElement>

      <EnergyBeamsContainer>
        {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
          <EnergyBeam key={idx} angle={angle} index={idx} color={color} />
        ))}
      </EnergyBeamsContainer>

      {statusText && (
        <StatusTextContainer color={color}>
          <span className="text-wrapper">
            <span className="glow-text">{statusText}</span>
            {statusText}
          </span>
        </StatusTextContainer>
      )}
    </LoaderContainer>
  );
};

export default AIStyleLoading;
