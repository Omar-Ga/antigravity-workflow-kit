"use client";

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RippleCanvas from './RippleCanvas';
import styles from './CapabilitiesSection.module.css';

const AudioBlob = dynamic(() => import('./AudioBlob'), { ssr: false });
const WebGLShader = dynamic(() => import('./ui/web-gl-shader').then((m) => m.WebGLShader), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const PROJECTS = [
  {
    id: 'p1',
    title: 'SkyCourt Warehouse Engine',
    description: 'Offline-first enterprise logistics & inventory management platform powered by Turso LibSQL embedded replicas, real-time barcode scanning, and multi-platform desktop/web deployment.',
    image: '/images/skycourt/skycourt_1.webp'
  },
  {
    id: 'p2',
    title: "Kafa'a AI Talent Platform",
    description: 'An enterprise AI recruitment SaaS that parses unstructured CV resumes, calculates multi-variable candidate match scores, and orchestrates automated AI candidate interviews.',
    image: '/images/kafaa/kafaa_1.webp'
  },
  {
    id: 'p3',
    title: 'O2Mation Flagship Web',
    description: 'Bespoke, agency-grade web platforms. High-impact visual design, fluid GSAP motion, and high-converting architecture built for enterprise scale.',
    image: '/images/o2mation/o2mation_1.webp'
  },
  {
    id: 'p4',
    title: "Voice AI & Intelligent Agents",
    description: 'Skip the contact form. Ask me anything — my AI assistant knows my stack, my work, and my availability. Press the button and speak.',
    image: '/images/services/strategy.webp'
  }
];

const PROJECT_IMAGES = PROJECTS.map(p => p.image);

export default function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeImage, setActiveImage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    let timer: NodeJS.Timeout;
    const checkMobile = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 150);
    };
    window.addEventListener('resize', checkMobile);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useGSAP(() => {
    if (!sectionRef.current || !listRef.current) return;
    
    const texts = textRefs.current.filter(Boolean) as HTMLDivElement[];
    if (texts.length === 0) return;

    // Pre-calculate container & item dimensions ONCE to avoid DOM reading during scroll
    const wrapper = listRef.current.parentElement;
    const wrapperHeight = wrapper ? wrapper.offsetHeight : window.innerHeight;
    const containerCenter = wrapperHeight / 2;
    const maxDist = wrapperHeight / 1.5;

    const itemCenters = texts.map(el => el.offsetTop + el.offsetHeight / 2);
    const listScrollHeight = listRef.current.scrollHeight;
    const maxScrollY = listScrollHeight - wrapperHeight;

    const snapPoints = itemCenters.map((itemCenterY) => {
      const targetY = containerCenter - itemCenterY;
      const progress = -targetY / Math.max(1, maxScrollY);
      return Math.max(0, Math.min(1, progress));
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        anticipatePin: 1,
        start: "top top",
        end: `+=${PROJECTS.length * 200}%`,
        scrub: 0.7,
        refreshPriority: 6,
        invalidateOnRefresh: true,
        snap: {
          snapTo: snapPoints,
          duration: { min: 0.3, max: 0.8 },
          ease: "power2.inOut"
        },
        onUpdate: function(self) {
          // Pure math calculations without reading live DOM layout
          const currentY = -maxScrollY * self.progress;
          let minDistance = Infinity;
          let closestIdx = 0;

          itemCenters.forEach((itemCenterY, i) => {
            const el = texts[i];
            if (!el) return;

            // elCenter relative to wrapper top = itemCenterY + currentY
            const dist = (itemCenterY + currentY) - containerCenter;
            const absDist = Math.abs(dist);

            if (absDist < minDistance) {
              minDistance = absDist;
              closestIdx = i;
            }

            const normalizedDist = Math.max(0, Math.min(1, absDist / maxDist));
            const curve = Math.pow(normalizedDist, 1.5);
            
            const scale = 1 - (curve * 0.3);
            const opacity = 1 - (curve * 1.0);
            const rotateX = (dist / maxDist) * -90;
            const z = curve * -100;

            gsap.set(el, {
              scale,
              opacity,
              rotateX,
              z,
              transformOrigin: "center center -150px"
            });
          });

          if (minDistance < 40) {
            setActiveImage((prev) => (prev !== closestIdx ? closestIdx : prev));
          }
        }
      }
    });

    tl.to(listRef.current, {
      y: -maxScrollY,
      ease: "none"
    });

    ScrollTrigger.refresh();

  }, { scope: sectionRef });

  return (
    <section className={styles.capabilitiesSection} ref={sectionRef} id="projects">
      {!isMobile && <WebGLShader />}
      <div className={styles.capabilitiesContainer} style={{ position: 'relative' }}>
        
        {/* LEFT: Projects 3D Wheel */}
        <div className={styles.servicesListWrapper}>
          <div className={styles.servicesList} ref={listRef}>
            {PROJECTS.map((project, idx) => (
              <div 
                key={project.id} 
                className={styles.serviceItem}
                ref={el => {
                  textRefs.current[idx] = el;
                }}
              >
                <h3 className={styles.serviceTitle}>0{idx + 1} — {project.title}</h3>
                <p className={styles.serviceDescription}>{project.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: WebGL Canvas / Audio AI Blob / Mobile Static Image */}
        <div className={styles.visualCanvas}>
          {activeImage === 3 ? (
            <AudioBlob />
          ) : isMobile ? (
            <img 
              src={PROJECT_IMAGES[Math.min(activeImage, 2)].replace(/\.webp$/, '_mobile.webp')} 
              alt="Project preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', transition: 'opacity 0.3s ease' }}
            />
          ) : (
            <RippleCanvas
              images={PROJECT_IMAGES.slice(0, 3)}
              activeIndex={Math.min(activeImage, 2)}
            />
          )}
        </div>

      </div>
    </section>
  );
}
