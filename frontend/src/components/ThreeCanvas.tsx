'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Hardware capability check for adaptive 60fps rendering
    const isLowEnd = typeof navigator !== 'undefined' && 
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    camera.position.z = 24;

    // 2. High-Performance WebGL Renderer
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

    // 3. Central 3D Core Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner Glowing Torus Knot
    const knotGeometry = new THREE.TorusKnotGeometry(3.8, 0.9, isLowEnd ? 48 : 80, isLowEnd ? 12 : 20);
    const knotMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const knotMesh = new THREE.Mesh(knotGeometry, knotMaterial);
    coreGroup.add(knotMesh);

    // Outer 3D Icosahedron Shell
    const shellGeometry = new THREE.IcosahedronGeometry(8.5, 1);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const shellMesh = new THREE.Mesh(shellGeometry, shellMaterial);
    coreGroup.add(shellMesh);

    // Orbital Ring 1
    const ring1Geo = new THREE.TorusGeometry(12, 0.08, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.4 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    // Orbital Ring 2
    const ring2Geo = new THREE.TorusGeometry(15, 0.06, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    // 4. 3D Particle Constellation System
    const particleCount = isLowEnd ? 250 : 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const basePosY = new Float32Array(particleCount);

    const colorChoices = [
      new THREE.Color(0x6366f1), // Indigo
      new THREE.Color(0xa855f7), // Purple
      new THREE.Color(0xec4899), // Pink
      new THREE.Color(0x3b82f6), // Blue
      new THREE.Color(0x06b6d4), // Cyan
    ];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 55;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;
      basePosY[i] = y;

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
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Mouse & Touch Pointer Interactions
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (x: number, y: number) => {
      mouseX = (x - window.innerWidth / 2) * 0.0008;
      mouseY = (y - window.innerHeight / 2) * 0.0008;
    };

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // 60fps Smooth Animation Loop
    let reqId: number;
    let lastTime = performance.now();
    let totalElapsed = 0;

    const animate = (currentTime: number) => {
      reqId = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastTime) * 0.001, 0.1);
      lastTime = currentTime;
      totalElapsed += delta;

      // Mouse lerp
      targetX += (mouseX - targetX) * 0.08;
      targetY += (mouseY - targetY) * 0.08;

      // Rotate 3D Core
      coreGroup.rotation.x += delta * 0.35 + targetY * 0.08;
      coreGroup.rotation.y += delta * 0.55 + targetX * 0.08;

      // Rotate Orbital Rings independently
      ring1.rotation.z += delta * 0.2;
      ring2.rotation.x += delta * 0.15;

      // Particle floating wave animation
      const positions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const x = positions[i * 3];
        positions[i * 3 + 1] = basePosY[i] + Math.sin(totalElapsed * 1.2 + x * 0.05) * 0.8;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Rotate constellation
      particleSystem.rotation.y += delta * 0.06;

      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      knotGeometry.dispose();
      knotMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transform-gpu will-change-transform opacity-70"
    />
  );
}
