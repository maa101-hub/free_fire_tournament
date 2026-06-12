"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    fetch('/api/tournaments').then(res => res.json()).then(data => {
      if(data.success) setTournaments(data.tournaments);
    });

    // Hide loader
    setTimeout(() => {
      const loader = document.getElementById('pageLoader');
      if (loader) loader.classList.add('hidden');
    }, 800);

    initParticles();
    initCountdown();
    initScrollReveal();
    initCounters();
    initNavbar();
    initFAQ();
    initSmoothScroll();
    initParallax();
  }, []);

  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };

    function resize() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5 ? '#ff6600' : '#00c8ff';
        this.pulse = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.02;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            this.x -= dx * force * 0.01;
            this.y -= dy * force * 0.01;
          }
        }

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }

      draw() {
        const currentOpacity = this.opacity + Math.sin(this.pulse) * 0.15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, currentOpacity);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, currentOpacity * 0.15);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 102, 0, ${0.08 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      requestAnimationFrame(animate);
    }

    animate();
  }

  function initCountdown() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    targetDate.setHours(20, 0, 0, 0);

    function update() {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        if(document.getElementById('countdown-days')) document.getElementById('countdown-days').textContent = '00';
        if(document.getElementById('countdown-hours')) document.getElementById('countdown-hours').textContent = '00';
        if(document.getElementById('countdown-minutes')) document.getElementById('countdown-minutes').textContent = '00';
        if(document.getElementById('countdown-seconds')) document.getElementById('countdown-seconds').textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const daysEl = document.getElementById('countdown-days');
      if (daysEl) {
        daysEl.textContent = String(days).padStart(2, '0');
        document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('countdown-minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('countdown-seconds').textContent = String(seconds).padStart(2, '0');
      }
    }
    update();
    setInterval(update, 1000);
  }

  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => { entry.target.classList.add('active'); }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    elements.forEach(el => observer.observe(el));
  }

  function initCounters() {
    const counters = document.querySelectorAll('.stat-value[data-target]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const prefix = element.dataset.prefix || '';
    const duration = 2000;
    const startTime = performance.now();

    function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.floor(easedProgress * target);

      element.textContent = prefix + current.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
      else element.textContent = prefix + target.toLocaleString();
    }
    requestAnimationFrame(update);
  }

  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const overlay = document.getElementById('navOverlay');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    });

    if (hamburger) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    navLinks?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navLinks?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const inner = item.querySelector('.faq-answer-inner');

      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(other => {
          other.classList.remove('active');
          if(other.querySelector('.faq-answer')) other.querySelector('.faq-answer').style.maxHeight = '0';
          if(other.querySelector('.faq-question')) other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = inner.scrollHeight + 20 + 'px';
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navHeight = document.getElementById('navbar').offsetHeight;
          const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      });
    });
  }

  function initParallax() {
    const heroBg = document.querySelector('.hero-bg img');
    if (!heroBg) return;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      // Parallax effect that zooms slightly into the character face when scrolling down
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrollY * 0.4}px) scale(${1.0 + scrollY * 0.0005})`;
      }
    });
  }

  return (
    <>
      <div className="page-loader" id="pageLoader">
        <div className="loader-spinner"></div>
      </div>

      <div className="nav-overlay" id="navOverlay"></div>

      <nav className="navbar" id="navbar">
        <div className="container">
          <Link href="#" className="nav-logo">
            <div className="logo-icon">🔥</div>
            <span>FF ARENA</span>
          </Link>
          <div className="nav-links" id="navLinks">
            <Link href="#tournaments">Tournaments</Link>
            <Link href="#how-it-works">How It Works</Link>
            <Link href="#prize-pool">Prizes</Link>
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/dashboard">Track Status</Link>
            <Link href="/register" className="btn btn-primary btn-sm nav-cta">Register Now</Link>
          </div>
          <button className="hamburger" id="hamburger" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-bg">
          <img src="/assets/ff_glowing_hero.png" alt="Free Fire Championship" style={{objectFit: 'cover', objectPosition: 'center 20%'}} />
        </div>
        <canvas id="particles-canvas"></canvas>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="live-dot"></span>
            Season 4 — Live Now
          </div>
          <h1>
            <span className="gradient-text">Free Fire</span><br />
            Championship <span className="blue-text">Arena</span>
          </h1>
          <p className="hero-subtitle">Compete, Qualify, and Win Real Rewards in the most premium Free Fire tournament platform.</p>

          <div className="prize-pool-hero">
            <span className="trophy">🏆</span>
            <div>
              <div className="prize-label">Total Prize Pool</div>
              <div className="prize-amount">₹50,000</div>
            </div>
          </div>

          <div className="countdown" id="countdown">
            <div className="countdown-item">
              <div className="countdown-value" id="countdown-days">00</div>
              <div className="countdown-label">Days</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-value" id="countdown-hours">00</div>
              <div className="countdown-label">Hours</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-value" id="countdown-minutes">00</div>
              <div className="countdown-label">Minutes</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-value" id="countdown-seconds">00</div>
              <div className="countdown-label">Seconds</div>
            </div>
          </div>

          <div className="hero-ctas">
            <Link href="/register" className="btn btn-primary" id="hero-join-btn">🎮 Join Tournament</Link>
            <Link href="#tournaments" className="btn btn-secondary" id="hero-view-btn">View Tournaments</Link>
          </div>
        </div>
      </section>

      <section className="stats-section" id="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card reveal">
              <div className="stat-value" data-target="12500">0</div>
              <div className="stat-label">Total Players</div>
            </div>
            <div className="stat-card reveal">
              <div className="stat-value" data-target="48">0</div>
              <div className="stat-label">Active Tournaments</div>
            </div>
            <div className="stat-card reveal">
              <div className="stat-value" data-target="250000" data-prefix="₹">0</div>
              <div className="stat-label">Prize Distributed</div>
            </div>
            <div className="stat-card reveal">
              <div className="stat-value" data-target="320">0</div>
              <div className="stat-label">Champions Crowned</div>
            </div>
          </div>
        </div>
      </section>

      <section className="tournaments-section" id="tournaments">
        <div className="container">
          <h2 className="section-title reveal">Choose Your Battle</h2>
          <p className="section-subtitle reveal">Pick your tournament type and dominate the arena</p>

          <div className="tournament-grid">
            {tournaments.length === 0 ? (
              <p className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No active battles available right now.</p>
            ) : tournaments.map(t => (
              <div className="tournament-card reveal active" key={t.id}>
                <div className="card-icon">
                  <img 
                    src={`/assets/${t.type}_icon.png`} 
                    alt={t.type} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', mixBlendMode: 'screen' }} 
                  />
                </div>
                <div className="card-type" style={{textTransform: 'capitalize'}}>{t.type} Battle</div>
                <h3>{t.title}</h3>
                <div className="card-details">
                  <div className="detail-row">
                    <span className="detail-label">Players</span>
                    <span className="detail-value">{t.type === 'solo' ? '1 Player' : t.type === 'duo' ? '2 Players' : '4 Players'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Entry Fee</span>
                    <span className="detail-value highlight">₹{t.entryFee}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Prize Pool</span>
                    <span className="detail-value highlight">₹{t.prizePool}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Slots</span>
                    <span className="detail-value">{t.totalSlots}</span>
                  </div>
                </div>
                <br />
                <Link href={`/register?tournamentId=${t.id}`} className="btn btn-primary">Register Now</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2 className="section-title reveal">How It Works</h2>
          <p className="section-subtitle reveal">Five simple steps to glory</p>
          <div className="timeline">
            <div className="timeline-item reveal">
              <div className="timeline-dot">📝</div>
              <div className="timeline-content">
                <h4>Register Your Team</h4>
                <p>Sign up with your squad and fill in your Free Fire details.</p>
              </div>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-dot">💳</div>
              <div className="timeline-content">
                <h4>Pay Entry Fee</h4>
                <p>Complete payment via UPI/wallet and upload screenshot.</p>
              </div>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-dot">🎮</div>
              <div className="timeline-content">
                <h4>Join the Match</h4>
                <p>Receive room ID and password before match starts.</p>
              </div>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-dot">⚔️</div>
              <div className="timeline-content">
                <h4>Qualify &amp; Compete</h4>
                <p>Battle through qualifiers and climb the bracket.</p>
              </div>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-dot">🏆</div>
              <div className="timeline-content">
                <h4>Win the Prize</h4>
                <p>Champions receive instant prize money to their account.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="format-section" id="format">
        <div className="container">
          <h2 className="section-title reveal">Tournament Format</h2>
          <p className="section-subtitle reveal">Battle through the bracket to become champion</p>
          <div className="bracket-container reveal">
            <div className="bracket-stage">
              <div className="bracket-node">
                <div className="node-label">ROUND 1</div>
                Qualifiers
              </div>
            </div>
            <div className="bracket-connector"></div>
            <div className="bracket-stage">
              <div className="bracket-node">
                <div className="node-label">TOP 8</div>
                Quarter Finals
              </div>
            </div>
            <div className="bracket-connector"></div>
            <div className="bracket-stage">
              <div className="bracket-node">
                <div className="node-label">TOP 4</div>
                Semi Finals
              </div>
            </div>
            <div className="bracket-connector"></div>
            <div className="bracket-stage">
              <div className="bracket-node">
                <div className="node-label">TOP 2</div>
                Grand Final
              </div>
            </div>
            <div className="bracket-connector"></div>
            <div className="bracket-stage">
              <div className="bracket-node champion">
                <div className="node-label">🏆 WINNER</div>
                Champion
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="upcoming-section" id="upcoming">
        <div className="container">
          <h2 className="section-title reveal">Upcoming Tournaments</h2>
          <p className="section-subtitle reveal">Register before slots run out</p>
          <div className="upcoming-grid">
            {tournaments.length === 0 ? (
              <p className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No upcoming tournaments at the moment. Please check back later!</p>
            ) : tournaments.map(t => (
              <div className="upcoming-card reveal" key={t.id}>
                <div className="card-header">
                  <h3>{t.title}</h3>
                  <span className={`status-badge ${t.status === 'OPEN' ? 'open' : 'filling'}`}>{t.status}</span>
                </div>
                <div className="card-meta">
                  <div className="meta-item">
                    <div className="meta-label">Entry Fee</div>
                    <div className="meta-value">₹{t.entryFee}</div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-label">Prize Pool</div>
                    <div className="meta-value prize">₹{t.prizePool}</div>
                  </div>
                  <div className="meta-item" style={{ marginTop: '10px' }}>
                    <div className="meta-label">Date</div>
                    <div className="meta-value" style={{ fontSize: '0.9rem' }}>{new Date(t.scheduledDate).toLocaleString()}</div>
                  </div>
                </div>
                <Link href={`/register?tournamentId=${t.id}`} className="btn btn-primary btn-sm" style={{width: '100%'}}>Register Now</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="container">
          <h2 className="section-title reveal">Frequently Asked Questions</h2>
          <div className="faq-container">
            <div className="faq-item reveal">
              <button className="faq-question" aria-expanded="false">
                How do I register for a tournament?
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer">
                <div className="faq-answer-inner">
                  Click the &quot;Register Now&quot; button, select your tournament type, fill in your details, and upload the payment proof.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
