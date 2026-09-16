"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const container = mountRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Geometry 1: Outer Wireframe Icosahedron (Neural Sphere)
    const icoGeo = new THREE.IcosahedronGeometry(6.2, 2);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const icosahedron = new THREE.Mesh(icoGeo, icoMat);
    scene.add(icosahedron);

    // Geometry 2: Inner Core Octahedron
    const octGeo = new THREE.OctahedronGeometry(3.6, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const octahedron = new THREE.Mesh(octGeo, octMat);
    scene.add(octahedron);

    // Particles: Floating Code Nodes
    const particleCount = 280;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 5 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = radius * Math.cos(phi);
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x34d399,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // Connecting lines inside core
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.12,
    });
    const lineGeo = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    const pts = icoGeo.attributes.position;
    for (let i = 0; i < pts.count; i += 6) {
      linePositions.push(
        pts.getX(i), pts.getY(i), pts.getZ(i),
        0, 0, 0
      );
    }
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      const y = -(((e.clientY - rect.top) / container.clientHeight) * 2 - 1);
      targetX = x * 0.8;
      targetY = y * 0.8;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", onResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow (LERP)
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      icosahedron.rotation.y = elapsedTime * 0.08 + mouseX;
      icosahedron.rotation.x = elapsedTime * 0.05 + mouseY;

      octahedron.rotation.y = -elapsedTime * 0.15 + mouseX * 1.5;
      octahedron.rotation.z = elapsedTime * 0.1;

      particlesMesh.rotation.y = elapsedTime * 0.03 + mouseX * 0.5;
      particlesMesh.rotation.x = -elapsedTime * 0.02 + mouseY * 0.5;

      lines.rotation.y = icosahedron.rotation.y;
      lines.rotation.x = icosahedron.rotation.x;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden opacity-80"
      style={{ zIndex: 1 }}
    />
  );
}
