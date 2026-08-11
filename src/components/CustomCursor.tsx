"use client";

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './CustomCursor.module.css';

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const isHoverDevice = window.matchMedia("(hover: hover)").matches;
    const cursorDot = cursorRef.current;

    if (!isHoverDevice || !cursorDot) return;

    gsap.set(cursorDot, { xPercent: -50, yPercent: -50, force3D: true });
    const setX = gsap.quickSetter(cursorDot, "x", "px");
    const setY = gsap.quickSetter(cursorDot, "y", "px");

    // Reveal cursor element
    gsap.set(cursorDot, { autoAlpha: 1 });

    // Hide default cursor globally
    document.body.classList.add("hide-default-cursor");

    const onMouseMove = (e: MouseEvent) => {
      setX(e.clientX);
      setY(e.clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.body.classList.remove("hide-default-cursor");
    };
  }, { scope: cursorRef });

  return (
    <div ref={cursorRef} className={`${styles.cursorDot} gsap-cursor-dot`}></div>
  );
}
