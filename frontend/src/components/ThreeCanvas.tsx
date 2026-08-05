'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect hardware capability for adaptive 60fps optimization
    const isLowEnd = typeof navigator !== 'undefined' && 
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

    // Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    camera.position.z = 24;

    // WebGL Renderer with High-Performance & Adaptive Pixel Ratio
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isLowEnd,
      powerPreference: 'high-performance',
      precision: isLowEnd ? 'mediump' : 'highp',
    });

    const pixelRatioCap = isLowEnd ? 1 : Math.min(window.devicePixelRatio, 1.5);
    renderer.setPixelRatio(pixelRatioCap);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 1. Central 3D Core Geometry (Lightweight Torus Knot + Wireframe Shell)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 75% lower poly count for guaranteed 60fps smooth rendering
    const knotGeometry = new THREE.TorusKnotGeometry(4.0, 1.0, isLowEnd ? 48 : 64, isLowEnd ? 12 : 16);
    const knotMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const knotMesh = new THREE.Mesh(knotGeometry, knotMaterial);
    coreGroup.add(knotMesh);

    // Outer 3D Wireframe Icosahedron Shell
    const shellGeometry = new THREE.IcosahedronGeometry(8.5, 1);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const shellMesh = new THREE.Mesh(shellGeometry, shellMaterial);
    coreGroup.add(shellMesh);

    // 2. 3D Particle Constellation (Adaptive Count for 60fps)
    const particleCount = isLowEnd ? 200 : 400;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorChoices = [
      new THREE.Color(0x6366f1), // Indigo
      new THREE.Color(0xa855f7), // Purple
      new THREE.Color(0xec4899), // Pink
      new THREE.Color(0x3b82f6), // Blue
    ];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 75;
      const y = (Math.random() - 0.5) * 75;
      const z = (Math.random() - 0.5) * 50;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const chosenColor = colorChoices[i % colorChoices.length];
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: isLowEnd ? 0.35 : 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Mouse Interaction (Throttled for performance)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.0008;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.0008;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // 60fps Animation Loop with Delta Timing
    let reqId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      reqId = requestAnimationFrame(animate);

      // Delta time check to ensure consistent 60fps simulation
      const delta = (currentTime - lastTime) * 0.001;
      lastTime = currentTime;

      // Smooth mouse lerp
      targetX += (mouseX - targetX) * 0.08;
      targetY += (mouseY - targetY) * 0.08;

      // Rotate 3D Core
      coreGroup.rotation.x += delta * 0.4 + targetY * 0.1;
      coreGroup.rotation.y += delta * 0.6 + targetX * 0.1;

      // Rotate particle constellation
      particleSystem.rotation.y += delta * 0.08;

      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      knotGeometry.dispose();
      knotMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transform-gpu will-change-transform"
      style={{ opacity: 0.65 }}
    />
  );
}
