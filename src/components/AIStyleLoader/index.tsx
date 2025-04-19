import React from "react";

// Props 인터페이스 정의
interface AIStyleLoaderProps {
  statusText?: string;
  size?: "sm" | "md" | "lg";
}

const AIStyleLoader: React.FC<AIStyleLoaderProps> = ({
  statusText = "INITIALIZING SYSTEM",
  size = "md",
}) => {
  // Calculate size based on the prop
  const getSizeClass = (): string => {
    switch (size) {
      case "sm":
        return "w-32 h-32";
      case "lg":
        return "w-96 h-96";
      case "md":
      default:
        return "w-64 h-64";
    }
  };

  // Apply custom styles for animations
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes jarvis-ping {
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
      }

      .jarvis-animate-ping {
        animation: jarvis-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      }

      @keyframes jarvis-pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .jarvis-animate-pulse {
        animation: jarvis-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      @keyframes jarvis-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .jarvis-animate-spin {
        animation: jarvis-spin 1s linear infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className={`relative flex items-center justify-center ${getSizeClass()}`}
    >
      {/* Background triangular grid */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="triGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(2)"
            >
              <path
                d="M0,0 L20,0 L10,17.32 Z"
                fill="none"
                stroke="#b946eb"
                strokeWidth="0.3"
                transform="translate(0,0)"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#triGrid)" />
        </svg>
      </div>

      {/* Rotating Triangles */}
      <div className="absolute inset-0">
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="relative w-3/4 h-3/4 jarvis-animate-spin"
              style={{
                animationDuration: `${10 + idx * 5}s`,
                transform: `rotate(${idx * 120}deg)`,
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#b946eb] rounded-full"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 bg-[#b946eb] opacity-40"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Holographic rings */}
      <div className="absolute inset-0">
        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="w-1/2 h-1/2 border border-[#b946eb] opacity-60"
              style={{ transform: `rotate(${ring * 30}deg)` }}
            ></div>
          </div>
        ))}
      </div>

      {/* Pulsing rings */}
      <div className="absolute inset-0">
        {[1, 2].map((ring) => (
          <div
            key={ring}
            className="absolute inset-0 border border-[#b946eb] rounded-full opacity-0 jarvis-animate-ping"
            style={{
              animationDuration: `${2 + ring}s`,
              animationDelay: `${ring * 0.5}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Central element */}
      <div className="relative w-1/3 h-1/3">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-2/3 h-2/3 bg-[#b946eb] opacity-20 jarvis-animate-pulse"
            style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
          ></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 border border-[#b946eb] rounded-full"></div>
          <div className="absolute w-1/3 h-1/3 bg-[#b946eb] rounded-full opacity-30 jarvis-animate-pulse"></div>
        </div>
      </div>

      {/* Energy beams */}
      <div className="absolute inset-0">
        {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
          <div
            key={idx}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-[#b946eb] to-transparent opacity-40"
            style={{
              transform: `rotate(${angle}deg) scaleX(0.7)`,
              animationDelay: `${idx * 0.2}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Status text with glowing effect */}
      {statusText && (
        <div className="absolute bottom-4 w-full text-center text-[#b946eb] font-mono text-sm tracking-wider">
          <span className="relative">
            <span className="absolute inset-0 jarvis-animate-pulse blur-sm">
              {statusText}
            </span>
            {statusText}
          </span>
        </div>
      )}
    </div>
  );
};

export default AIStyleLoader;
