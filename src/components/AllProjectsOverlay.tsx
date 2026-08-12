"use client";

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLenis } from 'lenis/react';
import styles from './AllProjectsOverlay.module.css';

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export interface DetailedProject {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  image: string;
  keywords: string[];
  features: string[];
  liveUrl?: string;
  repoUrl?: string;
}

export const ALL_PROJECTS: DetailedProject[] = [
  {
    id: 'p1',
    number: '01',
    title: 'SkyCourt Warehouse Engine',
    category: 'Enterprise Logistics & Embedded Data',
    description: 'Offline-first enterprise logistics & inventory management platform powered by Turso LibSQL embedded replicas, real-time hardware barcode telemetry, and desktop deployment via Tauri. Guaranteed zero data loss during network dropouts with automated background sync.',
    image: '/images/skycourt/skycourt_1.webp',
    keywords: ['Turso LibSQL', 'Embedded Replicas', 'Barcode Telemetry', 'Tauri Desktop', 'Rust'],
    features: [
      'Turso Embedded LibSQL Local Database Sync',
      'Real-Time Hardware Barcode Telemetry Streaming',
      'Cross-Platform Desktop Deployment via Tauri & Rust',
      'Granular Role-Based Security & Compliance Auditing'
    ],
    liveUrl: '#',
    repoUrl: '#'
  },
  {
    id: 'p2',
    number: '02',
    title: "Kafa'a AI Talent Platform",
    category: 'Enterprise AI Recruitment SaaS',
    description: 'An enterprise AI recruitment SaaS that parses unstructured CV resumes, calculates multi-variable candidate match scores, and orchestrates automated AI candidate interviews. Processes thousands of applicant documents in seconds with deep semantic analysis.',
    image: '/images/kafaa/kafaa_1.webp',
    keywords: ['Enterprise AI SaaS', 'CV Resume Parser', 'Match Score Engine', 'Automated Interviews'],
    features: [
      'Unstructured PDF Resume Extraction & OCR Engine',
      'Multi-Variable Skill Fit & Candidate Scoring',
      'Real-Time Autonomous Voice AI Recruiter',
      'Centralized Recruitment Pipeline Dashboard'
    ],
    liveUrl: '#',
    repoUrl: '#'
  },
  {
    id: 'p3',
    number: '03',
    title: 'O2Mation Flagship Web',
    category: 'Bespoke Digital Flagship',
    description: 'Bespoke, agency-grade digital flagship built for enterprise scale. Features custom WebGL displacement shaders, fluid GSAP scroll choreography, and a dynamic dark-mode glassmorphism visual language.',
    image: '/images/o2mation/o2mation_1.webp',
    keywords: ['Fluid GSAP Motion', 'WebGL Shaders', 'Next.js App Router', 'Luxury Design System'],
    features: [
      'Custom WebGL Displacement & Liquid Shaders',
      '60FPS GSAP ScrollTrigger Motion Choreography',
      'Tailor-Made Typography & Color Palette Tokens',
      'Sub-Second Global Edge Delivery Performance'
    ],
    liveUrl: '#',
    repoUrl: '#'
  },
  {
    id: 'p4',
    number: '04',
    title: 'Voice AI & Autonomous Agents',
    category: 'Real-Time Voice Telephony',
    description: 'Ultra-low-latency real-time voice AI assistant integrated directly into web interfaces and phone trunks. Capable of instant speech-to-speech interaction, dynamic function calling, and autonomous appointment booking.',
    image: '/images/services/strategy.webp',
    keywords: ['Real-Time WebRTC', 'Voice AI Assistant', 'SIP Telephony', 'Autonomous Agents'],
    features: [
      'Sub-400ms WebRTC Real-Time Audio Streaming',
      'SIP Trunking for Automated 24/7 Phone Reception',
      'Autonomous Database & API Function Calling',
      'Dual Knowledge Vault for Public & Internal SOPs'
    ],
    liveUrl: '#',
    repoUrl: '#'
  },
  {
    id: 'p5',
    number: '05',
    title: 'OmniFlow Node Engine',
    category: 'Process Automation & Node Graphs',
    description: 'Visual node-based process automation engine allowing non-technical managers to construct complex AI decision trees, document processing pipelines, and multi-app database sync routines with zero code.',
    image: '/images/services/systems/systems_3.webp',
    keywords: ['Node Graph Canvas', 'Workflow Engine', 'AI Pipelines', 'Async Events'],
    features: [
      'Interactive Canvas Node Graph Visualizer',
      'Automated Unstructured Document to DB Extraction',
      'Granular API & Event-Driven Trigger Webhooks',
      'Distributed Async Worker Queue Execution'
    ],
    liveUrl: '#',
    repoUrl: '#'
  },
  {
    id: 'p6',
    number: '06',
    title: 'HyperPulse Telemetry Suite',
    category: 'Distributed Systems & Metrics',
    description: 'High-throughput real-time infrastructure telemetry suite that captures millions of edge events per second, visualizes system health via custom Canvas graphics, and alerts on anomalous traffic spikes.',
    image: '/images/services/systems/systems_1.webp',
    keywords: ['Distributed Telemetry', 'WebSocket Stream', 'High Throughput', 'Canvas Visualizer'],
    features: [
      'High-Throughput Real-Time WebSocket Telemetry',
      'Anomalous Traffic Spike Detection Engine',
      'Low-Overhead Micro-Frontend Telemetry SDK',
      'Custom 60FPS HTML5 Canvas Metrics Visualizer'
    ],
    liveUrl: '#',
    repoUrl: '#'
  }
];

interface AllProjectsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AllProjectsOverlay({ isOpen, onClose }: AllProjectsOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const colLeftRef = useRef<HTMLDivElement>(null);
  const colRightRef = useRef<HTMLDivElement>(null);
  const viewportLeftRef = useRef<HTMLDivElement>(null);
  const viewportRightRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const [selectedProject, setSelectedProject] = useState<DetailedProject | null>(null);

  // Mutable refs for the ticker-based infinite drift engine
  const leftPosRef = useRef<number>(0);
  const rightPosRef = useRef<number>(0);
  const leftVelocityRef = useRef<number>(0);
  const rightVelocityRef = useRef<number>(0);
  const baseSpeed = 3; // pixels per frame at 60fps
  const halfHeightRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const isHoveringRef = useRef<boolean>(false);

  // Split projects into 2 columns (3 projects each, duplicated for seamless loop)
  const leftColumnProjects = [...ALL_PROJECTS.slice(0, 3), ...ALL_PROJECTS.slice(0, 3)];
  const rightColumnProjects = [...ALL_PROJECTS.slice(3, 6), ...ALL_PROJECTS.slice(3, 6)];

  // Lock Lenis scroll when overlay is open
  useEffect(() => {
    if (lenis) {
      if (isOpen) lenis.stop();
      else lenis.start();
    }
  }, [isOpen, lenis]);

  // Main entrance animation (fade in/out only)
  useGSAP(() => {
    if (!overlayRef.current) return;

    if (isOpen) {
      gsap.to(overlayRef.current, {
        autoAlpha: 1,
        duration: 0.6,
        ease: "power2.out"
      });
    } else {
      gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          setSelectedProject(null);
        }
      });
    }
  }, { scope: overlayRef, dependencies: [isOpen] });

  // Ticker-Based Seamless Infinite Drift Engine
  useEffect(() => {
    if (!isOpen) return;

    // Measure half the column height (the duplicated set) for wrapping
    const measureHalf = () => {
      if (colLeftRef.current) {
        halfHeightRef.current = colLeftRef.current.scrollHeight / 2;
      }
    };
    measureHalf();

    // Reset positions and velocities on open
    leftPosRef.current = 0;
    rightPosRef.current = 0;
    leftVelocityRef.current = 0;
    rightVelocityRef.current = 0;
    isPausedRef.current = false;

    const tickerFn = (_time: number, deltaTime: number) => {
      if (isPausedRef.current) return;

      const half = halfHeightRef.current;
      if (half === 0) return;

      // Normalize deltaTime: GSAP gives ms, we want a 60fps-relative factor
      const dt = deltaTime / 16.67;
      const hoverDamping = isHoveringRef.current ? 0.15 : 1;

      // Left column: base direction is upward (negative y), velocity adds on top
      const leftSpeed = (baseSpeed + leftVelocityRef.current) * dt * hoverDamping;
      leftPosRef.current -= leftSpeed;

      // Right column: base direction is downward (positive y), velocity adds on top
      const rightSpeed = (baseSpeed + rightVelocityRef.current) * dt * hoverDamping;
      rightPosRef.current += rightSpeed;

      // Wrap positions using modulo so they never hit a boundary.
      // Both formulas handle bidirectional scrolling (wheel can push either direction).
      // Left (moving negative): wraps in range [-half, 0)
      leftPosRef.current = ((leftPosRef.current % half) + half) % half - half;
      // Right (moving positive): wraps in range [0, half)
      rightPosRef.current = ((rightPosRef.current % half) + half) % half;

      // Apply transforms directly (no GSAP tween, pure set for 0 overhead)
      if (colLeftRef.current) {
        colLeftRef.current.style.transform = `translate3d(0, ${leftPosRef.current}px, 0)`;
      }
      if (colRightRef.current) {
        colRightRef.current.style.transform = `translate3d(0, ${rightPosRef.current}px, 0)`;
      }

      // Decay wheel velocity back toward 0 each frame
      leftVelocityRef.current *= 0.95;
      rightVelocityRef.current *= 0.95;

      // Snap tiny residual velocity to 0
      if (Math.abs(leftVelocityRef.current) < 0.01) leftVelocityRef.current = 0;
      if (Math.abs(rightVelocityRef.current) < 0.01) rightVelocityRef.current = 0;
    };

    gsap.ticker.add(tickerFn);

    return () => {
      gsap.ticker.remove(tickerFn);
    };
  }, [isOpen]);

  // Scroll Wheel Velocity Injection
  useEffect(() => {
    if (!isOpen || selectedProject) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const impulse = e.deltaY * 0.15;
      // Both columns get an impulse; left goes in scroll direction, right goes opposite
      leftVelocityRef.current += impulse;
      rightVelocityRef.current += impulse;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, selectedProject]);

  // Handle Card Click (Push-Aside Transition to Detail View)
  const handleCardClick = (project: DetailedProject) => {
    setSelectedProject(project);

    // Pause the ticker drift
    isPausedRef.current = true;

    // Push viewport containers off-screen left and right
    if (viewportLeftRef.current && viewportRightRef.current) {
      gsap.to(viewportLeftRef.current, {
        xPercent: -140,
        opacity: 0,
        duration: 0.8,
        ease: "power3.inOut"
      });

      gsap.to(viewportRightRef.current, {
        xPercent: 140,
        opacity: 0,
        duration: 0.8,
        ease: "power3.inOut"
      });
    }

    // Animate Hero Image & Glassmorphic Sidebar in
    if (heroCardRef.current && sidebarRef.current) {
      gsap.fromTo(heroCardRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );

      gsap.fromTo(sidebarRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
    }
  };

  // Close Detail View (Reverse Push-Aside Transition)
  const handleCloseDetail = () => {
    if (sidebarRef.current && heroCardRef.current) {
      gsap.to(sidebarRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.6,
        ease: "power2.in"
      });

      gsap.to(heroCardRef.current, {
        scale: 0.85,
        opacity: 0,
        duration: 0.6,
        ease: "power2.in"
      });
    }

    // Bring viewport containers back in from left/right
    if (viewportLeftRef.current && viewportRightRef.current) {
      gsap.to([viewportLeftRef.current, viewportRightRef.current], {
        xPercent: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.3,
        onComplete: () => {
          setSelectedProject(null);
          // Resume ticker drift
          isPausedRef.current = false;
          leftVelocityRef.current = 0;
          rightVelocityRef.current = 0;
        }
      });
    }
  };

  // Card Hover Speed Control
  const handleMouseEnter = () => {
    if (!selectedProject) {
      isHoveringRef.current = true;
    }
  };

  const handleMouseLeave = () => {
    if (!selectedProject) {
      isHoveringRef.current = false;
    }
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} ref={overlayRef}>
      
      {/* Header Navigation */}
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <span className={styles.brandTag}>PROJECT ARCHIVE</span>
          <h2 className={styles.brandTitle}>ALL WORK // Showcase</h2>
          <span className={styles.badge}>{ALL_PROJECTS.length} FEATURED PLATFORMS</span>
        </div>
        <button 
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close Archive Overlay"
        >
          ✕ Close
        </button>
      </header>

      {/* Stage Area */}
      <div className={styles.stage}>
        
        {/* Slanted Opposing Columns Container */}
        <div className={styles.slantedContainer}>
          
          {/* Left Track Viewport (clips overflow for seamless loop) */}
          <div
            className={styles.trackViewport}
            ref={viewportLeftRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.columnTrack} ref={colLeftRef}>
              {leftColumnProjects.map((p, idx) => (
                <div 
                  key={`left-${p.id}-${idx}`}
                  className={styles.card}
                  onClick={() => handleCardClick(p)}
                >
                  <img src={p.image} alt={p.title} className={styles.cardImage} />
                  <div className={styles.cardOverlay}>
                    <span className={styles.cardCategory}>{p.number} — {p.category}</span>
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <div className={styles.cardKeywords}>
                      {p.keywords.slice(0, 3).map((kw, i) => (
                        <span key={i} className={styles.keywordBadge}>{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Track Viewport (clips overflow for seamless loop) */}
          <div
            className={styles.trackViewport}
            ref={viewportRightRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.columnTrack} ref={colRightRef}>
              {rightColumnProjects.map((p, idx) => (
                <div 
                  key={`right-${p.id}-${idx}`}
                  className={styles.card}
                  onClick={() => handleCardClick(p)}
                >
                  <img src={p.image} alt={p.title} className={styles.cardImage} />
                  <div className={styles.cardOverlay}>
                    <span className={styles.cardCategory}>{p.number} — {p.category}</span>
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <div className={styles.cardKeywords}>
                      {p.keywords.slice(0, 3).map((kw, i) => (
                        <span key={i} className={styles.keywordBadge}>{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Detail Stage (Push-Aside View) */}
        <div className={`${styles.detailStage} ${selectedProject ? styles.active : ''}`}>
          
          {/* Hero Image Center Card */}
          <div className={styles.detailHeroArea}>
            {selectedProject && (
              <div className={styles.detailHeroCard} ref={heroCardRef}>
                <img src={selectedProject.image} alt={selectedProject.title} className={styles.detailHeroImg} />
                <span className={styles.detailHeroBadge}>{selectedProject.number} // {selectedProject.category}</span>
              </div>
            )}
          </div>

          {/* Right Glassmorphic Detail Sidebar */}
          <div className={styles.detailSidebar} ref={sidebarRef}>
            {selectedProject && (
              <>
                <button 
                  className={styles.sidebarCloseBtn}
                  onClick={handleCloseDetail}
                >
                  ✕ Close View
                </button>
                <span className={styles.sidebarIndex}>{selectedProject.number} // FEATURED ARCHITECTURE</span>
                <h2 className={styles.sidebarTitle}>{selectedProject.title}</h2>
                <p className={styles.sidebarDescription}>{selectedProject.description}</p>

                <h4 className={styles.sectionHeader}>Key Engineering Specs</h4>
                <ul className={styles.featureList}>
                  {selectedProject.features.map((feat, i) => (
                    <li key={i} className={styles.featureItem}>
                      <span className={styles.featureBullet}>❖</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <h4 className={styles.sectionHeader}>Technology Stack</h4>
                <div className={styles.techList}>
                  {selectedProject.keywords.map((kw, i) => (
                    <span key={i} className={styles.techTag}>{kw}</span>
                  ))}
                </div>

                <div className={styles.actionRow}>
                  <button 
                    className={styles.primaryActionBtn}
                    onClick={() => {
                      const event = new CustomEvent('open-contact');
                      window.dispatchEvent(event);
                      onClose();
                    }}
                  >
                    Discuss Platform ↗
                  </button>
                  <button 
                    className={styles.secondaryActionBtn}
                    onClick={handleCloseDetail}
                  >
                    Back to Grid
                  </button>
                </div>
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
