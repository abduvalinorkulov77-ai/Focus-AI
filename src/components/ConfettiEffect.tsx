import { useEffect, useRef } from "react";

interface ConfettiEffectProps {
  active: boolean;
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export default function ConfettiEffect({ active, onComplete }: ConfettiEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#0d9488", "#e11d48", "#d97706", "#4f46e5", "#059669", "#7c58ed", "#f43f5e", "#10b981", "#3b82f6"];
    const particles: Particle[] = [];

    // Initialize particles from the center bottom and sides
    const particleCount = 150;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 50,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 8 - 4,
        speedY: -(Math.random() * 15 + 10),
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        opacity: 1,
      });
    }

    let animationId: number;
    const startTime = Date.now();

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;

      particles.forEach((p) => {
        if (p.opacity > 0) {
          alive = true;

          // Physics
          p.x += p.speedX;
          p.y += p.speedY;
          p.speedY += 0.25; // Gravity
          p.speedX *= 0.98; // Friction
          p.rotation += p.rotationSpeed;

          // Fade out as it goes down or after time
          if (p.y > canvas.height * 0.7) {
            p.opacity -= 0.015;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);

          // Draw squares/ribbons
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      // Timeout after 4 seconds or when all particles died
      if (alive && Date.now() - startTime < 4000) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    }

    animate();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      id="confetti-canvas"
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}
