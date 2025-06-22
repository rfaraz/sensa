import React, { useState, useEffect, useRef } from 'react';

interface InteractiveBlueBackgroundProps {
  children: React.ReactNode;
}

const InteractiveBlueBackground = ({ children }: InteractiveBlueBackgroundProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
  }
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate initial particles
  useEffect(() => {
    const initialParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setParticles(initialParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.speedX + 100) % 100,
        y: (particle.y + particle.speedY + 100) % 100,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Track mouse movement
  const handleMouseMove = (e: { clientX: number; clientY: number; }) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{
        background: `
          radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, 
            rgba(59, 130, 246, 0.8) 0%, 
            rgba(37, 99, 235, 0.6) 25%, 
            rgba(29, 78, 216, 0.8) 50%, 
            rgba(30, 58, 138, 0.9) 75%, 
            rgba(15, 23, 42, 1) 100%
          )
        `
      }}
    >
      {/* Animated gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            linear-gradient(
              45deg,
              rgba(59, 130, 246, 0.3) 0%,
              rgba(37, 99, 235, 0.2) 25%,
              rgba(29, 78, 216, 0.3) 50%,
              rgba(30, 58, 138, 0.2) 75%,
              rgba(59, 130, 246, 0.3) 100%
            )
          `,
          animation: 'gradientShift 8s ease-in-out infinite',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              transform: `translate(-50%, -50%)`,
              animation: 'twinkle 3s ease-in-out infinite',
              animationDelay: `${particle.id * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Mouse follower effect */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(147, 197, 253, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          transition: 'all 0.3s ease-out',
        }}
      />

      {/* Geometric shapes */}
      {/* <div className="absolute top-10 left-10 w-20 h-20 border border-blue-300 opacity-20 rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-blue-400 opacity-10 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-blue-200 opacity-30 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-24 h-24 border border-blue-100 opacity-15 rotate-12" style={{ animation: 'float 6s ease-in-out infinite' }} /> */}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(30deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(5deg); }
          66% { transform: translateY(5px) rotate(-3deg); }
        }
      `}</style>
    </div>
  );
};

export default InteractiveBlueBackground;