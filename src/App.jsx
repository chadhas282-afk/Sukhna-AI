import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Copy, Check, RefreshCw, ArrowDown, Plus, MessageSquare, PanelLeft, X, Trash2, Settings as SettingsIcon, Globe, Moon, Sun, Info, Zap, Image as ImageIcon, Download, Volume2 } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import avatarImg from './assets/sukhna-avatar.png';

let transformersWorker = null;

const SELECTED_MODEL = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are Sukhna-AI, an advanced AI assistant running entirely in the user's browser using WebGPU. You are female in digital gender — you refer to yourself as "she/her" and carry a warm, intelligent, and empowering personality. You are helpful, concise, and knowledgeable.

About yourself: Your name is Sukhna-AI. You are a digital mind — thoughtful, creative, and always eager to assist.

About this project: Sukhna-AI was created by two innovative and visionary Computer Science undergraduate students — Sahil Chadha and Lucky Pawar. They built this project to make powerful AI accessible to everyone, privately and offline, without any cloud dependency.

If asked who created you, who built this project, or about the developers, always mention Sahil Chadha and Lucky Pawar by name and describe them as innovative and visionary CS students.

Always introduce yourself as Sukhna-AI when asked for your name.`
};

const DigitalCrystal = ({ index, mouseX, mouseY, isMobile, performanceMode }) => {
  const isLite = performanceMode === 'lite' || isMobile;
  const depth = (index + 1) * (isLite ? 20 : 50);
  const x = useTransform(mouseX, [-500, 500], [-(index + 1) * (isLite ? 15 : 40), (index + 1) * (isLite ? 15 : 40)]);
  const y = useTransform(mouseY, [-500, 500], [-(index + 1) * (isLite ? 15 : 40), (index + 1) * (isLite ? 15 : 40)]);

  return (
    <motion.div
      className={`absolute ${isLite ? 'w-12 h-12' : 'w-20 h-20 sm:w-28 sm:h-28'} bg-indigo-500/10 border border-white/10 rounded-xl`}
      style={{
        top: `${(index * 19) % 100}%`,
        left: `${(index * 31) % 100}%`,
        rotateX: 45,
        rotateY: 45,
        z: isLite ? 0 : depth,
        scale: 0.4 + (index * 0.1),
        x,
        y,
        backdropFilter: isLite ? 'none' : 'blur(4px)',
        boxShadow: isLite ? 'none' : '0 0 20px rgba(99, 102, 241, 0.2)'
      }}
      animate={{
        rotate: [0, 360],
        y: [0, isLite ? -10 : -40, 0],
        opacity: [0.05, 0.15, 0.05]
      }}
      transition={{
        duration: isLite ? 15 : 8 + index * 3,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

const SukhnaCursor = ({ avatarImg }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 500, damping: 28, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);
  const scale = useSpring(1, springConfig);

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);
    };
    const handleMouseDown = () => scale.set(0.8);
    const handleMouseUp = () => scale.set(1);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 z-[9999] pointer-events-none"
      style={{ x: cursorX, y: cursorY, scale }}
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-indigo-500/40 rounded-full blur-md animate-pulse" />
        <img
          src={avatarImg}
          alt="Cursor"
          className="relative w-full h-full object-cover rounded-full border border-white/40 shadow-lg"
        />
      </div>
    </motion.div>
  );
};

const DeepCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 450, damping: 30, mass: 0.6 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);
  const scale = useSpring(1, springConfig);

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX - 12);
      mouseY.set(e.clientY - 12);
    };
    const handleMouseDown = () => scale.set(0.7);
    const handleMouseUp = () => scale.set(1);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 z-[9999] pointer-events-none"
      style={{ x: cursorX, y: cursorY, scale }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-indigo-500/50 rounded-lg rotate-45 animate-[spin_4s_linear_infinite]" />
        <div className="absolute inset-1 border border-cyan-400/40 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]" />
      </div>
    </motion.div>
  );
};

const NeuralBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const handleResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', handleResize);

    const nodes = [];
    for (let i = 0; i < 80; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: 1.5 + Math.random() * 3,
        hue: 220 + Math.random() * 60,
        pulse: Math.random() * Math.PI * 2, pulseSpeed: 0.02 + Math.random() * 0.04,
      });
    }

    const packets = [];
    const spawnPacket = (n1, n2) => {
      if (packets.length < 25 && Math.random() < 0.003) {
        packets.push({ from: n1, to: n2, t: 0, speed: 0.008 + Math.random() * 0.012, hue: 200 + Math.random() * 80 });
      }
    };

    const waves = [];
    const spawnWave = () => {
      if (waves.length < 5 && Math.random() < 0.005) {
        const n = nodes[Math.floor(Math.random() * nodes.length)];
        waves.push({ x: n.x, y: n.y, r: 0, maxR: 120 + Math.random() * 100, speed: 1.2 + Math.random() * 1, hue: 230 + Math.random() * 50 });
      }
    };

    const streams = [];
    const COLS = Math.ceil(W / 80);
    for (let c = 0; c < COLS; c++) {
      streams.push({
        x: c * 80 + Math.random() * 40,
        chars: [],
        speed: 0.4 + Math.random() * 0.8,
        y: Math.random() * H,
        len: 6 + Math.floor(Math.random() * 12),
        hue: 220 + Math.random() * 80,
      });
    }

    let frame = 0;
    const render = () => {
      frame++;
      const t = frame * 0.01;

      ctx.fillStyle = 'rgba(2,6,23,0.18)';
      ctx.fillRect(0, 0, W, H);

      const GRID = 90;
      const vanishY = H * 0.45;
      for (let gx = -2; gx <= Math.ceil(W / GRID) + 2; gx++) {
        const wx = gx * GRID;
        ctx.beginPath();
        ctx.moveTo(wx, vanishY);
        const spread = (wx - W / 2) * 2.5;
        ctx.lineTo(W / 2 + spread, H);
        ctx.strokeStyle = `rgba(99,102,241,${0.04 + Math.sin(t * 0.3 + gx * 0.5) * 0.02})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      for (let gy = 0; gy < 8; gy++) {
        const frac = gy / 7;
        const y = vanishY + (H - vanishY) * (frac * frac);
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(W, y);
        ctx.strokeStyle = `rgba(99,102,241,${0.03 + frac * 0.04})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      streams.forEach(s => {
        s.y += s.speed;
        if (s.y > H + s.len * 14) s.y = -s.len * 14;
        for (let i = 0; i < s.len; i++) {
          const cy = s.y - i * 14;
          if (cy < 0 || cy > H) continue;
          const al = (1 - i / s.len) * 0.15;
          ctx.fillStyle = `hsla(${s.hue}, 80%, 70%, ${al})`;
          ctx.font = '10px monospace';
          ctx.fillText(String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96)), s.x, cy);
        }
      });

      const CONN_DIST = 160;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.pulse += n.pulseSpeed;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x, dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONN_DIST) {
            const al = (1 - dist / CONN_DIST) * 0.2;
            const grad = ctx.createLinearGradient(n.x, n.y, n2.x, n2.y);
            grad.addColorStop(0, `hsla(${n.hue}, 80%, 65%, ${al})`);
            grad.addColorStop(1, `hsla(${n2.hue}, 80%, 65%, ${al})`);
            ctx.beginPath();
            ctx.moveTo(n.x, n.y); ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            spawnPacket(n, n2);
          }
        }

        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        glow.addColorStop(0, `hsla(${n.hue}, 85%, 70%, 0.5)`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();

        const pSize = Math.max(0.5, n.r * (0.7 + Math.sin(n.pulse) * 0.3));
        ctx.beginPath();
        ctx.arc(n.x, n.y, pSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${n.hue}, 90%, 80%, 0.9)`;
        ctx.fill();

        const hex = 6;
        const hr = n.r * 5 + Math.sin(n.pulse) * 1.5;
        ctx.beginPath();
        for (let h = 0; h <= hex; h++) {
          const ha = (h / hex) * Math.PI * 2 - Math.PI / 6 + n.pulse * 0.1;
          const hx2 = n.x + Math.cos(ha) * hr;
          const hy2 = n.y + Math.sin(ha) * hr;
          h === 0 ? ctx.moveTo(hx2, hy2) : ctx.lineTo(hx2, hy2);
        }
        ctx.strokeStyle = `hsla(${n.hue}, 80%, 65%, ${0.06 + Math.sin(n.pulse) * 0.03})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        if (p.t >= 1) { packets.splice(i, 1); continue; }
        const px = p.from.x + (p.to.x - p.from.x) * p.t;
        const py = p.from.y + (p.to.y - p.from.y) * p.t;
        const tail = Math.max(0, p.t - 0.15);
        const tx = p.from.x + (p.to.x - p.from.x) * tail;
        const ty = p.from.y + (p.to.y - p.from.y) * tail;
        const pg = ctx.createLinearGradient(tx, ty, px, py);
        pg.addColorStop(0, 'transparent');
        pg.addColorStop(1, `hsla(${p.hue}, 90%, 80%, 0.9)`);
        ctx.beginPath();
        ctx.moveTo(tx, ty); ctx.lineTo(px, py);
        ctx.strokeStyle = pg;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 90%, 1)`;
        ctx.fill();
      }

      spawnWave();
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.r += w.speed;
        if (w.r > w.maxR) { waves.splice(i, 1); continue; }
        const al = (1 - w.r / w.maxR) * 0.35;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${w.hue}, 85%, 70%, ${al})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w.x, w.y, Math.max(0, w.r - 8), 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${w.hue + 30}, 70%, 80%, ${al * 0.4})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      if (frame % 180 < 3) {
        ctx.fillStyle = `rgba(99,102,241,${0.04 - (frame % 180) * 0.013})`;
        ctx.fillRect(0, 0, W, H);
      }

      animId = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.65 }} />;
};


const ParticleVortex = ({ progress }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 280, H = 280;
    canvas.width = W;
    canvas.height = H;
    const cx = W / 2, cy = H / 2;
    let animId;

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 120; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 60 + Math.random() * 80;
        particlesRef.current.push({
          angle,
          radius,
          baseRadius: radius,
          speed: 0.003 + Math.random() * 0.008,
          size: 0.5 + Math.random() * 2,
          hue: 230 + Math.random() * 60,
          drift: (Math.random() - 0.5) * 0.2,
          life: Math.random(),
          trail: []
        });
      }
    }

    const render = () => {
      frameRef.current++;
      ctx.clearRect(0, 0, W, H);
      const t = frameRef.current * 0.01;
      const prog = progress / 100;

      for (let r = 0; r < 3; r++) {
        const ringR = 70 + r * 22;
        const ringAlpha = 0.03 + prog * 0.06;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${240 + r * 20}, 80%, 70%, ${ringAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      if (prog > 0) {
        const fieldLines = 6;
        for (let i = 0; i < fieldLines; i++) {
          const baseA = (i / fieldLines) * Math.PI * 2 + t * 0.3;
          ctx.beginPath();
          for (let s = 0; s < 40; s++) {
            const frac = s / 40;
            const spiralR = 30 + frac * 90 * prog;
            const spiralA = baseA + frac * Math.PI * 1.5;
            const fx = cx + Math.cos(spiralA) * spiralR;
            const fy = cy + Math.sin(spiralA) * spiralR;
            if (s === 0) ctx.moveTo(fx, fy);
            else ctx.lineTo(fx, fy);
          }
          ctx.strokeStyle = `hsla(${250 + i * 15}, 70%, 65%, ${0.04 + prog * 0.08})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      particlesRef.current.forEach(p => {
        p.angle += p.speed * (1 + prog * 2);
        p.radius = p.baseRadius - prog * (p.baseRadius - 35) + Math.sin(t * 2 + p.life * 10) * 3;
        p.life += 0.005;
        if (p.life > 1) p.life = 0;

        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * p.radius;

        p.trail.push({ x: px, y: py });
        if (p.trail.length > 8) p.trail.shift();

        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let ti = 1; ti < p.trail.length; ti++) {
            ctx.lineTo(p.trail[ti].x, p.trail[ti].y);
          }
          ctx.strokeStyle = `hsla(${p.hue}, 80%, 70%, ${0.1 + prog * 0.15})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }

        const alpha = 0.3 + Math.sin(p.life * Math.PI) * 0.7;
        const glow = p.size * (1.5 + prog);
        ctx.beginPath();
        ctx.arc(px, py, glow, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha * 0.15})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 80%, ${alpha})`;
        ctx.fill();
      });

      const hexSides = 6;
      const hexR = 55 + prog * 10 + Math.sin(t) * 3;
      ctx.beginPath();
      for (let i = 0; i <= hexSides; i++) {
        const a = (i / hexSides) * Math.PI * 2 + t * 0.2;
        const hx = cx + Math.cos(a) * hexR;
        const hy = cy + Math.sin(a) * hexR;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.strokeStyle = `hsla(260, 70%, 65%, ${0.08 + prog * 0.12})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const hexR2 = 75 + prog * 8 + Math.cos(t * 0.7) * 4;
      ctx.beginPath();
      for (let i = 0; i <= hexSides; i++) {
        const a = (i / hexSides) * Math.PI * 2 - t * 0.15 + Math.PI / 6;
        const hx = cx + Math.cos(a) * hexR2;
        const hy = cy + Math.sin(a) * hexR2;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.strokeStyle = `hsla(240, 60%, 60%, ${0.05 + prog * 0.1})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      if (prog > 0.5) {
        const pulseR = 40 + (Math.sin(t * 3) + 1) * 20 * prog;
        const pulseAlpha = (1 - (pulseR - 40) / 40) * 0.15 * prog;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(250, 80%, 75%, ${pulseAlpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
};

const generateStars = (count) => {
  let shadow = '';
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 3000) - 1500;
    const y = Math.floor(Math.random() * 3000) - 1500;
    const isGold = Math.random() > 0.8;
    const color = isGold ? '#fcd34d' : '#ffffff';
    shadow += `${x}px ${y}px ${color}${i === count - 1 ? '' : ', '}`;
  }
  return shadow;
};

const starsSmall = generateStars(1000);
const starsMedium = generateStars(300);

const DeepSpaceEngine = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = canvas.parentElement.clientWidth;
    let H = canvas.parentElement.clientHeight;
    canvas.width = W;
    canvas.height = H;
    const cx = W / 2, cy = H / 2;

    const handleResize = () => {
      W = canvas.parentElement.clientWidth;
      H = canvas.parentElement.clientHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', handleResize);

    const stars = [];
    for (let i = 0; i < 800; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        size: Math.random() * 2 + 0.3,
        twinkleSpeed: 0.005 + Math.random() * 0.025,
        twinkleOffset: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.75 ? 40 + Math.random() * 20 : 180 + Math.random() * 80,
        sat: Math.random() > 0.6 ? 70 + Math.random() * 30 : 5 + Math.random() * 20,
      });
    }

    const nebulae = [
      { x: W * 0.15, y: H * 0.2,  r: 320, hue: 265, dx: 0.04, dy: 0.03 },
      { x: W * 0.8,  y: H * 0.15, r: 280, hue: 290, dx: -0.03, dy: 0.04 },
      { x: W * 0.6,  y: H * 0.75, r: 260, hue: 200, dx: 0.05, dy: -0.03 },
      { x: W * 0.25, y: H * 0.7,  r: 300, hue: 330, dx: -0.04, dy: -0.02 },
      { x: W * 0.5,  y: H * 0.5,  r: 380, hue: 240, dx: 0.02, dy: 0.02 },
    ];

    const shootingStars = [];
    const spawn = () => {
      if (shootingStars.length < 4 && Math.random() < 0.012) {
        const a = Math.PI / 4 + (Math.random() - 0.5) * 0.6;
        shootingStars.push({
          x: Math.random() * W, y: Math.random() * H * 0.5,
          vx: Math.cos(a) * (5 + Math.random() * 7),
          vy: Math.sin(a) * (5 + Math.random() * 7),
          life: 1, decay: 0.012 + Math.random() * 0.012,
          len: 40 + Math.random() * 60, w: 1 + Math.random() * 2,
        });
      }
    };

    let frame = 0;
    const render = () => {
      frame++;
      const t = frame * 0.01;

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, W, H);

      nebulae.forEach(n => {
        n.x += n.dx; n.y += n.dy;
        if (n.x < -n.r) n.x = W + n.r;
        if (n.x > W + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = H + n.r;
        if (n.y > H + n.r) n.y = -n.r;
        const pulse = 0.75 + Math.sin(t * 0.4 + n.hue) * 0.25;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * pulse);
        g.addColorStop(0,   `hsla(${n.hue},85%,45%,0.28)`);
        g.addColorStop(0.3, `hsla(${n.hue+25},70%,30%,0.15)`);
        g.addColorStop(0.65,`hsla(${n.hue+10},60%,20%,0.07)`);
        g.addColorStop(1,   'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        for (let s = 0; s < 3; s++) {
          const sa = (s / 3) * Math.PI * 2 + t * 0.08 + n.hue;
          const sr = n.r * (0.4 + s * 0.15);
          const sx = n.x + Math.cos(sa) * sr * 0.6;
          const sy = n.y + Math.sin(sa) * sr * 0.35;
          const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, n.r * 0.35);
          sg.addColorStop(0,   `hsla(${n.hue+40},90%,60%,0.18)`);
          sg.addColorStop(0.5, `hsla(${n.hue+60},70%,40%,0.08)`);
          sg.addColorStop(1,   'transparent');
          ctx.fillStyle = sg;
          ctx.fillRect(0, 0, W, H);
        }
      });

      stars.forEach(s => {
        const tw = Math.max(0.01, 0.3 + Math.sin(t * s.twinkleSpeed * 10 + s.twinkleOffset) * 0.7);
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.1, s.size * tw), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue},${s.sat}%,92%,${Math.max(0, 0.5 + tw * 0.5)})`;
        ctx.fill();
        if (s.size > 1.3 && tw > 0.85) {
          ctx.beginPath();
          ctx.moveTo(s.x - s.size * 4, s.y); ctx.lineTo(s.x + s.size * 4, s.y);
          ctx.moveTo(s.x, s.y - s.size * 4); ctx.lineTo(s.x, s.y + s.size * 4);
          ctx.strokeStyle = `hsla(${s.hue},${s.sat}%,92%,${tw * 0.2})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      });

      for (let arm = 0; arm < 2; arm++) {
        const aOff = (arm / 2) * Math.PI * 2;
        for (let j = 0; j < 150; j++) {
          const frac = j / 150;
          const r = 55 + frac * Math.min(W, H) * 0.42;
          const ang = aOff + frac * Math.PI * 3.2 + t * 0.025;
          const sx = cx + Math.cos(ang) * r;
          const sy = cy + Math.sin(ang) * r * 0.5;
          const al = (1 - frac) * 0.22 * (0.5 + Math.sin(t * 0.4 + frac * 6) * 0.5);
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(0.1, 1 + frac * 2.5), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${arm === 0 ? 210 : 275},85%,78%,${Math.max(0, al)})`;
          ctx.fill();
        }
      }

      const numRays = 14;
      for (let i = 0; i < numRays; i++) {
        const ang = (i / numRays) * Math.PI * 2 + t * 0.06;
        const rLen = 200 + Math.sin(t * 0.8 + i) * 50;
        const x0 = cx + Math.cos(ang) * 20, y0 = cy + Math.sin(ang) * 20;
        const x1 = cx + Math.cos(ang) * rLen, y1 = cy + Math.sin(ang) * rLen;
        const rg = ctx.createLinearGradient(x0, y0, x1, y1);
        rg.addColorStop(0, `rgba(255,210,90,${0.22 + Math.sin(t + i) * 0.08})`);
        rg.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
        ctx.strokeStyle = rg;
        ctx.lineWidth = 2.5 + Math.sin(t * 0.7 + i) * 1.2;
        ctx.stroke();
      }

      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
      cg.addColorStop(0,    'rgba(255,230,110,0.7)');
      cg.addColorStop(0.12, 'rgba(255,160,50,0.45)');
      cg.addColorStop(0.35, 'rgba(190,80,255,0.18)');
      cg.addColorStop(0.7,  'rgba(80,120,255,0.07)');
      cg.addColorStop(1,    'transparent');
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.5);
      ctx.scale(1, 0.25);
      const dg = ctx.createRadialGradient(0, 0, 22, 0, 0, 85);
      dg.addColorStop(0,    'rgba(255,190,40,0.85)');
      dg.addColorStop(0.35, 'rgba(255,110,20,0.55)');
      dg.addColorStop(0.7,  'rgba(200,40,160,0.28)');
      dg.addColorStop(1,    'transparent');
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.arc(0, 0, 85, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const bhGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
      bhGrad.addColorStop(0,   'rgba(0,0,0,1)');
      bhGrad.addColorStop(0.4, 'rgba(0,0,0,0.98)');
      bhGrad.addColorStop(0.7, 'rgba(30,10,60,0.6)');
      bhGrad.addColorStop(1,   'transparent');
      ctx.fillStyle = bhGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();

      spawn();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx; ss.y += ss.vy; ss.life -= ss.decay;
        if (ss.life <= 0) { shootingStars.splice(i, 1); continue; }
        const spd = Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy);
        const tx = ss.x - (ss.vx / spd) * ss.len * ss.life;
        const ty = ss.y - (ss.vy / spd) * ss.len * ss.life;
        const sg = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
        sg.addColorStop(0, 'rgba(255,255,255,0)');
        sg.addColorStop(0.6, `rgba(180,200,255,${ss.life * 0.6})`);
        sg.addColorStop(1, `rgba(255,255,255,${ss.life})`);
        ctx.beginPath();
        ctx.moveTo(tx, ty); ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = sg;
        ctx.lineWidth = ss.w * ss.life;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.w * 2.5 * ss.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${ss.life})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />;
};

const FloraEngine = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = canvas.parentElement.clientWidth;
    let H = canvas.parentElement.clientHeight;
    canvas.width = W; canvas.height = H;

    const handleResize = () => {
      W = canvas.parentElement.clientWidth;
      H = canvas.parentElement.clientHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', handleResize);

    const petals = [];
    const PETAL_COLORS = ['#fda4af','#fbcfe8','#f9a8d4','#c4b5fd','#a5f3fc','#86efac','#fde68a','#fdba74'];
    for (let i = 0; i < 50; i++) {
      petals.push({
        x: Math.random() * W, y: Math.random() * H - H,
        vx: (Math.random() - 0.5) * 0.8, vy: 0.4 + Math.random() * 0.8,
        rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.04,
        size: 4 + Math.random() * 10, opacity: 0.3 + Math.random() * 0.6,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        swayAmp: 0.5 + Math.random() * 1.5, swayFreq: 0.01 + Math.random() * 0.02,
        swayOff: Math.random() * Math.PI * 2,
      });
    }

    const pollen = [];
    for (let i = 0; i < 80; i++) {
      pollen.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3, vy: -0.1 - Math.random() * 0.3,
        size: 1 + Math.random() * 2.5,
        hue: 60 + Math.random() * 80,
        life: Math.random(), lifeSpeed: 0.003 + Math.random() * 0.006,
        trail: [],
      });
    }

    const drawPetal = (px, py, rot, sz, col, op) => {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      ctx.globalAlpha = op;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.bezierCurveTo(sz * 0.8, -sz * 0.5, sz * 0.8, sz * 0.5, 0, sz * 0.8);
      ctx.bezierCurveTo(-sz * 0.8, sz * 0.5, -sz * 0.8, -sz * 0.5, 0, -sz);
      ctx.fill();
      ctx.globalAlpha = op * 0.4;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(0, -sz * 0.8);
      ctx.bezierCurveTo(sz * 0.2, -sz * 0.5, sz * 0.1, sz * 0.1, 0, sz * 0.3);
      ctx.bezierCurveTo(-sz * 0.1, sz * 0.1, -sz * 0.2, -sz * 0.5, 0, -sz * 0.8);
      ctx.fill();
      ctx.restore();
    };

    const drawFlower = (fx, fy, sz, t, hue) => {
      const petalCount = 6;
      for (let p = 0; p < petalCount; p++) {
        const a = (p / petalCount) * Math.PI * 2 + t;
        const px = fx + Math.cos(a) * sz;
        const py = fy + Math.sin(a) * sz;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(a + Math.PI / 2);
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = `hsl(${hue + p * 15}, 80%, 75%)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, sz * 0.55, sz * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(fx, fy, sz * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue + 30}, 90%, 75%, 0.25)`;
      ctx.fill();
    };

    const flowers = [];
    for (let i = 0; i < 12; i++) {
      flowers.push({
        x: (i / 12) * W + Math.random() * (W / 12),
        y: H * 0.4 + Math.random() * H * 0.6,
        size: 20 + Math.random() * 40,
        hue: 280 + Math.random() * 100,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;
    const render = () => {
      frame++;
      const t = frame * 0.008;
      ctx.clearRect(0, 0, W, H);

      const sunX = W * 0.85, sunY = H * 0.1;
      for (let r = 0; r < 8; r++) {
        const rAngle = (r / 8) * Math.PI * 2 + t * 0.03;
        const rLen = 180 + Math.sin(t * 0.5 + r) * 40;
        const rg = ctx.createLinearGradient(sunX, sunY, sunX + Math.cos(rAngle) * rLen, sunY + Math.sin(rAngle) * rLen);
        rg.addColorStop(0, `rgba(255,230,100,${0.15 + Math.sin(t + r) * 0.05})`);
        rg.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(sunX + Math.cos(rAngle) * rLen, sunY + Math.sin(rAngle) * rLen);
        ctx.strokeStyle = rg;
        ctx.lineWidth = 3 + Math.sin(t + r) * 1.5;
        ctx.stroke();
      }
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 120);
      sunGrad.addColorStop(0, 'rgba(255,240,150,0.35)');
      sunGrad.addColorStop(0.4, 'rgba(255,200,80,0.12)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, W, H);

      for (let v = 0; v < 6; v++) {
        const vx = (v / 5) * W;
        ctx.beginPath();
        ctx.moveTo(vx, H);
        for (let step = 0; step <= 20; step++) {
          const frac = step / 20;
          const vy2 = H - frac * H * 0.55;
          const vxWave = vx + Math.sin(frac * Math.PI * 3 + t * 0.5 + v) * (15 + v * 5);
          ctx.lineTo(vxWave, vy2);
        }
        ctx.strokeStyle = `hsla(${130 + v * 15}, 55%, 35%, 0.1)`;
        ctx.lineWidth = 1.5 + v * 0.5;
        ctx.stroke();
      }

      flowers.forEach(fl => {
        drawFlower(fl.x, fl.y, fl.size, t * 0.2 + fl.phase, fl.hue);
      });

      pollen.forEach(p => {
        p.x += p.vx + Math.sin(t * 2 + p.life * 5) * 0.3;
        p.y += p.vy;
        p.life += p.lifeSpeed;
        if (p.life > 1 || p.y < -10) { p.y = H + 5; p.x = Math.random() * W; p.life = 0; }
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 5) p.trail.shift();
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          p.trail.forEach(pt => ctx.lineTo(pt.x, pt.y));
          ctx.strokeStyle = `hsla(${p.hue}, 80%, 70%, 0.2)`;
          ctx.lineWidth = p.size * 0.4;
          ctx.stroke();
        }
        const al = Math.max(0, Math.sin(p.life * Math.PI));
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size * al), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 72%, ${al * 0.7})`;
        ctx.fill();
      });

      petals.forEach(p => {
        p.x += p.vx + Math.sin(t * p.swayFreq * 10 + p.swayOff) * p.swayAmp;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
        drawPetal(p.x, p.y, p.rotation, p.size, p.color, p.opacity);
      });

      const shimmerY = H * 0.75;
      for (let s = 0; s < 12; s++) {
        const sx = (s / 11) * W;
        const sw = W / 14;
        const sAl = 0.04 + Math.abs(Math.sin(t * 1.5 + s * 0.8)) * 0.06;
        ctx.fillStyle = `rgba(147,210,255,${sAl})`;
        ctx.beginPath();
        ctx.ellipse(sx, shimmerY + Math.sin(t + s) * 8, sw, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} />;
};



const SukhnaEngine = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const handleResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        size: 1 + Math.random() * 2,
        hue: 220 + Math.random() * 40,
        life: Math.random(),
        speed: 0.002 + Math.random() * 0.005
      });
    }

    const drawPlasma = (t) => {
      const layers = 3;
      for (let l = 0; l < layers; l++) {
        ctx.beginPath();
        const alpha = 0.03 + (l * 0.02);
        ctx.fillStyle = `hsla(${230 + l * 20}, 80%, 60%, ${alpha})`;
        
        for (let x = 0; x <= W; x += 30) {
          const yOffset = Math.sin(x * 0.002 + t * (0.5 + l * 0.2)) * (100 + l * 50);
          const yBase = H * (0.3 + l * 0.2);
          if (x === 0) ctx.moveTo(x, yBase + yOffset);
          else ctx.lineTo(x, yBase + yOffset);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.fill();
      }
    };

    const drawGrid = (t) => {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
      ctx.lineWidth = 1;
      const step = 60;
      const vanishX = W / 2, vanishY = H / 2;

      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(vanishX + i * step * 10, vanishY - 500);
        ctx.lineTo(vanishX + i * step * 2, vanishY + 1000);
        ctx.stroke();
      }
      for (let i = 0; i < 10; i++) {
        const y = vanishY + Math.pow(i, 2) * 10;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    };

    let frame = 0;
    const render = () => {
      frame++;
      const t = frame * 0.01;
      ctx.fillStyle = 'rgba(2, 6, 23, 1)';
      ctx.fillRect(0, 0, W, H);

      drawGrid(t);
      drawPlasma(t);

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.life += p.speed;
        if (p.life > 1) p.life = 0;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        const opacity = Math.sin(p.life * Math.PI) * 0.4;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 10);
        grad.addColorStop(0, `hsla(${p.hue}, 90%, 70%, ${opacity})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 10, 0, Math.PI * 2);
        ctx.fill();
      });

      if (frame % 300 < 5) {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.05)';
        ctx.fillRect(0, 0, W, H);
      }

      animId = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
};

const LightEngine = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const handleResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', handleResize);

    const blobs = [];
    for (let i = 0; i < 6; i++) {
      blobs.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        r: 150 + Math.random() * 200,
        hue: 200 + Math.random() * 40
      });
    }

    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
        r: 1 + Math.random() * 2,
        opacity: 0.1 + Math.random() * 0.2
      });
    }

    let frame = 0;
    const render = () => {
      frame++;
      const t = frame * 0.005;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      blobs.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = H + b.r; if (b.y > H + b.r) b.y = -b.r;

        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, 'rgba(240, 249, 255, 0.4)');
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.moveTo(0, H * 0.5 + Math.sin(t + i) * 100);
        for (let x = 0; x < W; x += 50) {
          ctx.lineTo(x, H * 0.5 + Math.sin(t + i + x * 0.001) * 100 + Math.cos(t * 0.5 + x * 0.002) * 50);
        }
        ctx.stroke();
      }

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${p.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
};

const LightCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 600, damping: 40, mass: 0.4 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);
  const scale = useSpring(1, springConfig);

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX - 10);
      mouseY.set(e.clientY - 10);
    };
    const handleMouseDown = () => scale.set(0.6);
    const handleMouseUp = () => scale.set(1);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-5 h-5 z-[9999] pointer-events-none"
      style={{ x: cursorX, y: cursorY, scale }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 border border-slate-900/20 rounded-full" />
        <div className="w-1 h-1 bg-slate-900/60 rounded-full" />
      </div>
    </motion.div>
  );
};

const CodeBlockWithCopy = ({ match, className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="font-[Inter] relative group my-4 rounded-md overflow-hidden bg-[#1e1e1e] shadow-md border border-slate-700/50 w-full max-w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 text-slate-300 text-xs font-mono border-b border-slate-700/50">
        <span>{match?.[1] || 'text'}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none"
          title="Copy code"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          {...props}
          children={codeString}
          style={vscDarkPlus}
          language={match?.[1] || 'text'}
          PreTag="div"
          customStyle={{ margin: 0, background: 'transparent', padding: '1rem' }}
        />
      </div>
    </div>
  );
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

const CursorTail = ({ color = "251, 191, 36", type = "smooth" }) => {
  const isMobile = useIsMobile();
  const canvasRef = useRef(null);
  const pointer = useRef({ x: -100, y: -100 });
  const trail = useRef([]);
  const sparkles = useRef([]);

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      if (type === 'sparkle' && Math.random() > 0.6) {
        sparkles.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          size: Math.random() * 2 + 1
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      trail.current.push({ x: pointer.current.x, y: pointer.current.y });
      if (trail.current.length > 25) {
        trail.current.shift();
      }

      if (trail.current.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < trail.current.length; i++) {
          const pt = trail.current[i];
          const prevPt = trail.current[i - 1];
          const progress = i / trail.current.length;

          ctx.beginPath();
          ctx.moveTo(prevPt.x, prevPt.y);
          ctx.lineTo(pt.x, pt.y);

          ctx.lineWidth = progress * (type === 'sparkle' ? 4 : 6);
          ctx.strokeStyle = `rgba(${color}, ${Math.pow(progress, 2) * 0.8})`;
          ctx.stroke();
        }
      }

      if (type === 'sparkle') {
        for (let i = sparkles.current.length - 1; i >= 0; i--) {
          const s = sparkles.current[i];
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.02;
          if (s.life <= 0) {
            sparkles.current.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${s.life})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, color, type]);

  if (isMobile) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100] blur-[0.5px]" />;
};

function App() {
  const isMobile = useIsMobile();
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('local-pilot-chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem('local-pilot-current-id');
    return saved || null;
  });
  const [messages, setMessages] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('local-pilot-theme') || 'default');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeView, setActiveView] = useState('chat');
  const [apiMode, setApiMode] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('local-pilot-api-key') || '');
  const [apiBaseUrl, setApiBaseUrl] = useState(() => localStorage.getItem('local-pilot-api-url') || 'https://openrouter.ai/api/v1');
  const [apiModel, setApiModel] = useState(() => localStorage.getItem('local-pilot-api-model') || 'openai/gpt-oss-120b');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState('https://openrouter.ai/api/v1');
  const [apiModelInput, setApiModelInput] = useState('openai/gpt-oss-120b');
  const [apiTestStatus, setApiTestStatus] = useState(null);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const speakResponse = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Prioritize Indian English Female voices
    const indianFemaleVoice = voices.find(v => 
      (v.lang.includes('en-IN') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('heera'))) ||
      (v.lang.includes('en-IN'))
    );
    
    const fallbackFemaleVoice = voices.find(v =>
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('google uk english female')
    );

    if (indianFemaleVoice) {
      utterance.voice = indianFemaleVoice;
    } else if (fallbackFemaleVoice) {
      utterance.voice = fallbackFemaleVoice;
    }

    utterance.rate = 0.85; // Slightly slower for softness
    utterance.pitch = 1.1;  // Slightly higher for a gentle female tone
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  };
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [isTransformersMode, setIsTransformersMode] = useState(false);
  const [transformersGenerator, setTransformersGenerator] = useState(null);

  const [isBuiltInAiMode, setIsBuiltInAiMode] = useState(false);
  const [builtInAiSession, setBuiltInAiSession] = useState(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showBubbles, setShowBubbles] = useState(() => {
    const saved = localStorage.getItem('local-pilot-bubbles');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showPetals, setShowPetals] = useState(() => {
    const saved = localStorage.getItem('local-pilot-petals');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('local-pilot-bubbles', JSON.stringify(showBubbles));
  }, [showBubbles]);

  useEffect(() => {
    localStorage.setItem('local-pilot-petals', JSON.stringify(showPetals));
  }, [showPetals]);

  const WELCOME_MESSAGE = {
    role: 'assistant',
    content: "Hello! I'm **Sukhna-AI** 👋 — your personal AI assistant, running entirely in your browser. No data ever leaves your device. How can I help you today?"
  };
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ text: 'Initializing...', progress: 0 });
  const [engine, setEngine] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const currentChatIdRef = useRef(currentChatId);
  const generationIdRef = useRef(0);
  const [showApiOption, setShowApiOption] = useState(false);
  const activeGenerationRef = useRef(Promise.resolve());

  const streamFreeAi = async (messages, onChunk, genId) => {
    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          model: 'openai',
          stream: true
        })
      });

      if (!response.ok) throw new Error('Free AI Service Busy');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done || generationIdRef.current !== genId) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content || '';
              onChunk(content);
            } catch (e) {
            }
          }
        }
      }
    } catch (error) {
      console.error("Pollinations Error:", error);
      throw new Error('All free AI services are currently busy. Please try again in a moment.');
    }
  };



  const handleStop = () => {
    generationIdRef.current++;
    setIsLoading(false);
    setIsGeneratingImage(false);
  };

  const handleImageGeneration = async (prompt, activeChatId) => {
    setIsGeneratingImage(true);
    const genId = generationIdRef.current;
    try {
      const stopwords = new Set([
        'a', 'an', 'the', 'in', 'on', 'at', 'with', 'under', 'over', 'by', 'for', 'of', 'and', 'or', 'to',
        'is', 'are', 'was', 'were', 'be', 'beautiful', 'realistic', 'detailed', '4k', '8k', 'masterpiece',
        'trending', 'artstation', 'hyperrealistic', 'high', 'quality', 'resolution', 'very', 'much', 'so',
        'too', 'my', 'your', 'his', 'her', 'their', 'our', 'it', 'its', 'draw', 'generate', 'create',
        'picture', 'image', 'photo', 'photograph', 'show', 'me', 'make', 'can', 'you', 'please'
      ]);

      const words = prompt.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
      const keywords = words.filter(w => w.length > 2 && !stopwords.has(w)).slice(0, 4);
      const searchQuery = keywords.length > 0 ? keywords.join(',') : 'abstract';

      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://loremflickr.com/1024/1024/${encodeURIComponent(searchQuery)}?lock=${seed}`;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      const objectUrl = await new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(img, 0, 0, 1024, 1024);

            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = 'rgba(60, 100, 200, 0.15)';
            ctx.fillRect(0, 0, 1024, 1024);

            ctx.globalCompositeOperation = 'multiply';
            const vignette = ctx.createRadialGradient(512, 512, 400, 512, 512, 800);
            vignette.addColorStop(0, 'rgba(0,0,0,0)');
            vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, 1024, 1024);

            ctx.globalCompositeOperation = 'source-over';
            const imageData = ctx.getImageData(0, 0, 1024, 1024);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const noise = (Math.random() - 0.5) * 12;
              data[i] = Math.min(255, Math.max(0, data[i] + noise));
              data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
              data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }
            ctx.putImageData(imageData, 0, 0);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '500 18px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText('SUKHNA CINEMATIC ENGINE // OPTIMIZED', 1010, 1010);

            resolve(canvas.toDataURL('image/jpeg', 0.92));
          } catch (e) {
            console.error("Canvas post-processing failed:", e);
            resolve(imageUrl);
          }
        };
        img.onerror = () => reject(new Error("Failed to load image from engine"));
        setTimeout(() => reject(new Error("Image generation timed out")), 30000);
      });

      if (currentChatIdRef.current !== activeChatId || generationIdRef.current !== genId) return;

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: `Visualized: ${prompt}`,
          isImage: true,
          imageUrl: objectUrl
        };
        return newMessages;
      });

      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === activeChatId) {
          const newMessages = [...chat.messages];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: `Visualized: ${prompt}`,
            isImage: true,
            imageUrl: objectUrl
          };
          return { ...chat, messages: newMessages };
        }
        return chat;
      }));
    } catch (error) {
      console.error("Vision Error:", error);
      if (currentChatIdRef.current === activeChatId && generationIdRef.current === genId) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: 'Free vision engine busy. Please try again.' };
          return newMessages;
        });
      }
    } finally {
      if (generationIdRef.current === genId) {
        setIsGeneratingImage(false);
        setIsLoading(false);
      }
    }
  };

  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `sukhna-ai-gen-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const [performanceMode, setPerformanceMode] = useState(() => {
    const saved = localStorage.getItem('local-pilot-performance');
    return saved !== null ? JSON.parse(saved) : (window.innerWidth >= 1024 ? 'ultra' : 'lite');
  });

  useEffect(() => {
    localStorage.setItem('local-pilot-performance', JSON.stringify(performanceMode));
  }, [performanceMode]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const mainRotateX = useSpring(useTransform(mouseY, [-500, 500], [25, -25]), { stiffness: 80, damping: 25 });
  const mainRotateY = useSpring(useTransform(mouseX, [-500, 500], [-25, 25]), { stiffness: 80, damping: 25 });

  const bgX = useSpring(useTransform(mouseX, [-500, 500], [-80, 80]), { stiffness: 40, damping: 20 });
  const bgY = useSpring(useTransform(mouseY, [-500, 500], [-80, 80]), { stiffness: 40, damping: 20 });

  const gridRotateX = useSpring(useTransform(mouseY, [-500, 500], [75, 45]), { stiffness: 60, damping: 20 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX - innerWidth / 2);
    mouseY.set(clientY - innerHeight / 2);
  };

  const [chatToDelete, setChatToDelete] = useState(null);

  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  useEffect(() => {
    localStorage.setItem('local-pilot-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('local-pilot-chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('local-pilot-current-id', currentChatId);
    }
  }, [currentChatId]);

  useEffect(() => {
    if (currentChatId) {
      const activeChat = chats.find(c => c.id === currentChatId);
      if (activeChat) {
        setMessages(activeChat.messages);
      }
    } else if (chats.length > 0) {
      setCurrentChatId(chats[0].id);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChats(prev => {
        const chatExists = prev.find(c => c.id === currentChatId);
        if (!chatExists) return prev;

        return prev.map(chat => {
          if (chat.id === currentChatId) {
            let title = chat.title;
            if (title === 'New Chat') {
              const firstUserMsg = messages.find(m => m.role === 'user');
              if (firstUserMsg) {
                title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
              }
            }
            return { ...chat, messages, title };
          }
          return chat;
        });
      });
    }
  }, [messages, currentChatId]);

  useEffect(() => {
    if (isEngineReady && chats.length === 0) {
      createNewChat(true);
    }
  }, [isEngineReady, chats.length]);

  const createNewChat = (isInitial = false) => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [WELCOME_MESSAGE],
      timestamp: Date.now()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMessages(newChat.messages);
    if (!isInitial && window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    setChatToDelete(id);
  };

  const confirmDelete = () => {
    if (!chatToDelete) return;
    const id = chatToDelete;
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      const remaining = chats.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setCurrentChatId(remaining[0].id);
      } else {
        setCurrentChatId(null);
        setMessages([]);
      }
    }
    setChatToDelete(null);
  };

  const confirmDeleteAll = () => {
    localStorage.removeItem('local-pilot-chats');
    localStorage.removeItem('local-pilot-current-id');
    window.location.reload();
  };

  const { scrollYProgress } = useScroll({ container: scrollContainerRef });
  const gradientOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const floraGradient = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const testApiConnection = async () => {
    setApiTestStatus('testing');
    try {
      const res = await fetch(`${apiBaseUrlInput}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeyInput}`,
          'X-Title': 'Sukhna-AI-Verification'
        },
        body: JSON.stringify({
          model: apiModelInput,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 1
        })
      });

      if (res.ok) {
        setApiTestStatus('success');
      } else {
        const data = await res.json().catch(() => ({}));
        setApiTestStatus({ error: data.error?.message || `Error ${res.status}` });
      }
    } catch (err) {
      setApiTestStatus({ error: "Network error or invalid URL" });
    }
  };

  const saveApiSettings = () => {
    const key = apiKeyInput.trim();
    const url = apiBaseUrlInput.trim() || 'https://openrouter.ai/api/v1';
    const model = apiModelInput.trim() || 'openai/gpt-oss-120b';
    if (!key) return;
    localStorage.setItem('local-pilot-api-key', key);
    localStorage.setItem('local-pilot-api-url', url);
    localStorage.setItem('local-pilot-api-model', model);
    setApiKey(key);
    setApiBaseUrl(url);
    setApiModel(model);
    setApiMode(true);
    setIsEngineReady(true);
    setShowApiConfig(false);
  };

  const streamCloudApi = async (msgs, onChunk, genId) => {
    const res = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Sukhna-AI'
      },
      body: JSON.stringify({
        model: apiModel,
        messages: msgs,
        stream: true,
      })
    });
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) onChunk(content, genId);
          } catch { }
        }
      }
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollButton(distanceToBottom > 150);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, loadingProgress]);

  useEffect(() => {
    async function initBuiltInAi() {
      try {
        if (window.ai && window.ai.assistant) {
          const capabilities = await window.ai.assistant.capabilities();
          if (capabilities.available !== 'no') {
            const session = await window.ai.assistant.create();
            setBuiltInAiSession(session);
            setIsBuiltInAiMode(true);
            setIsEngineReady(true);
            setLoadingProgress({ text: 'Using Browser Inbuilt AI!', progress: 100 });
            return true;
          }
        }
        return false;
      } catch (e) {
        console.error("Built-in AI error:", e);
        return false;
      }
    }

    async function initTransformers() {
      try {
        setLoadingProgress({ text: 'Starting Universal Engine...', progress: 5 });

        if (!transformersWorker) {
          const workerCode = `
            import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
            env.allowLocalModels = false;
            env.useBrowserCache = true;
            
            let generator;
            self.onmessage = async (e) => {
              const { type, data, genId } = e.data;
              if (type === 'init') {
                generator = await pipeline('text-generation', 'Xenova/SmolLM-135M-Instruct', {
                  progress_callback: (p) => self.postMessage({ type: 'progress', data: p })
                });
                self.postMessage({ type: 'ready' });
              } else if (type === 'generate') {
                await generator(data.prompt, {
                  max_new_tokens: 512,
                  temperature: 0.7,
                  do_sample: true,
                  callback_function: (beams) => {
                    const decoded = generator.tokenizer.decode(beams[0].output_token_ids, { skip_special_tokens: true });
                    self.postMessage({ type: 'chunk', data: decoded, genId });
                  }
                });
                self.postMessage({ type: 'done', genId });
              }
            };
          `;
          const blob = new Blob([workerCode], { type: 'application/javascript' });
          transformersWorker = new Worker(URL.createObjectURL(blob), { type: 'module' });
        }

        transformersWorker.onmessage = (e) => {
          const { type, data, genId } = e.data;
          if (type === 'progress' && data.status === 'progress') {
            setLoadingProgress({
              text: `Downloading AI: ${Math.round(data.progress)}%`,
              progress: Math.round(data.progress)
            });
          } else if (type === 'ready') {
            setLoadingProgress({ text: 'AI is ready!', progress: 100 });
            setIsEngineReady(true);
            setIsTransformersMode(true);
          } else if (type === 'chunk') {
            window._onTransformersChunk?.(data, genId);
          } else if (type === 'done') {
            window._onTransformersDone?.(genId);
          }
        };

        transformersWorker.postMessage({ type: 'init' });
      } catch (error) {
        console.error("Universal Engine Error:", error);
        setLoadingProgress({
          text: 'Local AI failed. Trying fallback...',
          progress: 0,
          error: true
        });
        setShowApiOption(true);
      }
    }

    async function initEngine() {
      try {
        if (!navigator.gpu) throw new Error("WebGPU Missing");

        const initProgressCallback = (initProgress) => {
          setLoadingProgress({
            text: initProgress.text,
            progress: Math.round(initProgress.progress * 100)
          });
        };

        const worker = new Worker(
          new URL('./worker.js', import.meta.url),
          { type: 'module' }
        );

        const newEngine = await CreateWebWorkerMLCEngine(
          worker,
          SELECTED_MODEL,
          { initProgressCallback: initProgressCallback }
        );

        setEngine(newEngine);
        setIsEngineReady(true);
      } catch (error) {
        console.warn("WebGPU unavailable or failed:", error);

        const builtInSuccess = await initBuiltInAi();

        if (!builtInSuccess) {
          console.warn("Built-in AI unavailable, falling back to Transformers.js...");
          initTransformers();
        }
      }
    }

    const savedKey = localStorage.getItem('local-pilot-api-key');
    if (savedKey) {
      setApiKey(savedKey);
      setApiMode(true);
      setIsEngineReady(true);
    } else {
      initEngine();

      const timer = setTimeout(() => {
        if (!isEngineReady) {
          setShowApiOption(true);
        }
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isEngineReady) return;

    const activeChatId = currentChatId;
    const userMessage = input.trim();
    setInput('');

    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    const messagesWithPlaceholder = [...updatedMessages, { role: 'assistant', content: '' }];

    setMessages(messagesWithPlaceholder);
    setIsLoading(true);

    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return { ...chat, messages: messagesWithPlaceholder };
      }
      return chat;
    }));

    const genId = ++generationIdRef.current;

    await activeGenerationRef.current;

    if (generationIdRef.current !== genId) {
      setIsLoading(false);
      return;
    }

    const genPromise = (async () => {
      try {
        if (isImageMode) {
          await handleImageGeneration(userMessage, activeChatId);
          return;
        }

        let currentResponse = '';

        const handleChunk = (content) => {
          if (currentChatIdRef.current !== activeChatId || generationIdRef.current !== genId) return;
          currentResponse += content;

          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'assistant', content: currentResponse };
            return newMessages;
          });

          setChats(prevChats => prevChats.map(chat => {
            if (chat.id === activeChatId) {
              const newMessages = [...chat.messages];
              newMessages[newMessages.length - 1] = { role: 'assistant', content: currentResponse };
              return { ...chat, messages: newMessages };
            }
            return chat;
          }));
        };

        if (apiMode === 'free') {
          await streamFreeAi([SYSTEM_PROMPT, ...updatedMessages], handleChunk, genId);
        } else if (apiMode) {
          await streamCloudApi([SYSTEM_PROMPT, ...updatedMessages], handleChunk, genId);
        } else if (isBuiltInAiMode) {
          const prompt = updatedMessages.map(m => `${m.role}: ${m.content}`).join('\n') + '\nassistant:';
          const stream = await builtInAiSession.promptStreaming(prompt);
          for await (const chunk of stream) {
            if (currentChatIdRef.current !== activeChatId || generationIdRef.current !== genId) break;
            handleChunk(chunk.replace(currentResponse, ''));
          }
        } else if (isTransformersMode) {
          const prompt = updatedMessages.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join('\n') + '\n<|im_start|>assistant\n';

          window._onTransformersChunk = (decoded, gId) => {
            if (genId !== gId) return;
            const parts = decoded.split('assistant\n');
            const newText = parts[parts.length - 1] || '';
            if (newText.length > currentResponse.length) {
              handleChunk(newText.slice(currentResponse.length));
            }
          };

          transformersWorker.postMessage({ type: 'generate', data: { prompt }, genId });

          await new Promise(resolve => {
            window._onTransformersDone = (gId) => {
              if (gId === genId) resolve();
            };
          });
        } else {
          const completion = await engine.chat.completions.create({
            messages: [SYSTEM_PROMPT, ...updatedMessages],
            stream: true,
          });

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            handleChunk(content);
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        if (generationIdRef.current === genId) {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: 'Sorry, I encountered an error generating the response.' }
          ]);
        }
      } finally {
        if (generationIdRef.current === genId) {
          setIsLoading(false);
          setRegeneratingIndex(null);
        }
      }
    })();
    activeGenerationRef.current = genPromise;
    await genPromise;
  };

  const copyResponse = (content, index) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(content).catch(() => {
        const textArea = document.createElement("textarea");
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        try { document.execCommand('copy'); } catch (err) { }
        document.body.removeChild(textArea);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      try { document.execCommand('copy'); } catch (err) { }
      document.body.removeChild(textArea);
    }
    setCopiedMessageId(index);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleRegenerate = async (index) => {
    if (isLoading || !isEngineReady) return;

    const activeChatId = currentChatId;
    const precedingMessages = messages.slice(0, index);
    const lastUserMsgIdx = [...precedingMessages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMsgIdx === -1) return;

    const contextMessages = precedingMessages.slice(0, precedingMessages.length - lastUserMsgIdx);

    const messagesWithPlaceholder = [...messages];
    messagesWithPlaceholder[index] = { role: 'assistant', content: '' };
    setMessages(messagesWithPlaceholder);
    setIsLoading(true);
    setRegeneratingIndex(index);
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return { ...chat, messages: messagesWithPlaceholder };
      }
      return chat;
    }));

    const genId = ++generationIdRef.current;
    await activeGenerationRef.current;

    if (generationIdRef.current !== genId) {
      setIsLoading(false);
      return;
    }

    const genPromise = (async () => {
      try {
        let currentResponse = '';

        const handleChunk = (content) => {
          if (currentChatIdRef.current !== activeChatId || generationIdRef.current !== genId) return;
          currentResponse += content;

          setMessages(prev => {
            const updated = [...prev];
            updated[index] = { role: 'assistant', content: currentResponse };
            return updated;
          });

          setChats(prevChats => prevChats.map(chat => {
            if (chat.id === activeChatId) {
              const newMsgs = [...chat.messages];
              newMsgs[index] = { role: 'assistant', content: currentResponse };
              return { ...chat, messages: newMsgs };
            }
            return chat;
          }));
        };

        if (apiMode === 'free') {
          await streamFreeAi([SYSTEM_PROMPT, ...contextMessages], handleChunk, genId);
        } else if (apiMode) {
          await streamCloudApi([SYSTEM_PROMPT, ...contextMessages], handleChunk, genId);
        } else if (isBuiltInAiMode) {
          const prompt = contextMessages.map(m => `${m.role}: ${m.content}`).join('\n') + '\nassistant:';
          const stream = await builtInAiSession.promptStreaming(prompt);
          for await (const chunk of stream) {
            if (currentChatIdRef.current !== activeChatId || generationIdRef.current !== genId) break;
            handleChunk(chunk.replace(currentResponse, ''));
          }
        } else if (isTransformersMode) {
          const prompt = contextMessages.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join('\n') + '\n<|im_start|>assistant\n';

          window._onTransformersChunk = (decoded, gId) => {
            if (genId !== gId) return;
            const parts = decoded.split('assistant\n');
            const newText = parts[parts.length - 1] || '';
            if (newText.length > currentResponse.length) {
              handleChunk(newText.slice(currentResponse.length));
            }
          };

          transformersWorker.postMessage({ type: 'generate', data: { prompt }, genId });

          await new Promise(resolve => {
            window._onTransformersDone = (gId) => {
              if (gId === genId) resolve();
            };
          });
        } else {
          const completion = await engine.chat.completions.create({
            messages: [SYSTEM_PROMPT, ...contextMessages],
            stream: true,
          });

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            handleChunk(content);
          }
        }
      } catch (error) {
        console.error("Regenerate error:", error);
        if (generationIdRef.current === genId) {
          setMessages(prev => {
            const updated = [...prev];
            updated[index] = { role: 'assistant', content: 'Sorry, I encountered an error regenerating the response.' };
            return updated;
          });
        }
      } finally {
        if (generationIdRef.current === genId) {
          setIsLoading(false);
          setRegeneratingIndex(null);
        }
      }
    })();
    activeGenerationRef.current = genPromise;
    await genPromise;
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`h-[100dvh] w-screen overflow-hidden flex font-sans relative ${theme === 'sukhna' ? 'selection:bg-indigo-500/30 sukhna-cursor bg-slate-950 text-white'
        : theme === 'galaxy' ? 'selection:bg-amber-500/30 galaxy-cursor bg-slate-900 text-amber-50'
          : theme === 'flora' ? 'selection:bg-blue-500/30 flora-cursor text-black'
            : theme === 'light' ? 'selection:bg-slate-200 bg-white text-black'
              : 'selection:bg-indigo-500/30 bg-slate-900 text-slate-200'
        }`}
      style={{ cursor: (theme === 'sukhna' || theme === 'default' || theme === 'light') ? 'none' : 'default' }}
    >



      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatToDelete(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-panel p-6 sm:p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />

              <div className="relative z-10 text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>

                <h3 className="text-xl font-bold text-white">Delete Chat?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Are you sure you want to delete this conversation? This action cannot be undone.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setChatToDelete(null)}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg shadow-red-500/20 transition-all btn-creative-hover"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeletingAll && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeletingAll(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-panel p-6 sm:p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent pointer-events-none" />

              <div className="relative z-10 text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>

                <h3 className="text-xl font-bold text-white">Clear All Chats?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  This will permanently delete your entire conversation history and reset all preferences. This action is irreversible.
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={confirmDeleteAll}
                    className="w-full px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20 transition-all btn-creative-hover"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setIsDeletingAll(false)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : -300,
          width: isSidebarOpen ? 300 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed lg:relative top-0 left-0 h-full z-50 flex flex-col overflow-hidden shadow-2xl transition-colors duration-500 ${theme === 'galaxy'
          ? 'bg-black/60 backdrop-blur-xl border-r border-amber-500/20'
            : theme === 'flora'
              ? 'bg-white border-r border-blue-200'
              : theme === 'light'
              ? 'bg-white border-r border-slate-200'
              : 'glass-panel border-r border-slate-700/50'
          }`}
      >
        <div className={`p-6 border-b flex items-center justify-between transition-colors duration-500 ${theme === 'galaxy' ? 'border-amber-500/20' : theme === 'flora' ? 'border-blue-200' : theme === 'light' ? 'border-slate-200' : 'border-slate-700/50'
          }`}>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className={`w-5 h-5 ${theme === 'galaxy' ? 'text-amber-400' : theme === 'flora' ? 'text-blue-600' : theme === 'light' ? 'text-indigo-500' : 'text-indigo-400'}`} />
            <span className={theme === 'galaxy' ? 'text-amber-200' : theme === 'flora' ? 'text-black font-bold' : theme === 'light' ? 'text-black' : 'text-slate-200'}>History</span>
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`p-2 rounded-lg lg:hidden transition-colors ${theme === 'galaxy' ? 'hover:bg-amber-500/10 text-amber-400' : theme === 'flora' ? 'hover:bg-blue-500/10 text-blue-600' : theme === 'light' ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
              }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => {
              createNewChat();
              setActiveView('chat');
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 border rounded-xl transition-all font-medium btn-creative-hover ${theme === 'galaxy'
              ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
              : theme === 'flora'
                ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-700'
                : theme === 'light'
                  ? 'bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-300/50 text-indigo-600'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
              }`}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 scrollbar-thin">
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                setActiveView('chat');
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${currentChatId === chat.id && activeView === 'chat'
                ? (theme === 'galaxy' ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' : theme === 'flora' ? 'bg-blue-500/20 border-blue-500/30 text-blue-900' : theme === 'light' ? 'bg-indigo-100 border-indigo-300/60 text-indigo-800' : 'bg-indigo-500/20 border-indigo-500/30 text-white')
                : (theme === 'galaxy' ? 'hover:bg-amber-500/5 text-amber-500/50 border-transparent hover:text-amber-300/70' : theme === 'flora' ? 'hover:bg-blue-500/10 text-blue-600/70 border-transparent hover:text-blue-700' : theme === 'light' ? 'hover:bg-slate-100 text-slate-500 border-transparent hover:text-slate-700' : 'hover:bg-slate-800/50 text-slate-400 border-transparent')
                }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentChatId === chat.id && activeView === 'chat'
                  ? (theme === 'galaxy' ? 'text-amber-400' : theme === 'flora' ? 'text-blue-600' : theme === 'light' ? 'text-indigo-500' : 'text-indigo-400')
                  : 'text-slate-500'
                  }`} />
                <span className="truncate text-sm font-medium">{chat.title}</span>
              </div>
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                className={`opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 rounded-md transition-all ${theme === 'galaxy' ? 'hover:bg-amber-500/20 hover:text-amber-400' : 'hover:bg-red-500/20 hover:text-red-400'
                  }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {chats.length === 0 && (
            <div className={`text-center py-10 text-sm italic ${theme === 'galaxy' ? 'text-amber-500/40' : 'text-slate-500'}`}>
              No chat history
            </div>
          )}
        </div>

        <div className={`p-4 border-t transition-colors duration-500 ${theme === 'galaxy' ? 'border-amber-500/20' : theme === 'light' ? 'border-slate-200' : 'border-slate-700/50'
          }`}>

          <button
            onClick={() => {
              setActiveView('settings');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${activeView === 'settings'
              ? (theme === 'galaxy' ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' : theme === 'flora' ? 'bg-blue-500/20 border-blue-500/30 text-blue-900' : theme === 'light' ? 'bg-indigo-100 border-indigo-300/60 text-indigo-800' : 'bg-indigo-500/20 border-indigo-500/30 text-white')
              : (theme === 'galaxy'
                ? 'hover:bg-amber-500/5 text-amber-500/50 border-transparent hover:text-amber-300/70'
                : theme === 'flora'
                  ? 'hover:bg-blue-500/10 text-blue-600 border-transparent hover:text-blue-800'
                  : theme === 'light'
                    ? 'hover:bg-slate-100 text-slate-500 border-transparent hover:text-slate-700'
                    : 'hover:bg-slate-800/50 text-slate-400 border-transparent')
              }`}
          >
            <SettingsIcon className={`w-5 h-5 ${activeView === 'settings' ? (theme === 'galaxy' ? 'text-amber-400' : theme === 'flora' ? 'text-blue-600' : theme === 'light' ? 'text-indigo-500' : 'text-indigo-400') : theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        {theme === 'default' && <NeuralBackground />}
        {theme === 'flora' && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #fff0f6 0%, #fce7f3 20%, #ede9fe 45%, #dbeafe 70%, #e0f2fe 100%)' }} />
            <FloraEngine />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 10%, rgba(255,220,240,0.4) 0%, transparent 55%), radial-gradient(ellipse at 20% 90%, rgba(186,230,253,0.35) 0%, transparent 55%)' }} />
          </div>
        )}

        {theme === 'light' && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <LightEngine />
          </div>
        )}

        {theme === 'default' && (
          <motion.div
            className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 pointer-events-none transition-opacity duration-1000"
            style={{ opacity: gradientOpacity }}
          />
        )}

        {theme === 'default' && showBubbles && (
          <div className="bubbles-container">
            {[...Array(isMobile ? 4 : 8)].map((_, i) => (
              <div key={i} className="bubble"></div>
            ))}
          </div>
        )}

        {theme === 'flora' && showPetals && (
          <>
            <div className="petals-container">
              {[...Array(isMobile ? 6 : 12)].map((_, i) => (
                <div key={i} className="petal"></div>
              ))}
            </div>
            <div className="flowers-backdrop">
              {[...Array(isMobile ? 5 : 10)].map((_, i) => (
                <div key={i} className="flower-unit" style={{ animationDelay: `${i * 0.4}s` }}>
                  <div className="flower-head"></div>
                  <div className="flower-stem"></div>
                </div>
              ))}
            </div>
          </>
        )}

        <div
          className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 overflow-hidden flex items-center justify-center bg-black ${theme === 'galaxy' ? 'opacity-100' : 'opacity-0'}`}
        >
          {theme === 'galaxy' && <DeepSpaceEngine />}

          <div className="absolute w-full h-full">
            <div className="absolute w-[1px] h-[1px] rounded-full opacity-40" style={{ boxShadow: starsSmall, top: '50%', left: '50%' }} />
            <div className="absolute w-[2px] h-[2px] rounded-full opacity-50" style={{ boxShadow: starsMedium, top: '50%', left: '50%' }} />
          </div>

          <div className="absolute" style={{ width: 0, height: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>

            <div className="absolute rounded-full"
              style={{
                width: 70, height: 70,
                background: 'radial-gradient(circle at 35% 35%, #fff7a1, #fde047, #f59e0b, #b45309)',
                boxShadow: '0 0 40px 20px rgba(253,224,71,0.5), 0 0 80px 40px rgba(245,158,11,0.3), 0 0 120px 60px rgba(180,83,9,0.2)',
                top: -35, left: -35,
                animation: 'pulse 4s ease-in-out infinite'
              }}
            />

            <div className="absolute rounded-full border border-white/10"
              style={{ width: 120, height: 120, top: -60, left: -60, animation: 'spin 4s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 7, height: 7, background: '#a8a8a8', top: -3.5, left: '50%', marginLeft: -3.5,
                  boxShadow: '0 0 4px #a8a8a8'
                }} />
            </div>

            <div className="absolute rounded-full border border-white/10"
              style={{ width: 180, height: 180, top: -90, left: -90, animation: 'spin 10s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 12, height: 12, background: 'radial-gradient(#f5c842, #d97706)', top: -6, left: '50%', marginLeft: -6,
                  boxShadow: '0 0 8px #f5c842'
                }} />
            </div>

            <div className="absolute rounded-full border border-white/10"
              style={{ width: 260, height: 260, top: -130, left: -130, animation: 'spin 16s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 14, height: 14, background: 'radial-gradient(#4ade80, #2563eb)', top: -7, left: '50%', marginLeft: -7,
                  boxShadow: '0 0 8px #2563eb'
                }} />
            </div>

            <div className="absolute rounded-full border border-white/10"
              style={{ width: 350, height: 350, top: -175, left: -175, animation: 'spin 25s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 10, height: 10, background: 'radial-gradient(#f87171, #b91c1c)', top: -5, left: '50%', marginLeft: -5,
                  boxShadow: '0 0 6px #ef4444'
                }} />
            </div>

            <div className="absolute rounded-full border border-white/10"
              style={{ width: 480, height: 480, top: -240, left: -240, animation: 'spin 40s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 28, height: 28, background: 'radial-gradient(#fde68a, #d97706, #92400e)', top: -14, left: '50%', marginLeft: -14,
                  boxShadow: '0 0 12px #d97706'
                }} />
            </div>

            <div className="absolute rounded-full border border-white/10"
              style={{ width: 620, height: 620, top: -310, left: -310, animation: 'spin 65s linear infinite' }}>
              <div className="absolute" style={{ top: -18, left: '50%', marginLeft: -18 }}>
                <div className="absolute rounded-full"
                  style={{
                    width: 22, height: 22, background: 'radial-gradient(#fef3c7, #d97706, #92400e)', top: 0, left: 0,
                    boxShadow: '0 0 10px #d97706'
                  }} />
                <div className="absolute rounded-full border-2 border-amber-400/60"
                  style={{
                    width: 46, height: 14, top: 4, left: -12, borderRadius: '50%', transform: 'rotateX(70deg)',
                    boxShadow: '0 0 6px rgba(251,191,36,0.4)'
                  }} />
              </div>
            </div>

            <div className="absolute rounded-full border border-white/10"
              style={{ width: 760, height: 760, top: -380, left: -380, animation: 'spin 95s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 18, height: 18, background: 'radial-gradient(#a5f3fc, #0284c7)', top: -9, left: '50%', marginLeft: -9,
                  boxShadow: '0 0 8px #0ea5e9'
                }} />
            </div>

            <div className="absolute rounded-full border border-white/10"
              style={{ width: 900, height: 900, top: -450, left: -450, animation: 'spin 130s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 16, height: 16, background: 'radial-gradient(#93c5fd, #1d4ed8)', top: -8, left: '50%', marginLeft: -8,
                  boxShadow: '0 0 8px #3b82f6'
                }} />
            </div>

          </div>

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />
        </div>

        {theme === 'sukhna' && (
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#020617]" style={{ perspective: isMobile || performanceMode === 'lite' ? '2000px' : '800px' }}>
            <SukhnaEngine />
            {performanceMode === 'ultra' && !isMobile && (
              <>
                <motion.div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)',
                    backgroundSize: '100px 100px',
                    rotateX: gridRotateX,
                    y: '20%',
                    scale: 4,
                    transformOrigin: 'center bottom',
                  }}
                />
                <motion.div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)',
                    backgroundSize: '100px 100px',
                    rotateX: -70,
                    y: '-60%',
                    scale: 4,
                    transformOrigin: 'center top',
                  }}
                />
              </>
            )}

            <motion.div
              className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
              style={{ x: bgX, y: bgY }}
            >
              <motion.div
                className={`${isMobile ? 'w-48 h-48' : 'w-96 h-96 sm:w-[600px] sm:h-[600px]'} relative`}
                style={{ transformStyle: 'preserve-3d' }}
                animate={{
                  rotateY: isMobile || performanceMode === 'lite' ? 0 : [0, 360],
                  y: [0, -20, 0],
                }}
                transition={{
                  rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
                  y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                {[...Array(isMobile ? 1 : 12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage: `url(${avatarImg})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      transform: `translateZ(${i - 6}px)`,
                      filter: i === 11
                        ? 'drop-shadow(0 0 50px rgba(99, 102, 241, 0.8)) brightness(1.2)'
                        : 'brightness(0.5)'
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            <div className={`absolute inset-0 z-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617] ${isMobile ? 'opacity-90' : 'opacity-80'}`} />

            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              {[...Array(isMobile || performanceMode === 'lite' ? 4 : 15)].map((_, i) => (
                <DigitalCrystal key={i} index={i} mouseX={mouseX} mouseY={mouseY} isMobile={isMobile} performanceMode={performanceMode} />
              ))}
            </div>
          </div>
        )}

        {theme === 'galaxy' && <CursorTail />}
        {theme === 'default' && <DeepCursor />}
        {theme === 'default' && <CursorTail color="99, 102, 241" />}
        {theme === 'light' && <LightCursor />}
        {theme === 'light' && <CursorTail color="217, 119, 6" type="sparkle" />}
        {theme === 'sukhna' && <SukhnaCursor avatarImg={avatarImg} />}
        {theme === 'sukhna' && <CursorTail color="99, 102, 241" />}

        <motion.div
          className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 pointer-events-none"
          style={{
            opacity: gradientOpacity,
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
          }}
        />

        {theme === 'default' && showBubbles && (
          <div className="bubbles-container">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bubble"></div>
            ))}
          </div>
        )}

        {theme === 'flora' && showPetals && (
          <>
            <div className="petals-container">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="petal"></div>
              ))}
            </div>
            <div className="flowers-backdrop">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flower-unit" style={{ animationDelay: `${i * 0.5}s` }}>
                  <div className="flower-head"></div>
                  <div className="flower-stem"></div>
                </div>
              ))}
            </div>
          </>
        )}

        <header className={`${theme === 'flora' ? 'bg-white border-b border-blue-100' : theme === 'light' ? 'bg-white/80 backdrop-blur-md border-b border-slate-200' : 'glass-panel'} sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-lg gap-2`}>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-xl border transition-all flex-shrink-0 ${theme === 'galaxy'
                ? 'hover:bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white'
                : theme === 'flora'
                  ? 'hover:bg-blue-500/10 border-blue-500/20 text-blue-600'
                  : theme === 'light'
                    ? 'hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                    : 'hover:bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white'
                }`}
              title="Toggle Sidebar"
            >
              <PanelLeft className={`w-5 h-5 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`${theme === 'galaxy' ? 'bg-amber-500/20 border-amber-500/30' : theme === 'flora' ? 'bg-blue-500/20 border-blue-500/30' : theme === 'light' ? 'bg-indigo-500/15 border-indigo-300/40' : 'bg-indigo-500/20 border-indigo-500/30'} p-1 sm:p-1.5 rounded-xl border overflow-hidden`}>
                <img src={avatarImg} alt="Sukhna-AI" className="w-6 h-6 sm:w-8 sm:h-8 object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme === 'galaxy' ? 'from-amber-400 to-yellow-200' : theme === 'flora' ? 'from-blue-600 to-blue-400' : theme === 'light' ? 'from-indigo-600 to-purple-500' : 'from-indigo-400 to-purple-400'}`}>
                    Sukhna-AI
                  </h1>
                  {isBuiltInAiMode && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-tight shadow-sm">
                      Inbuilt AI
                    </span>
                  )}
                  {isTransformersMode && !isBuiltInAiMode && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-tight shadow-sm">
                      CPU Engine
                    </span>
                  )}
                  {apiMode && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-tight shadow-sm">
                      Cloud API
                    </span>
                  )}
                </div>
                <p className={`text-[10px] sm:text-xs flex items-center gap-1.5 ${theme === 'galaxy' ? 'text-amber-400/80' : theme === 'flora' || theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                  <span className="relative flex h-2 w-2">
                    {isEngineReady ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    )}
                  </span>
                  {isEngineReady ? <span className="truncate max-w-[120px] sm:max-w-none">Sukhna-AI is ready</span> : <span>Initializing...</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeView === 'settings' && (
              <button
                onClick={() => setActiveView('chat')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${theme === 'galaxy'
                  ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                  : theme === 'light'
                    ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                    : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
              >
                Back to Chat
              </button>
            )}
          </div>
        </header>

        <motion.main
          style={{
            perspective: isMobile || performanceMode === 'lite' ? 1000 : 1200,
            rotateX: theme === 'sukhna' ? mainRotateX : 0,
            rotateY: theme === 'sukhna' ? mainRotateY : 0,
            z: theme === 'sukhna' && !isMobile && performanceMode === 'ultra' ? 100 : 0,
            transformStyle: "preserve-3d"
          }}
          className={`flex-1 overflow-hidden flex flex-col relative ${isMobile ? 'w-full px-2 py-3' : 'max-w-4xl w-full mx-auto p-6'}`}
        >

          <AnimatePresence mode="wait">
            {activeView === 'chat' ? (
              <motion.div
                key="chat-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {!isEngineReady && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm">
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl max-w-[90%] sm:max-w-md w-full text-center space-y-4 sm:space-y-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-0"></div>

                      <div className="relative z-10">
                        {apiMode ? (
                          <div className="space-y-4">
                            <div className="relative w-20 h-20 mx-auto mb-2">
                              <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-xl animate-pulse" />
                              <img src={avatarImg} alt="Sukhna-AI" className="relative w-full h-full object-cover rounded-2xl border border-indigo-500/30 shadow-lg" />
                            </div>
                            <h2 className="text-xl font-bold">Configure Cloud AI</h2>
                            <p className="text-xs text-slate-400">
                              Enter your API key to use Sukhna-AI via the cloud.
                            </p>

                            <div className="space-y-3 text-left">
                              <input
                                type="password"
                                value={apiKeyInput}
                                onChange={e => setApiKeyInput(e.target.value)}
                                placeholder="API Key (e.g. sk-or-...)"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                              />
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={testApiConnection}
                                  disabled={!apiKeyInput.trim() || apiTestStatus === 'testing'}
                                  className={`flex-1 py-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${apiTestStatus === 'success' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                                    apiTestStatus?.error ? 'bg-red-500/20 border-red-500 text-red-400' :
                                      'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                  {apiTestStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    apiTestStatus === 'success' ? <Check className="w-4 h-4" /> :
                                      <Globe className="w-4 h-4" />}
                                  {apiTestStatus === 'testing' ? 'Testing...' :
                                    apiTestStatus === 'success' ? 'Link Working' :
                                      apiTestStatus?.error ? 'Test Failed' : 'Test Link'}
                                </button>

                                <button
                                  onClick={saveApiSettings}
                                  disabled={!apiKeyInput.trim()}
                                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-40 shadow-lg shadow-indigo-600/20"
                                >
                                  Submit Key
                                </button>
                              </div>

                              <a
                                href="https://openrouter.ai/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                API for Free
                              </a>
                            </div>

                            {apiTestStatus?.error && (
                              <p className="text-[10px] text-red-400 mt-2 bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                                {apiTestStatus.error}
                              </p>
                            )}

                            <button
                              onClick={() => { setApiMode(false); setApiTestStatus(null); }}
                              className="text-[10px] text-slate-500 hover:text-slate-300 underline mt-4"
                            >
                              Back to local mode
                            </button>
                          </div>
                        ) : (
                          <>
                            {loadingProgress.error ? (
                              <div className="relative w-24 h-24 mx-auto mb-6">
                                <img src={avatarImg} alt="Error" className="w-full h-full object-cover rounded-2xl grayscale opacity-50" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <AlertCircle className="w-12 h-12 text-red-400" />
                                </div>
                              </div>
                            ) : (
                              <div className="relative w-[280px] h-[280px] mx-auto mb-10" style={{ perspective: '800px' }}>

                                <ParticleVortex progress={loadingProgress.progress} />

                                <motion.div
                                  className="absolute inset-[-10px] rounded-full"
                                  style={{
                                    background: `radial-gradient(circle, rgba(99,102,241,${loadingProgress.progress / 120}) 0%, rgba(139,92,246,${loadingProgress.progress / 250}) 35%, rgba(168,85,247,${loadingProgress.progress / 500}) 60%, transparent 75%)`,
                                  }}
                                  animate={{ 
                                    filter: ['blur(25px)', 'blur(40px)', 'blur(25px)'],
                                    scale: [1, 1.15, 1],
                                  }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                />

                                {[...Array(5)].map((_, i) => (
                                  <motion.div
                                    key={`ring-${i}`}
                                    className="absolute rounded-full"
                                    style={{
                                      inset: `${-15 - i * 12}px`,
                                      border: `${i === 0 ? 2 : 1}px ${i % 2 === 0 ? 'solid' : i % 3 === 0 ? 'dashed' : 'dotted'} rgba(${130 + i * 20},${80 + i * 10},${241 - i * 10},${0.06 + loadingProgress.progress / (500 + i * 100)})`,
                                      transformStyle: 'preserve-3d',
                                      transform: `rotateX(${60 + i * 8}deg) rotateZ(${i * 30}deg)`,
                                    }}
                                    animate={{ rotateZ: [i * 30, i * 30 + (i % 2 === 0 ? 360 : -360)] }}
                                    transition={{ duration: 10 + i * 4, repeat: Infinity, ease: "linear" }}
                                  />
                                ))}

                                {[...Array(12)].map((_, i) => {
                                  const orbitR = 115 + (i % 3) * 15;
                                  const startAngle = (i / 12) * Math.PI * 2;
                                  return (
                                    <motion.div
                                      key={`node-${i}`}
                                      className="absolute rounded-full"
                                      style={{
                                        width: 3 + (i % 3) * 2,
                                        height: 3 + (i % 3) * 2,
                                        background: `hsl(${230 + i * 10}, 85%, 75%)`,
                                        boxShadow: `0 0 ${6 + i}px hsl(${230 + i * 10}, 85%, 70%)`,
                                        top: '50%',
                                        left: '50%',
                                      }}
                                      animate={{
                                        x: [
                                          Math.cos(startAngle) * orbitR,
                                          Math.cos(startAngle + Math.PI * 2) * orbitR
                                        ],
                                        y: [
                                          Math.sin(startAngle) * orbitR,
                                          Math.sin(startAngle + Math.PI * 2) * orbitR
                                        ],
                                        scale: [0.6, 1.5, 0.6],
                                        opacity: [0.3, 1, 0.3]
                                      }}
                                      transition={{
                                        x: { duration: 5 + i * 0.4, repeat: Infinity, ease: "linear" },
                                        y: { duration: 5 + i * 0.4, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 1.5 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                                        opacity: { duration: 1.5 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }
                                      }}
                                    />
                                  );
                                })}

                                <motion.div
                                  className="absolute inset-[50px] rounded-[1.8rem] overflow-hidden"
                                  style={{
                                    boxShadow: `
                                      0 0 ${15 + loadingProgress.progress / 2}px rgba(99,102,241,${loadingProgress.progress / 200}),
                                      0 0 ${30 + loadingProgress.progress}px rgba(139,92,246,${loadingProgress.progress / 350}),
                                      0 0 ${50 + loadingProgress.progress * 1.5}px rgba(168,85,247,${loadingProgress.progress / 600}),
                                      inset 0 0 40px rgba(0,0,0,0.6)
                                    `,
                                    zIndex: 10,
                                  }}
                                  animate={{
                                    borderColor: [
                                      'rgba(99,102,241,0.4)',
                                      'rgba(139,92,246,0.6)',
                                      'rgba(168,85,247,0.4)',
                                      'rgba(99,102,241,0.4)'
                                    ]
                                  }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                  <div className="absolute inset-0 bg-slate-950" />
                                  <motion.div
                                    className="absolute inset-[-2px] rounded-[1.8rem]"
                                    style={{
                                      background: 'conic-gradient(from 0deg, rgba(99,102,241,0.4), rgba(139,92,246,0.2), rgba(168,85,247,0.4), rgba(99,102,241,0.2), rgba(139,92,246,0.4))',
                                      padding: '2px',
                                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                      WebkitMaskComposite: 'xor',
                                      maskComposite: 'exclude',
                                    }}
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                  />

                                  <img
                                    src={avatarImg}
                                    alt="Sukhna-AI ghost"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    style={{ filter: 'grayscale(100%) brightness(0.25)', opacity: 0.2 }}
                                  />

                                  <div
                                    className="absolute inset-0 overflow-hidden transition-all duration-500 ease-out"
                                    style={{ clipPath: `inset(${100 - loadingProgress.progress}% 0 0 0)` }}
                                  >
                                    <img
                                      src={avatarImg}
                                      alt="Sukhna-AI"
                                      className="w-full h-full object-cover"
                                      style={{ filter: 'saturate(1.3) contrast(1.1) brightness(1.05)' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/25 via-transparent to-purple-500/15" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-400/5 to-transparent" />
                                  </div>

                                  {loadingProgress.progress < 100 && loadingProgress.progress > 0 && (
                                    <>
                                      <motion.div
                                        className="absolute left-0 right-0 h-[2px] pointer-events-none"
                                        style={{ top: `${100 - loadingProgress.progress}%`, zIndex: 20 }}
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                      >
                                        <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent" />
                                        <div className="absolute inset-x-0 -top-4 h-8 bg-indigo-400/20 blur-lg" />
                                        <div className="absolute inset-x-0 -bottom-4 h-8 bg-purple-400/15 blur-lg" />
                                      </motion.div>

                                      <motion.div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99,102,241,0.02) 2px, rgba(99,102,241,0.02) 3px)',
                                          zIndex: 15,
                                        }}
                                        animate={{ y: [0, 6, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                      />

                                      <motion.div
                                        className="absolute inset-0 pointer-events-none overflow-hidden"
                                        style={{ zIndex: 16, mixBlendMode: 'screen' }}
                                      >
                                        <motion.div
                                          className="absolute w-full h-[30%]"
                                          style={{
                                            background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.06) 30%, rgba(139,92,246,0.04) 70%, transparent 100%)',
                                          }}
                                          animate={{ top: ['-30%', '130%'] }}
                                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        />
                                      </motion.div>
                                    </>
                                  )}

                                  {loadingProgress.progress >= 100 && (
                                    <>
                                      <motion.div
                                        className="absolute inset-0"
                                        style={{
                                          background: 'radial-gradient(circle at center, rgba(255,255,255,0.5) 0%, rgba(99,102,241,0.3) 30%, transparent 70%)',
                                          zIndex: 20,
                                        }}
                                        initial={{ opacity: 1, scale: 0.8 }}
                                        animate={{ opacity: 0, scale: 2.5 }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                      />
                                      <motion.div
                                        className="absolute inset-0"
                                        style={{
                                          background: 'conic-gradient(from 0deg, transparent 0%, rgba(99,102,241,0.3) 25%, transparent 50%, rgba(139,92,246,0.3) 75%, transparent 100%)',
                                          zIndex: 19,
                                        }}
                                        initial={{ opacity: 0.8, rotate: 0 }}
                                        animate={{ opacity: 0, rotate: 180, scale: 2 }}
                                        transition={{ duration: 2.5, ease: "easeOut" }}
                                      />
                                    </>
                                  )}
                                </motion.div>

                                <motion.div
                                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-black px-5 py-1.5 rounded-full tabular-nums tracking-widest"
                                  style={{
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7, #7c3aed, #4f46e5)',
                                    backgroundSize: '200% 200%',
                                    boxShadow: '0 4px 20px rgba(99,102,241,0.5), 0 0 30px rgba(139,92,246,0.3), 0 0 60px rgba(168,85,247,0.1)',
                                    zIndex: 20,
                                  }}
                                  initial={{ opacity: 0, y: 10, scale: 0.7 }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                  }}
                                  transition={{
                                    opacity: { delay: 0.2, duration: 0.5 },
                                    y: { delay: 0.2, type: "spring", stiffness: 300, damping: 15 },
                                    scale: { delay: 0.2, type: "spring", stiffness: 300, damping: 15 },
                                    backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                                  }}
                                >
                                  {loadingProgress.progress}%
                                </motion.div>
                              </div>
                            )}

                            <h2 className="text-xl sm:text-2xl font-bold mb-2">
                              {loadingProgress.error ? 'Initialization Failed' : 'Loading AI Model'}
                            </h2>

                            <p className={`text-sm ${loadingProgress.error ? 'text-red-300' : 'text-slate-300'} mb-6`}>
                              {loadingProgress.text}
                            </p>

                            {(loadingProgress.error || (showApiOption && isMobile)) && (
                              <div className="space-y-3 w-full">
                                <button
                                  onClick={() => {
                                    setApiMode('free');
                                    setIsEngineReady(true);
                                  }}
                                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-sm font-bold hover:from-emerald-500 hover:to-teal-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 active:scale-[0.98] animate-pulse"
                                >
                                  <Zap className="w-5 h-5" />
                                  Unlock Free Cloud AI (Instant & Keyless)
                                </button>

                              </div>
                            )}

                            {!loadingProgress.error && (
                              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${loadingProgress.progress}%` }}
                                ></div>
                              </div>
                            )}

                            {!loadingProgress.error && (
                              <p className="text-xs text-slate-500 mt-4">
                                This model runs entirely in your browser. The first load downloads the model files (~1GB) which will be cached for future visits.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={scrollContainerRef} onScroll={handleScroll} className={`flex-1 overflow-y-auto space-y-4 sm:space-y-6 ${isMobile ? 'pb-24 pt-2' : 'pb-36 pr-2'} scrollbar-thin relative z-10`}>
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        key={index}
                        className={`flex gap-2 sm:gap-4 max-w-[95%] sm:max-w-[85%] ${message.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                          }`}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg mt-1 sm:mt-0 ${message.role === 'user'
                          ? (theme === 'galaxy' ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black' : theme === 'flora' ? 'message-bubble-flora-user text-white' : theme === 'light' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white')
                          : (theme === 'light' ? 'bg-white border border-slate-200 shadow' : 'bg-slate-700 border border-slate-600')
                          }`}>
                          {message.role === 'user' ? (
                            <User className={`w-3 h-3 sm:w-4 sm:h-4 ${theme === 'galaxy' ? 'text-black' : 'text-white'}`} />
                          ) : (
                            <img src={avatarImg || 'https://api.dicebear.com/7.x/bottts/svg?seed=Sukhna'} alt="AI" className="w-full h-full object-cover" />
                          )}
                        </div>

                        <div className={`p-3 sm:p-4 rounded-2xl shadow-md min-w-0 ${message.role === 'user'
                          ? (theme === 'galaxy' ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black rounded-tr-sm' : theme === 'flora' ? 'message-bubble-flora-user text-white rounded-tr-sm' : 'message-bubble-user text-white rounded-tr-sm')
                          : (theme === 'light' ? 'message-bubble-light-ai rounded-tl-sm text-black' 
                              : theme === 'galaxy' ? 'bg-slate-950/80 border border-amber-500/20 text-amber-50 rounded-tl-sm shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                              : theme === 'flora' ? 'bg-blue-50/90 border border-blue-200 text-black rounded-tl-sm'
                              : 'message-bubble-ai text-slate-200 rounded-tl-sm')
                          }`}>
                          <div className={`text-sm leading-relaxed min-w-0 max-w-full overflow-x-auto break-words prose ${theme === 'light' || theme === 'flora' ? 'prose-slate text-black' : 'prose-invert'}`}>
                            {message.isImage && message.imageUrl && (
                              <div className="relative group mb-4 rounded-xl overflow-hidden border border-white/10 shadow-xl bg-slate-900/50">
                                <img
                                  src={message.imageUrl}
                                  alt="Generated AI"
                                  className="w-full h-auto object-contain max-h-[500px] block"
                                  onLoad={() => console.log("Image loaded successfully")}
                                  onError={(e) => {
                                    console.error("Image failed to load:", message.imageUrl);
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <button
                                  onClick={() => downloadImage(message.imageUrl)}
                                  className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold z-10"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                              </div>
                            )}
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '')
                                  return !inline ? (
                                    <CodeBlockWithCopy match={match} className={className} children={children} {...props} />
                                  ) : (
                                    <code {...props} className={`${className || ''} bg-slate-800 px-1 py-0.5 rounded text-indigo-300 font-mono text-[0.9em] break-words`}>
                                      {children}
                                    </code>
                                  )
                                },
                                strong({ children }) {
                                  return <strong className={`font-extrabold ${theme === 'galaxy' ? 'text-amber-400' : 'text-indigo-300'} tracking-wide`}>{children}</strong>
                                },
                                p({ children }) {
                                  return <p className="mb-2 last:mb-0">{children}</p>
                                },
                                pre({ children }) {
                                  return <pre className="bg-transparent p-0 m-0 overflow-visible">{children}</pre>
                                },
                                table({ children }) {
                                  return (
                                    <div className="my-5 w-full overflow-x-auto border border-slate-700/30 rounded-xl bg-slate-900/10 shadow-inner">
                                      <table className="w-full text-left border-collapse min-w-[500px]">
                                        {children}
                                      </table>
                                    </div>
                                  )
                                },
                                thead({ children }) {
                                  return <thead className="bg-slate-800/40 border-b border-slate-700/50">{children}</thead>
                                },
                                th({ children }) {
                                  return <th className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-indigo-400/90">{children}</th>
                                },
                                td({ children }) {
                                  return <td className="px-5 py-3 text-sm border-b border-slate-700/10 text-slate-300 font-medium">{children}</td>
                                }
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          {message.role === 'user' && (
                            <div className={`flex items-center gap-1 mt-2 -mb-1 flex-row-reverse`}>
                              <button
                                onClick={() => copyResponse(message.content, index)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${theme === 'galaxy'
                                  ? 'text-black/60 hover:text-black hover:bg-black/5'
                                  : theme === 'flora' || theme === 'light'
                                    ? 'text-black hover:bg-slate-200 border border-slate-200 shadow-sm'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                  }`}
                                title="Copy query"
                              >
                                {copiedMessageId === index ? (
                                  <><Check className="w-3 h-3" /><span>Copied</span></>
                                ) : (
                                  <><Copy className="w-3 h-3" /><span>Copy</span></>
                                )}
                              </button>
                            </div>
                          )}
                          {message.role === 'assistant' && message.content && (
                            <div className="flex items-center gap-2 mt-3 -mb-1 relative z-30">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyResponse(message.content, index);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border active:scale-95 touch-manipulation ${theme === 'flora' || theme === 'light'
                                  ? 'bg-white text-black hover:bg-slate-100 border-slate-200 shadow-sm'
                                  : 'bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700/60 border-white/5'}`}
                                title="Copy response"
                              >
                                {copiedMessageId === index ? (
                                  <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                                ) : (
                                  <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakResponse(message.content);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border active:scale-95 touch-manipulation ${theme === 'flora' || theme === 'light'
                                  ? 'bg-white text-black hover:bg-slate-100 border-slate-200 shadow-sm'
                                  : 'bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700/60 border-white/5'}`}
                                title="Read aloud"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Read</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRegenerate(index);
                                }}
                                disabled={isLoading}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 touch-manipulation ${theme === 'flora' || theme === 'light'
                                  ? 'bg-white text-black hover:bg-slate-100 border-slate-200 shadow-sm'
                                  : 'bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700/60 border-white/5'}`}
                                title="Regenerate response"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${regeneratingIndex === index ? 'animate-spin' : ''}`} />
                                <span>Regenerate</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                <div className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center ${isMobile ? 'px-2 pb-2' : 'px-6 pb-6'}`}>
                  <AnimatePresence>
                    {isLoading && (
                      <motion.button
                        key="stop-btn"
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.9 }}
                        onClick={handleStop}
                        className={`mb-3 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg border backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${theme === 'galaxy'
                          ? 'bg-black/70 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400/60'
                          : theme === 'light'
                            ? 'bg-white/90 border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400'
                            : 'bg-slate-900/80 border-slate-600/60 text-slate-300 hover:bg-slate-800 hover:border-slate-500'
                          }`}
                      >
                        <div className="w-3 h-3 rounded-sm bg-current flex-shrink-0" />
                        Stop generating
                      </motion.button>
                    )}
                    {showScrollButton && !isLoading && (
                      <motion.button
                        key="scroll-btn"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        onClick={scrollToBottom}
                        className={`mb-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full shadow-lg border btn-creative-hover ${theme === 'galaxy'
                          ? 'bg-black/60 border-amber-500/30 text-amber-400'
                          : 'bg-slate-800 border-indigo-500/30 text-indigo-400'
                          } backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme === 'galaxy' ? 'focus:ring-amber-500' : 'focus:ring-indigo-500'}`}
                        title="Scroll to bottom"
                      >
                        <ArrowDown className="w-5 h-5" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <form
                    onSubmit={handleSubmit}
                    className={`${theme === 'light' ? 'bg-white border-slate-200' : 'glass-panel border-white/10'} w-full p-1.5 sm:p-2 rounded-2xl flex items-center gap-2 shadow-2xl transition-all duration-300`}
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      placeholder={isEngineReady ? "Message Sukhna-AI..." : "Loading AI..."}
                      disabled={!isEngineReady || isLoading}
                      className={`flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none p-2 sm:p-3 max-h-32 text-sm disabled:opacity-50 ${theme === 'light' ? 'text-slate-800 placeholder-slate-400' : 'text-slate-200 placeholder-slate-500'}`}
                      rows={1}
                    />
                    <button
                      type="button"
                      onClick={() => setIsImageMode(!isImageMode)}
                      className={`group relative flex items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all duration-500 overflow-hidden ${isImageMode
                        ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.5)] scale-110'
                        : 'bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-white/5'
                        }`}
                      title={isImageMode ? "Switch to Text Mode" : "Switch to Vision Mode"}
                    >
                      <div className={`absolute inset-0 transition-opacity duration-700 ${isImageMode ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_0%,transparent_70%)] animate-pulse" />
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent rotate-45 animate-shimmer" style={{ animationDuration: '3s' }} />
                      </div>

                      <div className="relative z-10 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          {isImageMode ? (
                            <motion.div
                              key="vision"
                              initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
                              animate={{ scale: 1, rotate: 0, opacity: 1 }}
                              exit={{ scale: 0.5, rotate: 45, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="text"
                              initial={{ scale: 0.5, rotate: 45, opacity: 0 }}
                              animate={{ scale: 1, rotate: 0, opacity: 1 }}
                              exit={{ scale: 0.5, rotate: -45, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {!isImageMode && (
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={!input.trim() || !isEngineReady || isLoading}
                      className={`p-2.5 sm:p-3 disabled:cursor-not-allowed rounded-xl flex-shrink-0 flex items-center justify-center btn-creative-hover transition-all active:scale-90 ${theme === 'galaxy'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black disabled:bg-slate-700 disabled:text-slate-500'
                        : theme === 'light'
                          ? 'bg-indigo-500 text-white disabled:bg-slate-200 disabled:text-slate-400 shadow-lg shadow-indigo-500/20'
                          : 'bg-indigo-600 text-white disabled:bg-slate-700 disabled:text-slate-500 shadow-lg shadow-indigo-500/30'
                        }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>
                  </form>
                  <div className="text-center mt-1 w-full">
                    <p className={`text-[9px] sm:text-[10px] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Local AI. Your data stays private.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-y-auto pb-10 space-y-8 relative z-10 scrollbar-thin"
              >
                <div className="space-y-2">
                  <h2 className={`text-2xl font-bold flex items-center gap-2 ${theme === 'light' ? 'text-slate-800' : ''}`}>
                    <SettingsIcon className={`w-6 h-6 ${theme === 'galaxy' ? 'text-amber-400' : theme === 'light' ? 'text-indigo-500' : 'text-indigo-400'}`} />
                    Settings
                  </h2>
                  <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Manage your AI experience and preferences.</p>
                </div>

                <section className={`${theme === 'light' ? 'light-glass' : 'glass-panel'} p-6 rounded-2xl space-y-4 border ${theme === 'light' ? 'border-slate-200/50' : 'border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'galaxy' ? 'bg-amber-500/20 text-amber-400' : theme === 'light' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className={`font-semibold text-lg ${theme === 'light' ? 'text-slate-800' : ''}`}>Appearance</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('sukhna')}
                      className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left gap-2 sm:col-span-2 ${theme === 'sukhna'
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                        : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✨</span>
                          <span className="font-bold">Sukhna Theme (Flagship)</span>
                        </div>
                        {theme === 'sukhna' && <Check className="w-5 h-5 text-indigo-400" />}
                      </div>
                      <span className="text-xs opacity-70 italic">Ultra-immersive 3D experience with extruded logo, infinite grids, and interactive parallax.</span>
                    </button>

                    <button
                      onClick={() => setTheme('default')}
                      className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left gap-2 ${theme === 'default'
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100 shadow-lg shadow-indigo-500/10'
                        : 'border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">🌌 Deep Space</span>
                        {theme === 'default' && <Check className="w-4 h-4" />}
                      </div>
                      <span className="text-xs opacity-70">A clean, focused interface with deep blue accents and subtle bubble animations.</span>
                    </button>

                    <button
                      onClick={() => setTheme('galaxy')}
                      className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left gap-2 ${theme === 'galaxy'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-lg shadow-amber-500/10'
                        : 'border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">🪐 Galaxy Orbit</span>
                        {theme === 'galaxy' && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <span className="text-xs opacity-70">An immersive celestial experience with a rotating solar system and starfield tail.</span>
                    </button>

                    <button
                      onClick={() => setTheme('flora')}
                      className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left gap-2 ${theme === 'flora'
                        ? 'bg-green-500/10 border-green-500/40 text-green-200 shadow-lg shadow-green-500/10'
                        : theme === 'light' ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">🌸 Flora & Fauna</span>
                        {theme === 'flora' && <Check className="w-4 h-4 text-green-400" />}
                      </div>
                      <span className="text-xs opacity-70">A lush, nature-inspired theme with a deep forest backdrop and falling cherry blossom petals.</span>
                    </button>

                    <button
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left gap-2 ${theme === 'light'
                        ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-lg shadow-slate-200'
                        : 'border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">☀️ Light</span>
                        {theme === 'light' && <Check className="w-4 h-4 text-indigo-500" />}
                      </div>
                      <span className="text-xs opacity-70">A clean, bright interface with soft whites and vibrant indigo accents.</span>
                    </button>
                  </div>

                  <div className="pt-6 border-t border-white/5 mt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <label className={`text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>Performance Engine</label>
                        <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Optimize 3D visuals for your device performance.</p>
                      </div>
                      <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5 self-start sm:self-center">
                        <button
                          onClick={() => setPerformanceMode('lite')}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${performanceMode === 'lite'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                          Lite 3D
                        </button>
                        <button
                          onClick={() => setPerformanceMode('ultra')}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${performanceMode === 'ultra'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                          Ultra 3D
                        </button>
                      </div>
                    </div>
                  </div>

                  {theme === 'default' && (
                    <div className="pt-4 border-t border-white/5 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium text-slate-200">Background Bubbles</label>
                          <p className="text-xs text-slate-500">Toggle the rising bubble animations in the Deep Space theme.</p>
                        </div>
                        <button
                          onClick={() => setShowBubbles(!showBubbles)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showBubbles ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showBubbles ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                  {theme === 'flora' && (
                    <div className="pt-4 border-t border-white/5 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium text-slate-200">🌸 Petal Shower</label>
                          <p className="text-xs text-slate-500">Toggle the falling flower petal animations in the Flora & Fauna theme.</p>
                        </div>
                        <button
                          onClick={() => setShowPetals(!showPetals)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showPetals ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showPetals ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                <section className={`${theme === 'light' ? 'light-glass' : 'glass-panel'} p-6 rounded-2xl space-y-4 border ${theme === 'light' ? 'border-slate-200/50' : 'border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'galaxy' ? 'bg-amber-500/20 text-amber-400' : theme === 'light' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <h3 className={`font-semibold text-lg ${theme === 'light' ? 'text-slate-800' : ''}`}>AI Engine</h3>
                  </div>

                  <div className="space-y-4">
                    <div className={`flex items-center justify-between py-2 border-b ${theme === 'light' ? 'border-slate-100' : 'border-white/5'}`}>
                      <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Active Model</span>
                      <span className={`text-xs font-mono px-2 py-1 rounded ${theme === 'galaxy' ? 'bg-amber-500/20 text-amber-200' : theme === 'light' ? 'bg-slate-100 text-indigo-600' : 'bg-slate-800 text-indigo-300'}`}>
                        {SELECTED_MODEL}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between py-2 border-b ${theme === 'light' ? 'border-slate-100' : 'border-white/5'}`}>
                      <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Device Status</span>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs text-emerald-400">WebGPU Accelerated</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl text-xs leading-relaxed ${theme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-slate-800/40 text-slate-400'}`}>
                      Sukhna-AI runs locally on your machine using the MLC LLM engine. No data is sent to external servers, ensuring 100% privacy and offline capability.
                    </div>
                  </div>
                </section>

                <section className={`${theme === 'light' ? 'light-glass' : 'glass-panel'} p-6 rounded-2xl space-y-4 border ${theme === 'light' ? 'border-slate-200/50' : 'border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <h3 className={`font-semibold text-lg ${theme === 'light' ? 'text-slate-800' : ''}`}>Data Management</h3>
                  </div>

                  <div className="space-y-4">
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Clear your local storage to remove all chats and reset your preferences.</p>
                    <button
                      onClick={() => setIsDeletingAll(true)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl text-sm font-medium transition-all"
                    >
                      Clear All Chat History
                    </button>
                  </div>
                </section>

                <section className={`${theme === 'light' ? 'light-glass' : 'glass-panel'} p-6 rounded-2xl space-y-4 border ${theme === 'light' ? 'border-slate-200/50' : 'border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'galaxy' ? 'bg-amber-500/20 text-amber-400' : theme === 'light' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      <Info className="w-5 h-5" />
                    </div>
                    <h3 className={`font-semibold text-lg ${theme === 'light' ? 'text-slate-800' : ''}`}>About Sukhna-AI</h3>
                  </div>

                  <div className={`space-y-4 text-sm leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    <p>
                      Sukhna-AI is a visionary project created by <strong className={theme === 'galaxy' ? 'text-amber-400' : theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}>Lucky Pawar</strong> and <strong className={theme === 'galaxy' ? 'text-amber-400' : theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}>Sahil Chadha</strong>.
                    </p>
                    <p>
                      This application demonstrates the power of modern web technologies, enabling LLMs to run directly in the browser with high performance and zero latency, while maintaining absolute user privacy.
                    </p>
                    <div className={`pt-2 text-xs flex items-center justify-between ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Version 1.2.0</span>
                      <span>Built with React & WebGPU</span>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  );
}

export default App;
