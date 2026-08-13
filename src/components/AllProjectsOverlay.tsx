"use client";

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLenis } from 'lenis/react';
import ShimmeringBeamsBackground from './ui/ShimmeringBeamsBackground';
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

/** Unique cards per column before the sequence repeats. */
const UNIQUE_PER_COL = 3;
/** How many times the unique set is duplicated in the DOM. The track must stay
 *  taller than the container even when shifted a full period, so: 4 x (3 cards)
 *  = 6288px of track vs a 1584px period — safe past 4K-tall displays. Only 6
 *  unique image URLs are involved, so the extra copies cost nothing to fetch. */
const TRACK_REPEATS = 4;
/** Idle drift in px per frame at 60fps. */
const BASE_SPEED = 3;
/** Ceiling on wheel-injected velocity (px/frame) so fast flicks stay readable. */
const MAX_VELOCITY = 90;

export default function AllProjectsOverlay({ isOpen, onClose }: AllProjectsOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  // Viewport wrappers own the push-aside transform; inner tracks own the drift
  // transform. Separating them means the two never fight over `transform`.
  const viewportLeftRef = useRef<HTMLDivElement>(null);
  const viewportRightRef = useRef<HTMLDivElement>(null);
  const colLeftRef = useRef<HTMLDivElement>(null);
  const colRightRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const [selectedProject, setSelectedProject] = useState<DetailedProject | null>(null);

  // Infinite drift engine state. Positions are kept normalised to [0, period)
  // so they can advance forever without ever reaching a boundary.
  const leftPosRef = useRef(0);
  const rightPosRef = useRef(0);
  const leftVelRef = useRef(0);
  const rightVelRef = useRef(0);
  const periodRef = useRef(0);
  const pausedRef = useRef(false);
  const hoverTargetRef = useRef(1);
  const hoverFactorRef = useRef(1);

  // Split projects into 2 columns, each duplicated TRACK_REPEATS times
  const leftColumnProjects = Array.from({ length: TRACK_REPEATS }, () =>
    ALL_PROJECTS.slice(0, UNIQUE_PER_COL)
  ).flat();
  const rightColumnProjects = Array.from({ length: TRACK_REPEATS }, () =>
    ALL_PROJECTS.slice(UNIQUE_PER_COL, UNIQUE_PER_COL * 2)
  ).flat();

  // Lock Lenis scroll when overlay is open
  useEffect(() => {
    if (lenis) {
      if (isOpen) lenis.stop();
      else lenis.start();
    }
  }, [isOpen, lenis]);

  // Main entrance / exit fade
  useGSAP(() => {
    if (!overlayRef.current) return;

    if (isOpen) {
      // Clear any lingering push-aside offset from a previous detail view
      if (viewportLeftRef.current && viewportRightRef.current) {
        gsap.set([viewportLeftRef.current, viewportRightRef.current], {
          xPercent: 0,
          opacity: 1
        });
      }

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
        onComplete: () => setSelectedProject(null)
      });
    }
  }, { scope: overlayRef, dependencies: [isOpen] });

  // Ticker-driven seamless infinite drift.
  //
  // The loop period is measured from real card offsets rather than assumed to be
  // half the track height — with flex `gap`, scrollHeight/2 is short by half a
  // gap, and that mismatch is the visible snap. offsetTop of card[UNIQUE_PER_COL]
  // minus card[0] is the exact repeat distance, gaps included.
  useEffect(() => {
    if (!isOpen) return;

    const measurePeriod = (): boolean => {
      const track = colLeftRef.current;
      if (!track || track.children.length <= UNIQUE_PER_COL) return false;
      const first = track.children[0] as HTMLElement;
      const wrapAt = track.children[UNIQUE_PER_COL] as HTMLElement;
      if (!first || !wrapAt) return false;
      const measured = wrapAt.offsetTop - first.offsetTop;
      if (measured > 0) {
        periodRef.current = measured;
        return true;
      }
      return false;
    };

    const render = () => {
      const period = periodRef.current || 1584;
      if (colLeftRef.current) {
        colLeftRef.current.style.transform =
          `translate3d(0, ${-leftPosRef.current}px, 0)`;
      }
      if (colRightRef.current) {
        colRightRef.current.style.transform =
          `translate3d(0, ${rightPosRef.current - period}px, 0)`;
      }
    };

    // Reset engine state on open
    const hasMeasured = measurePeriod();
    if (!hasMeasured) {
      periodRef.current = 1584; // Safe fallback period until DOM layout resolves
    }

    leftPosRef.current = 0;
    rightPosRef.current = periodRef.current * 0.35;
    leftVelRef.current = 0;
    rightVelRef.current = 0;
    pausedRef.current = false;
    hoverTargetRef.current = 1;
    hoverFactorRef.current = 1;
    render();

    const tick = (_time: number, deltaTime: number) => {
      // Re-measure period if not accurately calculated yet
      measurePeriod();

      const period = periodRef.current || 1584;
      const dt = Math.min(deltaTime / 16.667, 3);

      hoverFactorRef.current +=
        (hoverTargetRef.current - hoverFactorRef.current) * Math.min(1, 0.12 * dt);

      if (!pausedRef.current) {
        const damp = hoverFactorRef.current;
        leftPosRef.current += (BASE_SPEED + leftVelRef.current) * dt * damp;
        rightPosRef.current += (BASE_SPEED + rightVelRef.current) * dt * damp;

        leftPosRef.current = ((leftPosRef.current % period) + period) % period;
        rightPosRef.current = ((rightPosRef.current % period) + period) % period;

        render();
      }

      const decay = Math.pow(0.93, dt);
      leftVelRef.current *= decay;
      rightVelRef.current *= decay;
      if (Math.abs(leftVelRef.current) < 0.02) leftVelRef.current = 0;
      if (Math.abs(rightVelRef.current) < 0.02) rightVelRef.current = 0;
    };

    gsap.ticker.add(tick);

    const handleResize = () => {
      measurePeriod();
      render();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Scroll wheel momentum injection
  useEffect(() => {
    if (!isOpen || selectedProject) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default window scroll while navigating the archive
      e.preventDefault();

      // A positive impulse accelerates each track along its own natural
      // direction; a negative one drives both in reverse.
      const impulse = e.deltaY * 0.14;
      leftVelRef.current = gsap.utils.clamp(
        -MAX_VELOCITY, MAX_VELOCITY, leftVelRef.current + impulse
      );
      rightVelRef.current = gsap.utils.clamp(
        -MAX_VELOCITY, MAX_VELOCITY, rightVelRef.current + impulse
      );
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isOpen, selectedProject]);



  // Animate Hero Image & Glassmorphic Sidebar in whenever a project is selected
  useGSAP(() => {
    if (selectedProject && heroCardRef.current && sidebarRef.current) {
      gsap.fromTo(heroCardRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
      );

      gsap.fromTo(sidebarRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
      );
    }
  }, { scope: overlayRef, dependencies: [selectedProject] });

  // Handle Card Click (Push-Aside Transition to Detail View)
  const handleCardClick = (project: DetailedProject) => {
    setSelectedProject(project);

    // Freeze the drift engine; position is preserved so resuming won't jump
    pausedRef.current = true;

    // Push slanted columns off-screen left and right
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
  };

  // Close Detail View (Reverse Push-Aside Transition)
  const handleCloseDetail = () => {
    if (sidebarRef.current && heroCardRef.current) {
      // Retract sidebar and hero card
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

    // Bring slanted columns back in from left/right
    if (viewportLeftRef.current && viewportRightRef.current) {
      gsap.to([viewportLeftRef.current, viewportRightRef.current], {
        xPercent: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.3,
        onComplete: () => {
          setSelectedProject(null);
          // Resume the drift engine
          hoverTargetRef.current = 1;
          pausedRef.current = false;
        }
      });
    }
  };

  // Card Hover Speed Control (eased by the ticker, not applied instantly)
  const handleMouseEnter = () => {
    if (!selectedProject) hoverTargetRef.current = 0.15;
  };

  const handleMouseLeave = () => {
    if (!selectedProject) hoverTargetRef.current = 1;
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} ref={overlayRef}>
      <ShimmeringBeamsBackground active={isOpen} />
      
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
          
          {/* Left Track (drifts upwards, infinitely) */}
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

          {/* Right Track (drifts downwards, infinitely) */}
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
