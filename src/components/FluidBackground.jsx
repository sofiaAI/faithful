'use client';
import { loadShader } from '@/utils/loadShader';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Output from '@/../public/simulation/Output';
import Common from '@/../public/simulation/Common';
import Mouse from '@/../public/simulation/Mouse'; 

export default function FluidBackground() {
  const containerRef = useRef(null);
  const outputRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    async function init() {
      const common = new Common();
      common.init()
      const mouse = new Mouse({common});
      mouse.init();

      containerRef.current.appendChild(common.renderer.domElement);

      const shaderSources = {
        advection: await loadShader('/simulation/shaders/advection.frag'),
        color: await loadShader('/simulation/shaders/color.frag'),
        divergence: await loadShader('/simulation/shaders/divergence.frag'),
        externalForce: await loadShader('/simulation/shaders/externalForce.frag'),
        face: await loadShader('/simulation/shaders/face.vert'),
        line: await loadShader('/simulation/shaders/line.vert'),
        mouse: await loadShader('/simulation/shaders/mouse.vert'),
        poisson: await loadShader('/simulation/shaders/poisson.frag'),
        pressure: await loadShader('/simulation/shaders/pressure.frag'),
        viscous: await loadShader('/simulation/shaders/viscous.frag'),
        accumulation: await loadShader('/simulation/shaders/accumulation.frag'),
      };

      const output = new Output({ shaderSources: shaderSources,
        common: common,
        mouse: mouse 
      });
      outputRef.current = output;

      const handleResize = () => {
        common.resize();
        output.resize();
      };
      window.addEventListener('resize', handleResize);

      const animate = () => {
        mouse.update();
        common.update();
        output.update();
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
      
      return () => {
        cancelAnimationFrame(animationFrameRef.current);
        window.removeEventListener('resize', handleResize);
        if (common.renderer.domElement && containerRef.current) {
          containerRef.current.removeChild(common.renderer.domElement);
        }
        common.renderer.dispose();
      };

    }
    init();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
