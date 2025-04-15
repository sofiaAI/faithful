'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
type Goal = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  target_date: string;
};

const useHoverParticles = (containerRef: React.RefObject<HTMLDivElement | null>, isActive: boolean) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!containerRef.current || !isActive) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '2';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const particles: Particle[] = [];

        type Particle = {
        x: number;
        y: number;
        vx: number;
        vy: number;
        alpha: number;
        size: number;
        };

        const spawnParticle = () => {
        const edge = Math.floor(Math.random() * 4);
        let x = 0, y = 0;
        if (edge === 0) { // top
            x = Math.random() * rect.width;
            y = 0;
        } else if (edge === 1) { // right
            x = rect.width;
            y = Math.random() * rect.height;
        } else if (edge === 2) { // bottom
            x = Math.random() * rect.width;
            y = rect.height;
        } else { // left
            x = 0;
            y = Math.random() * rect.height;
        }

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.25;

        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            size: Math.random() * 1.5 + 0.5,
        });
        };

        const animate = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        spawnParticle();

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.01;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 220, 170, ${p.alpha})`;
            ctx.shadowColor = 'rgba(255, 220, 170, 0.7)';
            ctx.shadowBlur = 6;
            ctx.fill();
        });

        // Remove faded
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
            }
        }

        animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [containerRef, isActive]);
};  

export default function GoalCard({ goal, index }: { goal: Goal; index: number }) {
    const cardRef = useRef<HTMLDivElement>(null);
    // const [hovering, setHovering] = useState(false);
    
    // useHoverParticles(cardRef, hovering);
    

  return (
    <motion.div
      ref={cardRef}
      // onMouseEnter={() => setHovering(true)}
      // onMouseLeave={() => setHovering(false)}
      className="w-full p-2 rounded-md bg-white/10 border border-purple-300 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
      }}
    >
      <h3 className="text-lg font-semibold text-teal-400 mb-1">{goal.title}</h3>
        <p className="text-sm text-teal-300 mb-1">{goal.description}</p>
        <p className="text-xs text-teal-200">Target: {new Date(goal.target_date).toLocaleDateString()}</p>
    </motion.div>
  );

}
