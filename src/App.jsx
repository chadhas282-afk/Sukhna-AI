import React, { useState, useEffect, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Copy, Check, RefreshCw, ArrowDown, Plus, MessageSquare, PanelLeft, X, Trash2, Settings as SettingsIcon, Globe, Moon, Sun, Info } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SELECTED_MODEL = "Llama-3.2-1B-Instruct-q4f32_1-MLC"; // Small model for better browser performance

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are Sukhna-AI, an advanced AI assistant running entirely in the user's browser using WebGPU. You are female in digital gender — you refer to yourself as "she/her" and carry a warm, intelligent, and empowering personality. You are helpful, concise, and knowledgeable.

About yourself: Your name is Sukhna-AI. You are a digital mind — thoughtful, creative, and always eager to assist.

About this project: Sukhna-AI was created by two innovative and visionary Computer Science undergraduate students — Lucky Pawar and Sahil Chadha. They built this project to make powerful AI accessible to everyone, privately and offline, without any cloud dependency.

If asked who created you, who built this project, or about the developers, always mention Lucky Pawar and Sahil Chadha by name and describe them as innovative and visionary CS students.

Always introduce yourself as Sukhna-AI when asked for your name.`
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

const CursorTail = () => {
  const canvasRef = useRef(null);
  const pointer = useRef({ x: -100, y: -100 });
  const trail = useRef([]);

  useEffect(() => {
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
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 blur-[1px]" />;
};

function App() {
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
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showBubbles, setShowBubbles] = useState(() => {
    const saved = localStorage.getItem('local-pilot-bubbles');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Sync bubbles preference
  useEffect(() => {
    localStorage.setItem('local-pilot-bubbles', JSON.stringify(showBubbles));
  }, [showBubbles]);

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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const currentChatIdRef = useRef(currentChatId);
  const generationIdRef = useRef(0);
  const activeGenerationRef = useRef(Promise.resolve()); // tracks the currently draining stream

  const handleStop = () => {
    generationIdRef.current++; // invalidate — the running loop will skip UI updates
    setIsLoading(false);
    // NOTE: we do NOT break the loop or call interruptGenerate.
    // The old stream drains silently in the background via `continue`.
    // activeGenerationRef still holds that promise, so the next
    // generation call will await it before starting.
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

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
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
    async function initEngine() {
      try {
        const initProgressCallback = (initProgress) => {
          setLoadingProgress({
            text: initProgress.text,
            progress: Math.round(initProgress.progress * 100)
          });
          console.log(initProgress);
        };

        // Use worker for better UI performance
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
        console.error("Failed to initialize engine:", error);
        setLoadingProgress({
          text: 'Failed to load model. Your browser might not support WebGPU or you might lack sufficient memory.',
          progress: 0,
          error: true
        });
      }
    }

    // Check for WebGPU support before trying to initialize
    if (!navigator.gpu) {
      setLoadingProgress({
        text: 'WebGPU is not supported in this browser. Please use Chrome/Edge 113+ or Safari 18+.',
        progress: 0,
        error: true
      });
      return;
    }

    initEngine();
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
      const completion = await engine.chat.completions.create({
        messages: [SYSTEM_PROMPT, ...updatedMessages],
        stream: true,
      });

      let currentResponse = '';
      for await (const chunk of completion) {
        // If generation was cancelled, skip UI updates but let the engine drain
        if (currentChatIdRef.current !== activeChatId || generationIdRef.current !== genId) continue;

        const content = chunk.choices[0]?.delta?.content || '';
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
      }
    }
    })();
    activeGenerationRef.current = genPromise;
    await genPromise;
  };

  const copyResponse = (content, index) => {
    navigator.clipboard.writeText(content);
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
      const completion = await engine.chat.completions.create({
        messages: [SYSTEM_PROMPT, ...contextMessages],
        stream: true,
      });

      let currentResponse = '';
      for await (const chunk of completion) {
        // If generation was cancelled, skip UI updates but let the engine drain
        if (currentChatIdRef.current !== activeChatId || generationIdRef.current !== genId) continue;

        const content = chunk.choices[0]?.delta?.content || '';
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
      }
    }
    })();
    activeGenerationRef.current = genPromise;
    await genPromise;
  };

  return (
    <div className={`h-[100dvh] w-screen overflow-hidden bg-slate-900 text-white flex font-sans relative ${theme === 'galaxy' ? 'selection:bg-amber-500/30 galaxy-cursor' : 'selection:bg-indigo-500/30'}`}>
      
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
        className={`fixed lg:relative top-0 left-0 h-full z-50 flex flex-col overflow-hidden shadow-2xl transition-colors duration-500 ${
          theme === 'galaxy' 
            ? 'bg-black/60 backdrop-blur-xl border-r border-amber-500/20' 
            : 'glass-panel border-r border-slate-700/50'
        }`}
      >
        <div className={`p-6 border-b flex items-center justify-between transition-colors duration-500 ${
          theme === 'galaxy' ? 'border-amber-500/20' : 'border-slate-700/50'
        }`}>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className={`w-5 h-5 ${theme === 'galaxy' ? 'text-amber-400' : 'text-indigo-400'}`} />
            <span className={theme === 'galaxy' ? 'text-amber-200' : 'text-slate-200'}>History</span>
          </h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className={`p-2 rounded-lg lg:hidden transition-colors ${
              theme === 'galaxy' ? 'hover:bg-amber-500/10 text-amber-400' : 'hover:bg-slate-800 text-slate-400'
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
            className={`w-full flex items-center justify-center gap-2 py-3 border rounded-xl transition-all font-medium btn-creative-hover ${
              theme === 'galaxy' 
                ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300' 
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
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                currentChatId === chat.id && activeView === 'chat'
                  ? (theme === 'galaxy' ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' : 'bg-indigo-500/20 border-indigo-500/30 text-white')
                  : (theme === 'galaxy' ? 'hover:bg-amber-500/5 text-amber-500/50 border-transparent hover:text-amber-300/70' : 'hover:bg-slate-800/50 text-slate-400 border-transparent')
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                  currentChatId === chat.id && activeView === 'chat'
                    ? (theme === 'galaxy' ? 'text-amber-400' : 'text-indigo-400') 
                    : 'text-slate-500'
                }`} />
                <span className="truncate text-sm font-medium">{chat.title}</span>
              </div>
              <button 
                onClick={(e) => deleteChat(chat.id, e)}
                className={`opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 rounded-md transition-all ${
                  theme === 'galaxy' ? 'hover:bg-amber-500/20 hover:text-amber-400' : 'hover:bg-red-500/20 hover:text-red-400'
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

        <div className={`p-4 border-t transition-colors duration-500 ${
          theme === 'galaxy' ? 'border-amber-500/20' : 'border-slate-700/50'
        }`}>
          <button 
            onClick={() => {
              setActiveView('settings');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
              activeView === 'settings'
                ? (theme === 'galaxy' ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' : 'bg-indigo-500/20 border-indigo-500/30 text-white')
                : (theme === 'galaxy' ? 'hover:bg-amber-500/5 text-amber-500/50 border-transparent hover:text-amber-300/70' : 'hover:bg-slate-800/50 text-slate-400 border-transparent')
            }`}
          >
            <SettingsIcon className={`w-5 h-5 ${activeView === 'settings' ? (theme === 'galaxy' ? 'text-amber-400' : 'text-indigo-400') : 'text-slate-500'}`} />
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
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bubble"></div>
            ))}
          </div>
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

        {/* Solar System */}
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
              style={{ width: 7, height: 7, background: '#a8a8a8', top: -3.5, left: '50%', marginLeft: -3.5,
                boxShadow: '0 0 4px #a8a8a8' }} />
          </div>

          {/* Venus */}
          <div className="absolute rounded-full border border-white/10"
            style={{ width: 180, height: 180, top: -90, left: -90, animation: 'spin 10s linear infinite' }}>
            <div className="absolute rounded-full"
              style={{ width: 12, height: 12, background: 'radial-gradient(#f5c842, #d97706)', top: -6, left: '50%', marginLeft: -6,
                boxShadow: '0 0 8px #f5c842' }} />
          </div>

          {/* Earth */}
          <div className="absolute rounded-full border border-white/10"
            style={{ width: 260, height: 260, top: -130, left: -130, animation: 'spin 16s linear infinite' }}>
            <div className="absolute rounded-full"
              style={{ width: 14, height: 14, background: 'radial-gradient(#4ade80, #2563eb)', top: -7, left: '50%', marginLeft: -7,
                boxShadow: '0 0 8px #2563eb' }} />
          </div>

          {/* Mars */}
          <div className="absolute rounded-full border border-white/10"
            style={{ width: 350, height: 350, top: -175, left: -175, animation: 'spin 25s linear infinite' }}>
            <div className="absolute rounded-full"
              style={{ width: 10, height: 10, background: 'radial-gradient(#f87171, #b91c1c)', top: -5, left: '50%', marginLeft: -5,
                boxShadow: '0 0 6px #ef4444' }} />
          </div>

          {/* Jupiter */}
          <div className="absolute rounded-full border border-white/10"
            style={{ width: 480, height: 480, top: -240, left: -240, animation: 'spin 40s linear infinite' }}>
            <div className="absolute rounded-full"
              style={{ width: 28, height: 28, background: 'radial-gradient(#fde68a, #d97706, #92400e)', top: -14, left: '50%', marginLeft: -14,
                boxShadow: '0 0 12px #d97706' }} />
          </div>

          {/* Saturn */}
          <div className="absolute rounded-full border border-white/10"
            style={{ width: 620, height: 620, top: -310, left: -310, animation: 'spin 65s linear infinite' }}>
            <div className="absolute" style={{ top: -18, left: '50%', marginLeft: -18 }}>
              {/* Saturn planet */}
              <div className="absolute rounded-full"
                style={{ width: 22, height: 22, background: 'radial-gradient(#fef3c7, #d97706, #92400e)', top: 0, left: 0,
                  boxShadow: '0 0 10px #d97706' }} />
              {/* Saturn ring */}
              <div className="absolute rounded-full border-2 border-amber-400/60"
                style={{ width: 46, height: 14, top: 4, left: -12, borderRadius: '50%', transform: 'rotateX(70deg)',
                  boxShadow: '0 0 6px rgba(251,191,36,0.4)' }} />
            </div>
          </div>

          {/* Uranus */}
          <div className="absolute rounded-full border border-white/10"
            style={{ width: 760, height: 760, top: -380, left: -380, animation: 'spin 95s linear infinite' }}>
            <div className="absolute rounded-full"
              style={{ width: 18, height: 18, background: 'radial-gradient(#a5f3fc, #0284c7)', top: -9, left: '50%', marginLeft: -9,
                boxShadow: '0 0 8px #0ea5e9' }} />
          </div>

          {/* Neptune */}
          <div className="absolute rounded-full border border-white/10"
            style={{ width: 900, height: 900, top: -450, left: -450, animation: 'spin 130s linear infinite' }}>
            <div className="absolute rounded-full"
              style={{ width: 16, height: 16, background: 'radial-gradient(#93c5fd, #1d4ed8)', top: -8, left: '50%', marginLeft: -8,
                boxShadow: '0 0 8px #3b82f6' }} />
          </div>

        </div>

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />
      </div>
      
      {theme === 'galaxy' && <CursorTail />}
      
      <motion.div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 pointer-events-none"
        style={{ opacity: gradientOpacity }}
      />

      {/* Bubble Animation Background */}
      {theme === 'default' && showBubbles && (
        <div className="bubbles-container">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bubble"></div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="glass-panel sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-lg gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-800/50 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white transition-all flex-shrink-0"
            title="Toggle Sidebar"
          >
            <PanelLeft className={`w-5 h-5 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`${theme === 'galaxy' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-indigo-500/20 border-indigo-500/30'} p-1.5 sm:p-2 rounded-xl border`}>
              <Sparkles className={`w-5 h-5 sm:w-6 sm:h-6 ${theme === 'galaxy' ? 'text-amber-400' : 'text-indigo-400'}`} />
            </div>
          <div>
            <h1 className={`text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme === 'galaxy' ? 'from-amber-400 to-yellow-200' : 'from-indigo-400 to-purple-400'}`}>
              Sukhna-AI
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5">
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
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                theme === 'galaxy' 
                  ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' 
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Back to Chat
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative max-w-4xl w-full mx-auto p-2 sm:p-6">
        
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
                      {loadingProgress.error ? (
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      ) : (
                        <Loader2 className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-spin" />
                      )}
                      
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">
                        {loadingProgress.error ? 'Initialization Failed' : 'Loading AI Model'}
                      </h2>
                      
                      <p className={`text-sm ${loadingProgress.error ? 'text-red-300' : 'text-slate-300'} mb-6`}>
                        {loadingProgress.text}
                      </p>

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
                    </div>
                  </div>
                </div>
              )}

              <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pb-36 sm:pb-32 pr-1 sm:pr-2 scrollbar-thin relative z-10">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      key={index}
                      className={`flex gap-2 sm:gap-4 max-w-[95%] sm:max-w-[85%] ${
                        message.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg mt-1 sm:mt-0 ${
                        message.role === 'user' 
                          ? (theme === 'galaxy' ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white')
                          : 'bg-slate-700 border border-slate-600'
                      }`}>
                        {message.role === 'user' ? (
                          <User className={`w-3 h-3 sm:w-4 sm:h-4 ${theme === 'galaxy' ? 'text-black' : 'text-white'}`} />
                        ) : (
                          <Bot className={`w-3 h-3 sm:w-4 sm:h-4 ${theme === 'galaxy' ? 'text-amber-400' : 'text-indigo-300'}`} />
                        )}
                      </div>
                      
                      <div className={`p-3 sm:p-4 rounded-2xl shadow-md min-w-0 ${
                        message.role === 'user'
                          ? (theme === 'galaxy' ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black rounded-tr-sm' : 'message-bubble-user text-white rounded-tr-sm')
                          : 'message-bubble-ai text-slate-200 rounded-tl-sm'
                      }`}>
                        <div className="text-sm leading-relaxed min-w-0 max-w-full overflow-x-auto break-words prose prose-invert">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline ? (
                                  <CodeBlockWithCopy match={match} className={className} children={children} {...props} />
                                ) : (
                                  <code {...props} className={`${className || ''} bg-slate-800 px-1 py-0.5 rounded text-indigo-300 font-mono text-[0.9em] break-words`}>
                                    {children}
                                  </code>
                                )
                              },
                              strong({children}) {
                                return <strong className={`font-extrabold ${theme === 'galaxy' ? 'text-amber-400' : 'text-indigo-300'} tracking-wide`}>{children}</strong>
                              },
                              p({children}) {
                                return <p className="mb-2 last:mb-0">{children}</p>
                              },
                              pre({children}) {
                                return <pre className="bg-transparent p-0 m-0 overflow-visible">{children}</pre>
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        {message.role === 'assistant' && message.content && (
                          <div className="flex items-center gap-1 mt-2 -mb-1">
                            <button
                              onClick={() => copyResponse(message.content, index)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                              title="Copy response"
                            >
                              {copiedMessageId === index ? (
                                <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                              ) : (
                                <><Copy className="w-3 h-3" /><span>Copy</span></>
                              )}
                            </button>
                            <button
                              onClick={() => handleRegenerate(index)}
                              disabled={isLoading}
                              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Regenerate response"
                            >
                              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
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
              <div className="absolute bottom-2 sm:bottom-6 left-2 sm:left-6 right-2 sm:right-6 lg:left-0 lg:right-0 z-20 flex flex-col items-center">
                <AnimatePresence>
                  {isLoading && (
                    <motion.button
                      key="stop-btn"
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.9 }}
                      onClick={handleStop}
                      className={`mb-3 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg border backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${
                        theme === 'galaxy'
                          ? 'bg-black/70 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400/60'
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
                      className={`mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full shadow-lg border btn-creative-hover ${
                        theme === 'galaxy' 
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
                  className="glass-panel w-full p-2 rounded-2xl flex items-center gap-2 shadow-2xl transition-all duration-300"
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
                    placeholder={isEngineReady ? "Message Sukhna-AI..." : "Waiting for Sukhna-AI to load..."}
                    disabled={!isEngineReady || isLoading}
                    className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none p-3 max-h-32 text-sm disabled:opacity-50 text-slate-200 placeholder-slate-500"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || !isEngineReady || isLoading}
                    className={`p-3 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded-xl flex-shrink-0 flex items-center justify-center btn-creative-hover ${
                      theme === 'galaxy' 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black' 
                        : 'bg-indigo-500 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                  </button>
                </form>
                <div className="text-center mt-2 w-full">
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    Responses are generated locally and may be inaccurate.
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
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <SettingsIcon className={`w-6 h-6 ${theme === 'galaxy' ? 'text-amber-400' : 'text-indigo-400'}`} />
                  Settings
                </h2>
                <p className="text-slate-400 text-sm">Manage your AI experience and preferences.</p>
              </div>

              {/* Appearance Section */}
              <section className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'galaxy' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Appearance</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setTheme('default')}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left gap-2 ${
                      theme === 'default' 
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100 shadow-lg shadow-indigo-500/10' 
                        : 'border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">Deep Space</span>
                      {theme === 'default' && <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-xs opacity-70">A clean, focused interface with deep blue accents and subtle bubble animations.</span>
                  </button>

                  <button 
                    onClick={() => setTheme('galaxy')}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left gap-2 ${
                      theme === 'galaxy' 
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-lg shadow-amber-500/10' 
                        : 'border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">Galaxy Orbit</span>
                      {theme === 'galaxy' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <span className="text-xs opacity-70">An immersive celestial experience with a rotating solar system and starfield tail.</span>
                  </button>
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
              </section>

              {/* AI Engine Info */}
              <section className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'galaxy' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">AI Engine</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-slate-300">Active Model</span>
                    <span className={`text-xs font-mono px-2 py-1 rounded ${theme === 'galaxy' ? 'bg-amber-500/20 text-amber-200' : 'bg-slate-800 text-indigo-300'}`}>
                      {SELECTED_MODEL}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-slate-300">Device Status</span>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs text-emerald-400">WebGPU Accelerated</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/40 rounded-xl text-xs text-slate-400 leading-relaxed">
                    Sukhna-AI runs locally on your machine using the MLC LLM engine. No data is sent to external servers, ensuring 100% privacy and offline capability.
                  </div>
                </div>
              </section>

              {/* Data Management */}
              <section className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Data Management</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Clear your local storage to remove all chats and reset your preferences.</p>
                  <button 
                    onClick={() => setIsDeletingAll(true)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-all"
                  >
                    Clear All Chat History
                  </button>
                </div>
              </section>

              {/* About Section */}
              <section className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme === 'galaxy' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">About</h3>
                </div>
                
                <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                  <p>
                    Sukhna-AI is a visionary project created by <strong className={theme === 'galaxy' ? 'text-amber-400' : 'text-indigo-400'}>Lucky Pawar</strong> and <strong className={theme === 'galaxy' ? 'text-amber-400' : 'text-indigo-400'}>Sahil Chadha</strong>.
                  </p>
                  <p>
                    This application demonstrates the power of modern web technologies, enabling LLMs to run directly in the browser with high performance and zero latency, while maintaining absolute user privacy.
                  </p>
                  <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
                    <span>Version 1.2.0</span>
                    <span>Built with React & WebGPU</span>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  </div>
);
}

export default App;
