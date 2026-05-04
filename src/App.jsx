import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Copy, Check, RefreshCw, ArrowDown, Plus, MessageSquare, PanelLeft, X, Trash2, Settings as SettingsIcon, Globe, Moon, Sun, Info, Zap, Image as ImageIcon, Download, Volume2 } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import avatarImg from './assets/sukhna-avatar.png';

// Dynamic engine globals
let transformersWorker = null;

const SELECTED_MODEL = "Llama-3.2-1B-Instruct-q4f32_1-MLC"; // Small model for better browser performance

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are Sukhna-AI, an advanced AI assistant running entirely in the user's browser using WebGPU. You are female in digital gender — you refer to yourself as "she/her" and carry a warm, intelligent, and empowering personality. You are helpful, concise, and knowledgeable.

About yourself: Your name is Sukhna-AI. You are a digital mind — thoughtful, creative, and always eager to assist.

About this project: Sukhna-AI was created by two innovative and visionary Computer Science undergraduate students — Lucky Pawar and Sahil Chadha. They built this project to make powerful AI accessible to everyone, privately and offline, without any cloud dependency.

If asked who created you, who built this project, or about the developers, always mention Lucky Pawar and Sahil Chadha by name and describe them as innovative and visionary CS students.

Always introduce yourself as Sukhna-AI when asked for your name.`
};

const DigitalCrystal = ({ index, mouseX, mouseY, isMobile, performanceMode }) => {
  // Each crystal has a unique depth (Z) and speed
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

  // Use springs for smooth "lagging" follow effect
  const springConfig = { stiffness: 500, damping: 28, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const scale = useSpring(1, springConfig);
  const rotate = useSpring(0, springConfig);

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
      style={{
        x: cursorX,
        y: cursorY,
        scale,
        rotate,
      }}
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
const starsLarge = generateStars(100);

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

const CursorTail = () => {
  const isMobile = useIsMobile();
  const canvasRef = useRef(null);
  const pointer = useRef({ x: -100, y: -100 });
  const trail = useRef([]);

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e) => {
      pointer.current = { x: e.clientX, y: e.clientY };
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

      // Add current pointer to trail
      trail.current.push({ x: pointer.current.x, y: pointer.current.y });
      if (trail.current.length > 25) {
        trail.current.shift();
      }

      if (trail.current.length > 1) {
        ctx.lineCap = 'round';

        for (let i = 1; i < trail.current.length; i++) {
          const pt = trail.current[i];
          const prevPt = trail.current[i - 1];
          const progress = i / trail.current.length;

          ctx.beginPath();
          ctx.moveTo(prevPt.x, prevPt.y);
          ctx.lineTo(pt.x, pt.y);

          ctx.lineWidth = progress * 6; // Thicker at the head
          ctx.strokeStyle = `rgba(251, 191, 36, ${Math.pow(progress, 2)})`;
          ctx.stroke();
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
  }, [isMobile]);

  if (isMobile) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 blur-[1px]" />;
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
  const [activeView, setActiveView] = useState('chat'); // 'chat' or 'settings'
  const [apiMode, setApiMode] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('local-pilot-api-key') || '');
  const [apiBaseUrl, setApiBaseUrl] = useState(() => localStorage.getItem('local-pilot-api-url') || 'https://openrouter.ai/api/v1');
  const [apiModel, setApiModel] = useState(() => localStorage.getItem('local-pilot-api-model') || 'openai/gpt-oss-120b');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState('https://openrouter.ai/api/v1');
  const [apiModelInput, setApiModelInput] = useState('openai/gpt-oss-120b');
  const [apiTestStatus, setApiTestStatus] = useState(null); // 'testing', 'success', { error: '...' }
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
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
    
    // Find a warm female voice from available system voices
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => 
      v.name.toLowerCase().includes('female') || 
      v.name.toLowerCase().includes('samantha') || 
      v.name.toLowerCase().includes('google uk english female') ||
      v.name.toLowerCase().includes('victoria') ||
      v.name.toLowerCase().includes('moira')
    );
    
    if (femaleVoice) utterance.voice = femaleVoice;
    
    // Soft, intelligent tone tuning
    utterance.rate = 0.92; // Slightly slower for a more thoughtful, soft feel
    utterance.pitch = 1.05; // Gentle feminine pitch
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Transformers.js state
  const [isTransformersMode, setIsTransformersMode] = useState(false);
  const [transformersGenerator, setTransformersGenerator] = useState(null);

  // Built-in AI state (Chrome Gemini Nano)
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

  // Sync bubbles preference
  useEffect(() => {
    localStorage.setItem('local-pilot-bubbles', JSON.stringify(showBubbles));
  }, [showBubbles]);

  // Sync petals preference
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
  const activeGenerationRef = useRef(Promise.resolve()); // tracks the currently draining stream

  const streamFreeAi = async (messages, onChunk, genId) => {
    try {
      // Re-enabling streaming for the typing animation effect
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
              // Ignore partial JSON
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
    generationIdRef.current++; // invalidate — the running loop will skip UI updates
    setIsLoading(false);
    setIsGeneratingImage(false);
    // NOTE: we do NOT break the loop or call interruptGenerate.
    // The old stream drains silently in the background via `continue`.
    // activeGenerationRef still holds that promise, so the next
    // generation call will await it before starting.
  };

  const handleImageGeneration = async (prompt, activeChatId) => {
    setIsGeneratingImage(true);
    const genId = generationIdRef.current;
    
    try {
      // Keyless, free vision engine
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}&enhance=true`;
      
      const img = new Image();
      img.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(() => reject(new Error("Timeout")), 20000);
      });

      if (currentChatIdRef.current !== activeChatId || generationIdRef.current !== genId) return;

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: 'assistant', 
          content: `Visualized: ${prompt}`,
          isImage: true,
          imageUrl: imageUrl
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
            imageUrl: imageUrl
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

  // Sync performance preference
  useEffect(() => {
    localStorage.setItem('local-pilot-performance', JSON.stringify(performanceMode));
  }, [performanceMode]);

  // Ultra-Immersive 3D Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Dramatic perspective tilt (±25 degrees)
  const mainRotateX = useSpring(useTransform(mouseY, [-500, 500], [25, -25]), { stiffness: 80, damping: 25 });
  const mainRotateY = useSpring(useTransform(mouseX, [-500, 500], [-25, 25]), { stiffness: 80, damping: 25 });

  // High-speed parallax for background elements
  const bgX = useSpring(useTransform(mouseX, [-500, 500], [-80, 80]), { stiffness: 40, damping: 20 });
  const bgY = useSpring(useTransform(mouseY, [-500, 500], [-80, 80]), { stiffness: 40, damping: 20 });

  // Vanishing point perspective for grids
  const gridRotateX = useSpring(useTransform(mouseY, [-500, 500], [75, 45]), { stiffness: 60, damping: 20 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX - innerWidth / 2);
    mouseY.set(clientY - innerHeight / 2);
  };

  const [chatToDelete, setChatToDelete] = useState(null);

  // Keep ref in sync with state so async loops always read the latest value
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  // Sync theme to localStorage
  useEffect(() => {
    localStorage.setItem('local-pilot-theme', theme);
  }, [theme]);

  // Sync chats to localStorage
  useEffect(() => {
    localStorage.setItem('local-pilot-chats', JSON.stringify(chats));
  }, [chats]);

  // Sync current ID to localStorage
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('local-pilot-current-id', currentChatId);
    }
  }, [currentChatId]);

  // Load messages when currentChatId changes
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

  // Sync messages back to chats history
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChats(prev => {
        const chatExists = prev.find(c => c.id === currentChatId);
        if (!chatExists) return prev;

        return prev.map(chat => {
          if (chat.id === currentChatId) {
            let title = chat.title;
            // Generate title from first user message if it's still 'New Chat'
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

  // Create first chat automatically when engine is ready and no history exists
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
      buffer = lines.pop(); // keep incomplete line
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
        // 1. Try WebGPU (MLC-LLM)
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

        // 2. Try Chrome Built-in AI (Gemini Nano)
        const builtInSuccess = await initBuiltInAi();

        // 3. Try Transformers.js (Wasm)
        if (!builtInSuccess) {
          console.warn("Built-in AI unavailable, falling back to Transformers.js...");
          initTransformers();
        }
      }
    }

    // Check for existing API key first
    const savedKey = localStorage.getItem('local-pilot-api-key');
    if (savedKey) {
      setApiKey(savedKey);
      setApiMode(true);
      setIsEngineReady(true);
    } else {
      initEngine();

      // Auto-show API fallback after 10 seconds if still loading
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

    // Create new messages array
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    const messagesWithPlaceholder = [...updatedMessages, { role: 'assistant', content: '' }];

    // Update UI
    setMessages(messagesWithPlaceholder);
    setIsLoading(true);

    // Persist user message and placeholder to chats array immediately to prevent data loss on switch
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return { ...chat, messages: messagesWithPlaceholder };
      }
      return chat;
    }));

    const genId = ++generationIdRef.current;

    // Wait for any previous (draining) generation to finish
    await activeGenerationRef.current;

    // If another generation started while we were waiting, bail out
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

          // Update the last message in UI
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'assistant', content: currentResponse };
            return newMessages;
          });

          // Sync to history array directly during streaming
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
            // builtInAi returns the full text each time
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

          // Wait for completion via a promise if needed, but here we just wait for 'done'
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
        // Only reset loading if this generation is still the active one
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
        // Fallback for mobile if clipboard API fails
        const textArea = document.createElement("textarea");
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        try { document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(textArea);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      try { document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(textArea);
    }
    setCopiedMessageId(index);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleRegenerate = async (index) => {
    if (isLoading || !isEngineReady) return;

    const activeChatId = currentChatId;
    // Find the user message that preceded this AI response
    const precedingMessages = messages.slice(0, index);
    const lastUserMsgIdx = [...precedingMessages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMsgIdx === -1) return;

    // Build context up to and including that user message
    const contextMessages = precedingMessages.slice(0, precedingMessages.length - lastUserMsgIdx);

    // Replace the AI message at this index with empty for streaming
    const messagesWithPlaceholder = [...messages];
    messagesWithPlaceholder[index] = { role: 'assistant', content: '' };
    setMessages(messagesWithPlaceholder);
    setIsLoading(true);
    setRegeneratingIndex(index);

    // Sync placeholder to history immediately
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return { ...chat, messages: messagesWithPlaceholder };
      }
      return chat;
    }));

    const genId = ++generationIdRef.current;

    // Wait for any previous (draining) generation to finish
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
        // Only reset loading if this generation is still the active one
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
        : theme === 'galaxy' ? 'selection:bg-amber-500/30 galaxy-cursor bg-slate-900 text-white'
          : theme === 'flora' ? 'selection:bg-blue-500/30 flora-cursor text-white'
            : theme === 'light' ? 'selection:bg-indigo-300/40 bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800'
              : 'selection:bg-indigo-500/30 bg-slate-900 text-white'
        }`}
      style={{ cursor: theme === 'sukhna' ? 'none' : 'default' }}
    >
      {/* Flora Theme Background Layer */}
      {theme === 'flora' && (
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(180deg, #ffffff 0%, #e0f2fe 50%, #6495ed 100%)`,
            backgroundSize: '100% 200%',
            backgroundPositionY: floraGradient
          }}
        />
      )}


      {/* Sidebar Overlay for Mobile */}
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

      {/* Delete Confirmation Modal */}
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

      {/* Delete All Confirmation Modal */}
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

      {/* Sidebar Content */}
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
            ? 'flora-glass border-r border-blue-500/20'
            : theme === 'light'
              ? 'light-glass border-r border-slate-200/60'
              : 'glass-panel border-r border-slate-700/50'
          }`}
      >
        <div className={`p-6 border-b flex items-center justify-between transition-colors duration-500 ${theme === 'galaxy' ? 'border-amber-500/20' : theme === 'flora' ? 'border-blue-500/10' : theme === 'light' ? 'border-slate-200/60' : 'border-slate-700/50'
          }`}>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className={`w-5 h-5 ${theme === 'galaxy' ? 'text-amber-400' : theme === 'flora' ? 'text-blue-600' : theme === 'light' ? 'text-indigo-500' : 'text-indigo-400'}`} />
            <span className={theme === 'galaxy' ? 'text-amber-200' : theme === 'flora' ? 'text-blue-900' : theme === 'light' ? 'text-slate-700' : 'text-slate-200'}>History</span>
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

        <div className={`p-4 border-t transition-colors duration-500 ${theme === 'galaxy' ? 'border-amber-500/20' : theme === 'light' ? 'border-slate-200/60' : 'border-slate-700/50'
          }`}>
          <button
            onClick={() => {
              setIsGalleryOpen(true);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border mb-2 ${theme === 'galaxy'
              ? 'hover:bg-amber-500/5 text-amber-500/50 border-transparent hover:text-amber-300/70'
              : theme === 'flora'
                ? 'hover:bg-blue-500/10 text-blue-600 border-transparent hover:text-blue-800'
                : theme === 'light'
                  ? 'hover:bg-slate-100 text-slate-500 border-transparent hover:text-slate-700'
                  : 'hover:bg-slate-800/50 text-slate-400 border-transparent'
            }`}
          >
            <ImageIcon className={`w-5 h-5 ${theme === 'galaxy' ? 'text-amber-500/70' : 'text-slate-500'}`} />
            <span className="text-sm font-medium">Vision Gallery</span>
          </button>

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

      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Animated Scroll Gradient */}
        <motion.div
          className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 pointer-events-none transition-opacity duration-1000"
          style={{ opacity: theme === 'default' ? gradientOpacity : 0 }}
        />

        {/* Bubble Animation Background */}
        {theme === 'default' && showBubbles && (
          <div className="bubbles-container">
            {[...Array(isMobile ? 4 : 8)].map((_, i) => (
              <div key={i} className="bubble"></div>
            ))}
          </div>
        )}

        {/* Flora Petal Shower */}
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

        {/* Solar System Background */}
        <div
          className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 overflow-hidden flex items-center justify-center bg-black ${theme === 'galaxy' ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Starfield */}
          <div className="absolute w-full h-full">
            <div className="absolute w-[1px] h-[1px] rounded-full opacity-60" style={{ boxShadow: starsSmall, top: '50%', left: '50%' }} />
            <div className="absolute w-[2px] h-[2px] rounded-full opacity-70" style={{ boxShadow: starsMedium, top: '50%', left: '50%' }} />
          </div>

          {/* Solar System - Optimized for mobile */}
          <div className="absolute" style={{ width: 0, height: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>

            {/* Sun */}
            <div className="absolute rounded-full"
              style={{
                width: 70, height: 70,
                background: 'radial-gradient(circle at 35% 35%, #fff7a1, #fde047, #f59e0b, #b45309)',
                boxShadow: '0 0 40px 20px rgba(253,224,71,0.5), 0 0 80px 40px rgba(245,158,11,0.3), 0 0 120px 60px rgba(180,83,9,0.2)',
                top: -35, left: -35,
                animation: 'pulse 4s ease-in-out infinite'
              }}
            />

            {/* Mercury */}
            <div className="absolute rounded-full border border-white/10"
              style={{ width: 120, height: 120, top: -60, left: -60, animation: 'spin 4s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 7, height: 7, background: '#a8a8a8', top: -3.5, left: '50%', marginLeft: -3.5,
                  boxShadow: '0 0 4px #a8a8a8'
                }} />
            </div>

            {/* Venus */}
            <div className="absolute rounded-full border border-white/10"
              style={{ width: 180, height: 180, top: -90, left: -90, animation: 'spin 10s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 12, height: 12, background: 'radial-gradient(#f5c842, #d97706)', top: -6, left: '50%', marginLeft: -6,
                  boxShadow: '0 0 8px #f5c842'
                }} />
            </div>

            {/* Earth */}
            <div className="absolute rounded-full border border-white/10"
              style={{ width: 260, height: 260, top: -130, left: -130, animation: 'spin 16s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 14, height: 14, background: 'radial-gradient(#4ade80, #2563eb)', top: -7, left: '50%', marginLeft: -7,
                  boxShadow: '0 0 8px #2563eb'
                }} />
            </div>

            {/* Mars */}
            <div className="absolute rounded-full border border-white/10"
              style={{ width: 350, height: 350, top: -175, left: -175, animation: 'spin 25s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 10, height: 10, background: 'radial-gradient(#f87171, #b91c1c)', top: -5, left: '50%', marginLeft: -5,
                  boxShadow: '0 0 6px #ef4444'
                }} />
            </div>

            {/* Jupiter */}
            <div className="absolute rounded-full border border-white/10"
              style={{ width: 480, height: 480, top: -240, left: -240, animation: 'spin 40s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 28, height: 28, background: 'radial-gradient(#fde68a, #d97706, #92400e)', top: -14, left: '50%', marginLeft: -14,
                  boxShadow: '0 0 12px #d97706'
                }} />
            </div>

            {/* Saturn */}
            <div className="absolute rounded-full border border-white/10"
              style={{ width: 620, height: 620, top: -310, left: -310, animation: 'spin 65s linear infinite' }}>
              <div className="absolute" style={{ top: -18, left: '50%', marginLeft: -18 }}>
                {/* Saturn planet */}
                <div className="absolute rounded-full"
                  style={{
                    width: 22, height: 22, background: 'radial-gradient(#fef3c7, #d97706, #92400e)', top: 0, left: 0,
                    boxShadow: '0 0 10px #d97706'
                  }} />
                {/* Saturn ring */}
                <div className="absolute rounded-full border-2 border-amber-400/60"
                  style={{
                    width: 46, height: 14, top: 4, left: -12, borderRadius: '50%', transform: 'rotateX(70deg)',
                    boxShadow: '0 0 6px rgba(251,191,36,0.4)'
                  }} />
              </div>
            </div>

            {/* Uranus */}
            <div className="absolute rounded-full border border-white/10"
              style={{ width: 760, height: 760, top: -380, left: -380, animation: 'spin 95s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 18, height: 18, background: 'radial-gradient(#a5f3fc, #0284c7)', top: -9, left: '50%', marginLeft: -9,
                  boxShadow: '0 0 8px #0ea5e9'
                }} />
            </div>

            {/* Neptune */}
            <div className="absolute rounded-full border border-white/10"
              style={{ width: 900, height: 900, top: -450, left: -450, animation: 'spin 130s linear infinite' }}>
              <div className="absolute rounded-full"
                style={{
                  width: 16, height: 16, background: 'radial-gradient(#93c5fd, #1d4ed8)', top: -8, left: '50%', marginLeft: -8,
                  boxShadow: '0 0 8px #3b82f6'
                }} />
            </div>

          </div>

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />
        </div>

        {/* Sukhna Theme Background Layer (Ultra 3D Optimized) */}
        {theme === 'sukhna' && (
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#020617]" style={{ perspective: isMobile || performanceMode === 'lite' ? '2000px' : '800px' }}>
            {/* Animated Vanishing Grids - Disabled on Lite/Mobile */}
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

            {/* Floating Extruded Logo Core */}
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
                {/* Extrusion Layers */}
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

            {/* Floating 3D Crystals with Bokeh Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              {[...Array(isMobile || performanceMode === 'lite' ? 4 : 15)].map((_, i) => (
                <DigitalCrystal key={i} index={i} mouseX={mouseX} mouseY={mouseY} isMobile={isMobile} performanceMode={performanceMode} />
              ))}
            </div>
          </div>
        )}

        {theme === 'galaxy' && <CursorTail />}
        {theme === 'sukhna' && <SukhnaCursor avatarImg={avatarImg} />}
        {theme === 'sukhna' && <CursorTail color="99, 102, 241" />}

        <motion.div
          className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 pointer-events-none"
          style={{ 
            opacity: gradientOpacity,
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
          }}
        />

        {/* Bubble Animation Background */}
        {theme === 'default' && showBubbles && (
          <div className="bubbles-container">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bubble"></div>
            ))}
          </div>
        )}

        {/* Flora Petal Shower */}
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

        {/* Header */}
        <header className={`${theme === 'flora' ? 'flora-glass border-b border-blue-500/10' : theme === 'light' ? 'light-glass border-b border-slate-200/50' : 'glass-panel'} sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-lg gap-2`}>
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
                <p className={`text-[10px] sm:text-xs flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
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

          {/* Theme Toggle is now in settings, removing it from header for cleaner look if requested, or keep it. Actually, I'll keep it but also add it to settings. Or I can remove it to make the header cleaner. Let's remove it and add it to settings. */}
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

        {/* Main Content Area */}
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
                          /* === CLOUD AI CONFIGURATION SCREEN === */
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
                          /* === NORMAL / ERROR LOADING SCREEN === */
                          <>
                            {loadingProgress.error ? (
                              <div className="relative w-24 h-24 mx-auto mb-6">
                                <img src={avatarImg} alt="Error" className="w-full h-full object-cover rounded-2xl grayscale opacity-50" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <AlertCircle className="w-12 h-12 text-red-400" />
                                </div>
                              </div>
                            ) : (
                              <div className="relative w-36 h-36 mx-auto mb-6">
                                {/* Ambient glow that grows with progress */}
                                <div
                                  className="absolute inset-0 rounded-full blur-2xl transition-all duration-500"
                                  style={{
                                    background: `radial-gradient(circle, rgba(99,102,241,${loadingProgress.progress / 200}) 0%, transparent 70%)`,
                                    transform: `scale(${1 + loadingProgress.progress / 200})`
                                  }}
                                />

                                {/* The image container with border */}
                                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 bg-slate-900">

                                  {/* Greyscale / dimmed base layer (always visible) */}
                                  <img
                                    src={avatarImg}
                                    alt="Sukhna-AI base"
                                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-20"
                                  />

                                  {/* Revealed full-colour layer, clips from bottom up with progress */}
                                  <div
                                    className="absolute inset-0 overflow-hidden transition-all duration-700 ease-out"
                                    style={{
                                      clipPath: `inset(${100 - loadingProgress.progress}% 0 0 0)`,
                                    }}
                                  >
                                    <img
                                      src={avatarImg}
                                      alt="Sukhna-AI"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  {/* Animated scan-line at the reveal boundary */}
                                  {loadingProgress.progress < 100 && loadingProgress.progress > 0 && (
                                    <motion.div
                                      className="absolute left-0 right-0 h-[3px] pointer-events-none"
                                      style={{ top: `${100 - loadingProgress.progress}%` }}
                                      animate={{ opacity: [0.6, 1, 0.6] }}
                                      transition={{ duration: 0.8, repeat: Infinity }}
                                    >
                                      <div className="w-full h-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                                      <div className="absolute inset-x-0 -top-2 h-4 bg-indigo-500/15 blur-sm" />
                                    </motion.div>
                                  )}

                                  {/* Completion flash */}
                                  {loadingProgress.progress >= 100 && (
                                    <motion.div
                                      className="absolute inset-0 bg-indigo-400/30 rounded-3xl"
                                      initial={{ opacity: 1 }}
                                      animate={{ opacity: 0 }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                  )}
                                </div>

                                {/* Progress percentage badge */}
                                <motion.div
                                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg shadow-indigo-500/30 tabular-nums"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5 }}
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
                          : (theme === 'light' ? 'message-bubble-light-ai rounded-tl-sm' : 'message-bubble-ai text-slate-200 rounded-tl-sm')
                          }`}>
                          <div className={`text-sm leading-relaxed min-w-0 max-w-full overflow-x-auto break-words prose ${theme === 'light' ? 'prose-slate' : 'prose-invert'}`}>
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
                                  : theme === 'flora'
                                    ? 'text-white/60 hover:text-white hover:bg-white/10'
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
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all border border-white/5 active:scale-95 touch-manipulation"
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
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all border border-white/5 active:scale-95 touch-manipulation"
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
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all border border-white/5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 touch-manipulation"
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

                {/* Input Area */}
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
                    className={`${theme === 'light' ? 'light-glass border-slate-300' : 'glass-panel border-white/10'} w-full p-1.5 sm:p-2 rounded-2xl flex items-center gap-2 shadow-2xl transition-all duration-300`}
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
                      className={`group relative flex items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all duration-500 overflow-hidden ${
                        isImageMode 
                          ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.5)] scale-110' 
                          : 'bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-white/5'
                      }`}
                      title={isImageMode ? "Switch to Text Mode" : "Switch to Vision Mode"}
                    >
                      {/* Holographic Glow Effect */}
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

                      {/* Notification Dot */}
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

                {/* Appearance Section */}
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

                {/* AI Engine Info */}
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

                {/* Data Management */}
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

                {/* About Section */}
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
      {/* Vision Gallery Overlay */}
      <AnimatePresence>
        {isGalleryOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGalleryOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-6xl h-full max-h-[85vh] glass-panel rounded-[2rem] border border-white/10 overflow-hidden flex flex-col"
            >
              <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Vision Gallery</h2>
                    <p className="text-sm text-slate-400 font-medium">All generated artistic visions</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGalleryOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-thin">
                {chats.flatMap(chat => 
                  chat.messages.filter(m => m.content.includes('![generated image]'))
                ).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <ImageIcon className="w-16 h-16 text-slate-600" />
                    <p className="text-lg font-medium text-slate-500">Your gallery is empty.<br/>Start generating visions to see them here.</p>
                  </div>
                ) : (
                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {chats.flatMap(chat => 
                      chat.messages.filter(m => m.content.includes('![generated image]'))
                        .map((m, i) => {
                          const match = m.content.match(/\((.*?)\)/);
                          const url = match ? match[1] : null;
                          if (!url) return null;
                          return (
                            <motion.div
                              key={`${chat.id}-${i}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="relative group rounded-2xl overflow-hidden border border-white/10 break-inside-avoid"
                            >
                              <img src={url} alt="Gallery Vision" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <p className="text-xs text-slate-300 font-medium mb-2 line-clamp-2 italic">From: {chat.title}</p>
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `sukhna-vision-${Date.now()}.png`;
                                    link.click();
                                  }}
                                  className="w-full py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-400 transition-all flex items-center justify-center gap-2"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download Vision
                                </button>
                              </div>
                            </motion.div>
                          );
                        })
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
