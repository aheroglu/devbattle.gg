"use client";

import { useEffect, useRef } from "react";

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Grid settings
    const gridSize = 50;
    const maxDistance = 150;

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      for (let x = 0; x <= canvas.width; x += gridSize) {
        for (let y = 0; y <= canvas.height; y += gridSize) {
          // Calculate distance from mouse
          const dx = mouseRef.current.x - x;
          const dy = mouseRef.current.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Calculate distance from center
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const centerDx = centerX - x;
          const centerDy = centerY - y;
          const centerDistance = Math.sqrt(
            centerDx * centerDx + centerDy * centerDy
          );
          const maxCenterDistance = Math.sqrt(
            centerX * centerX + centerY * centerY
          );

          // Base opacity based on distance from center (bright center, dark edges)
          const centerOpacity = Math.max(
            0.1,
            1 - centerDistance / maxCenterDistance
          );

          // Mouse hover effect
          let opacity = centerOpacity;
          if (distance < maxDistance) {
            const mouseEffect = (maxDistance - distance) / maxDistance;
            opacity = Math.min(1, centerOpacity + mouseEffect * 0.8);
          }

          // Draw grid point
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`;
          ctx.fill();

          // Draw connecting lines for nearby points
          if (distance < maxDistance / 1) {
            const lineOpacity = opacity * 0.4;
            ctx.strokeStyle = `rgba(34, 197, 94, ${lineOpacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + gridSize, y);
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + gridSize);
            ctx.stroke();
          }
        }
      }

      // Draw mouse glow effect
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        maxDistance
      );
      gradient.addColorStop(0, "rgba(34, 197, 94, 0.3)");
      gradient.addColorStop(0.5, "rgba(34, 197, 94, 0.1)");
      gradient.addColorStop(1, "rgba(34, 197, 94, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        mouseRef.current.x,
        mouseRef.current.y,
        maxDistance,
        0,
        Math.PI * 2
      );
      ctx.fill();

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background:
          "radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)",
      }}
    />
  );
}
