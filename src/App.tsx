import React, { useState, useEffect, useMemo, FormEvent, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { 
  Plus, 
  Settings, 
  Search, 
  Mail, 
  Clock, 
  Calendar, 
  Camera, 
  Map, 
  MessageCircle, 
  Music, 
  Ghost,
  X,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Battery,
  Wifi,
  Signal,
  LayoutGrid,
  Zap,
  Lock,
  StickyNote,
  Image as ImageIcon,
  Chrome,
  Phone,
  ShoppingBag,
  Download,
  Check,
  Star,
  Gamepad2,
  Video,
  Youtube,
  Monitor,
  Play,
  Home,
  ChevronDown,
  Car,
  Trophy,
  Divide,
  Layers,
  Volume2,
  Moon,
  Sun,
  Bluetooth,
  Plane,
  Calculator,
  Type,
  Keyboard,
  Palette,
  Brush,
  PenTool,
  Square,
  Circle,
  Triangle,
  Shapes,
  Files,
  Undo,
  Redo,
  Cloud,
  CloudRain,
  SunMedium,
  Compass,
  MapPin,
  Navigation,
  Timer,
  SkipBack,
  SkipForward,
  PlayCircle,
  PauseCircle,
  Thermometer,
  Wind,
  Droplets,
  Disc,
  Code,
  Terminal,
  Activity,
  TrendingUp,
  ListTodo,
  BookOpen,
  Heart,
  Target,
  ArrowUpRight,
  Grid2X2,
  Hash,
  Box,
  Newspaper,
  User,
  Podcast,
  Home as HomeIcon,
  Wallet,
  Scissors,
  Ruler,
  HelpCircle,
  Lightbulb,
  SearchCode,
  Languages,
  Book,
  Shield,
  CreditCard,
  Briefcase,
  FlaskConical,
  GraduationCap,
  HardDrive,
  Cpu,
  MousePointer2,
  Table,
  HeartPulse,
  Sprout,
  Waves,
  Mountain,
  Rocket,
  Bug,
  Brain,
  Dumbbell,
  Gamepad,
  Coffee,
  Ticket,
  Gavel,
  Scale,
  Atom,
  Microscope,
  Stethoscope,
  Umbrella,
  Footprints,
  ArrowUp,
  Axe,
  Sword,
  ShieldAlert,
  Skull,
  Ghost as GhostIcon,
  Tent,
  Trees,
  CloudLightning,
  Flame,
  Droplet,
  Snowflake,
  Wind as WindIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Star as StarIcon,
  Target as TargetIcon,
  Zap as ZapIcon,
  Bomb,
  Rocket as RocketIcon,
  Plane as PlaneIcon,
  Car as CarIcon,
  Bike,
  Ship,
  Anchor,
  Compass as CompassIcon,
  Map as MapIcon,
  Camera as CameraIcon,
  Mic,
  Music as MusicIcon,
  Speaker,
  Headphones,
  Gamepad as GamepadIcon,
  Monitor as MonitorIcon,
  Smartphone,
  Watch,
  BatteryCharging,
  Wifi as WifiIcon,
} from 'lucide-react';
import { AppConfig } from './types';

// Context for shared state
interface SystemContextType {
  wallpaper: string;
  setWallpaper: (url: string) => void;
  installedApps: AppConfig[];
  installApp: (app: AppConfig) => void;
  setActiveAppId: (id: string | null) => void;
  setIsLocked: (locked: boolean) => void;
  deviceName: string;
  setDeviceName: (name: string) => void;
  // System States
  isWifiOn: boolean;
  setIsWifiOn: (v: boolean) => void;
  isAirplaneMode: boolean;
  setIsAirplaneMode: (v: boolean) => void;
  isBatterySaver: boolean;
  setIsBatterySaver: (v: boolean) => void;
  isBluetoothOn: boolean;
  setIsBluetoothOn: (v: boolean) => void;
  brightness: number;
  setBrightness: (v: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  // Music State
  nowPlaying: { title: string; artist: string; cover: string } | null;
  setNowPlaying: (v: { title: string; artist: string; cover: string } | null) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
}

const SystemContext = createContext<SystemContextType | null>(null);

const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within SystemProvider');
  return context;
};

// Mock Apps
const NotesApp = () => (
  <div className="p-6 h-full bg-white text-gray-800">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold">Notes</h2>
      <button className="p-2 bg-amber-50 rounded-full text-amber-600 hover:bg-amber-100 transition-colors">
        <Plus size={24} />
      </button>
    </div>
    <div className="space-y-4">
      {[ 'Shopping List', 'Project Ideas', 'Meeting Notes', 'Vacation Plans' ].map((note, i) => (
        <div key={i} className="p-4 bg-amber-50 rounded-xl border border-amber-100 hover:shadow-md transition-all cursor-pointer">
          <h3 className="font-semibold">{note}</h3>
          <p className="text-sm text-gray-500 mt-1">Updated {i + 1} day(s) ago</p>
        </div>
      ))}
    </div>
  </div>
);

const PhotosApp = () => {
  const { setWallpaper } = useSystem();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState(false);
  const correctPin = '0505';

  const images = useMemo(() => Array.from({ length: 10000 }).map((_, i) => ({
    id: i,
    url: `https://picsum.photos/seed/photo-${i}/800/600`
  })), []);

  if (!isUnlocked) {
    return (
      <div className="h-full bg-black flex flex-col items-center justify-center p-8 text-white relative">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 p-10 rounded-[40px] border border-white/10 shadow-2xl flex flex-col items-center max-w-sm w-full backdrop-blur-xl"
        >
          <div className="w-24 h-24 bg-white rounded-[28px] flex items-center justify-center mb-8 shadow-2xl overflow-hidden">
             <img src="https://picsum.photos/seed/gallery/200/200" className="w-full h-full object-cover opacity-80" />
          </div>
          <h2 className="text-3xl font-black mb-2 tracking-tighter">Galarea</h2>
          <p className="text-gray-400 text-sm mb-10 text-center font-medium">Xavfsizlik uchun parolni kiriting</p>
          
          <motion.div 
            animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
            className="flex gap-4 mb-12"
          >
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full border-2 border-white/30 transition-all ${inputPin.length > i ? (error ? 'bg-red-500 border-red-500' : 'bg-white border-white scale-125') : ''}`} 
              />
            ))}
          </motion.div>

          <div className="grid grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
              <button 
                key={n}
                onClick={() => {
                  if (inputPin.length < 4) {
                    const next = inputPin + n;
                    setInputPin(next);
                    if (next === correctPin) {
                      setIsUnlocked(true);
                    } else if (next.length === 4) {
                      setError(true);
                      setTimeout(() => { setInputPin(''); setError(false); }, 500);
                    }
                  }
                }}
                className={`w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all font-black text-2xl flex items-center justify-center border border-white/10 ${n === 0 ? 'col-start-2' : ''}`}
              >
                {n}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setInputPin('')}
            className="mt-8 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            Tozalash
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full bg-black text-white overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-black py-2 z-10 border-b border-white/10">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">All Photos</h2>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{images.length.toLocaleString()} Items</span>
        </div>
        <span className="text-blue-500 text-sm font-medium cursor-pointer">Select</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-1">
        {images.slice(0, 500).map((img) => (
          <motion.div 
            key={img.id} 
            whileHover={{ scale: 0.98 }}
            onClick={() => setSelectedId(img.id)}
            className="aspect-square bg-gray-900 overflow-hidden relative group cursor-pointer"
          >
            <img 
              src={img.url} 
              alt={`Photo ${img.id}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
      
      {images.length > 500 && (
         <div className="py-20 text-center">
            <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em]">va yana {(images.length - 500).toLocaleString()} ta rasm...</p>
         </div>
      )}

      <AnimatePresence>
        {selectedId !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-black flex flex-col pt-10"
          >
             <div className="flex justify-between items-center p-4 border-b border-white/10">
                <button onClick={() => setSelectedId(null)} className="text-blue-500 font-medium">Close</button>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                       setWallpaper(images[selectedId].url);
                       setSelectedId(null);
                    }}
                    className="bg-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-500"
                  >
                    Set as Wallpaper
                  </button>
                </div>
             </div>
             <div className="flex-1 flex items-center justify-center p-4">
                <img 
                  src={images[selectedId].url} 
                  alt="Selected" 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                  referrerPolicy="no-referrer"
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Settings App Component
const SettingsApp = () => {
  const [wifi, setWifi] = useState(true);
  const [performance, setPerformance] = useState(false);
  const [bluetooth, setBluetooth] = useState(true);

  return (
    <div className="h-full bg-[#f2f2f7] text-black overflow-y-auto">
      <div className="px-6 py-8">
        <h2 className="text-3xl font-bold mb-6">Settings</h2>
        
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-6">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-1.5 rounded-lg text-white"><Wifi size={20} /></div>
              <span className="font-medium">Wi-Fi</span>
            </div>
            <div 
              onClick={() => setWifi(!wifi)}
              className={`w-12 h-7 rounded-full relative p-1 transition-colors cursor-pointer ${wifi ? 'bg-green-500' : 'bg-gray-200'}`}
            >
               <motion.div 
                 animate={{ x: wifi ? 20 : 0 }}
                 className="w-5 h-5 bg-white rounded-full shadow-sm" 
               />
            </div>
          </div>
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Phone size={20} /></div>
              <span className="font-medium">Bluetooth</span>
            </div>
            <div 
              onClick={() => setBluetooth(!bluetooth)}
              className={`w-12 h-7 rounded-full relative p-1 transition-colors cursor-pointer ${bluetooth ? 'bg-green-500' : 'bg-gray-200'}`}
            >
               <motion.div 
                 animate={{ x: bluetooth ? 20 : 0 }}
                 className="w-5 h-5 bg-white rounded-full shadow-sm" 
               />
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-1.5 rounded-lg text-white"><Zap size={20} /></div>
              <span className="font-medium">Performance Mode</span>
            </div>
            <div 
              onClick={() => setPerformance(!performance)}
              className={`w-12 h-7 rounded-full relative p-1 transition-colors cursor-pointer ${performance ? 'bg-green-500' : 'bg-gray-200'}`}
            >
               <motion.div 
                 animate={{ x: performance ? 20 : 0 }}
                 className="w-5 h-5 bg-white rounded-full shadow-sm" 
               />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/10">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-gray-400 p-1.5 rounded-lg text-white"><Battery size={20} /></div>
              <span className="font-medium">Battery Health</span>
            </div>
            <span className="text-gray-400">100%</span>
          </div>
          <div className="p-4 flex items-center justify-between">
             <span className="text-sm text-gray-500">Your battery is performing at peak capability. High performance mode is {performance ? 'active' : 'inactive'}.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Safari App Component
const SafariApp = () => {
  const [url, setUrl] = useState('google.com');
  const [inputUrl, setInputUrl] = useState('google.com');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setUrl(inputUrl);
    if (!searchHistory.includes(inputUrl)) setSearchHistory([inputUrl, ...searchHistory.slice(0, 4)]);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="bg-[#f2f2f7] p-3 flex items-center gap-4 border-b border-gray-200">
        <div className="flex gap-2">
          <ChevronLeft 
            size={20} 
            className="text-gray-400 cursor-pointer hover:text-blue-500" 
            onClick={() => { setUrl('google.com'); setInputUrl('google.com'); }}
          />
          <ChevronRight size={20} className="text-gray-400" />
        </div>
        <form onSubmit={handleSearch} className="flex-1">
          <div className="bg-white rounded-lg py-1.5 px-4 text-sm text-gray-600 flex items-center gap-2 shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20">
            <Search size={14} className="text-gray-400" />
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-transparent outline-none text-center font-medium"
              placeholder="Search or enter website"
            />
          </div>
        </form>
        <Plus size={20} className="text-blue-500 cursor-pointer hover:bg-white/50 rounded p-0.5 transition-colors" />
      </div>
      
      <div className="flex-1 relative bg-white">
        {isRefreshing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="flex flex-col items-center gap-3">
               <div className="animate-spin text-blue-500"><Zap size={32} /></div>
               <p className="text-sm text-gray-400 animate-pulse">Loading {inputUrl}...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center p-8 bg-gray-50 overflow-y-auto hidden-scrollbar">
             {url.toLowerCase().includes('google.com') ? (
                <div className="flex flex-col items-center w-full max-w-lg mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <h1 className="text-6xl font-bold mb-10 select-none tracking-tighter">
                     <span className="text-blue-500">G</span>
                     <span className="text-red-500">o</span>
                     <span className="text-yellow-500">o</span>
                     <span className="text-blue-500">g</span>
                     <span className="text-green-500">l</span>
                     <span className="text-red-500">e</span>
                   </h1>
                   <div className="w-full bg-white shadow-lg border border-gray-100 rounded-full py-4 px-8 flex items-center gap-4 mb-6 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                      <Search size={22} className="text-gray-400" />
                      <input 
                        type="text" 
                        className="flex-1 outline-none text-lg text-gray-700" 
                        placeholder="Search Google or type a URL"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value;
                            setUrl(val);
                            setInputUrl(val);
                            if (!searchHistory.includes(val)) setSearchHistory([val, ...searchHistory.slice(0, 4)]);
                          }
                        }}
                      />
                   </div>
                   <div className="flex gap-4">
                      <button className="bg-white border border-gray-200 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all shadow-sm">Googleda qidirish</button>
                      <button className="bg-white border border-gray-200 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all shadow-sm">Omadim keladi</button>
                   </div>

                   {searchHistory.length > 0 && (
                     <div className="mt-12 w-full text-left">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Oxirgi qidiruvlar</h4>
                        <div className="flex flex-wrap gap-2">
                           {searchHistory.map((s, i) => (
                             <button 
                               key={i} 
                               onClick={() => { setUrl(s); setInputUrl(s); }}
                               className="px-4 py-2 bg-white border border-gray-100 rounded-full text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                             >
                               {s}
                             </button>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
             ) : (
               <div className="space-y-8 w-full max-w-3xl py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-gray-100">
                      <Search size={40} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-extrabold text-gray-900">Qidiruv natijalari</h3>
                      <p className="text-gray-500 font-medium">"<span className="text-blue-600 font-bold">{url}</span>" bo'yicha eng yaxshi natijalar</p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    {[1,2,3,4,5,6].map(i => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-xl cursor-default transition-all group"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-green-700 mb-2 uppercase tracking-wide">
                           <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center"><Chrome size={12} /></div>
                           example-site.com/wiki/{url.replace(/\s+/g, '-').toLowerCase()}
                        </div>
                        <h4 className="text-xl font-bold text-blue-600 mb-2 group-hover:underline cursor-pointer">Best way to understand {url}: A Comprehensive Guide (2026)</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">Looking for details on {url}? Our experts Breakdown everything from basics to advanced topics. Discover why {url} is trending and how you can get started today with our free tutorial and resources.</p>
                      </motion.div>
                    ))}
                 </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

// Meta Apps implementation
const YouTubeApp = () => {
  const [view, setView] = useState<'home' | 'shorts' | 'watch'>('home');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const videos = [
    { id: 'h7Z-F-2u6A4', title: 'iPhone 15 Pro | Titanium | Apple', views: '84M views', time: '1 year ago', creator: 'Apple', avatar: 'A' },
    { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', views: '1.4B views', time: '14 years ago', creator: 'Rick Astley', avatar: 'R' },
    { id: 'vj9E5mJmZ2k', title: 'Introducing the new MacBook Air | Apple', views: '12M views', time: '6 months ago', creator: 'Apple', avatar: 'A' },
    { id: 'Z6v9127J7pY', title: 'Sora: First Impressions', views: '5M views', time: '2 weeks ago', creator: 'OpenAI', avatar: 'O' },
    { id: 'y881t8ilMyc', title: 'FREE GUY | Official Trailer | 20th Century Studios', views: '35M views', time: '3 years ago', creator: '20th Century Studios', avatar: '2' },
    { id: 'htwreOAmN_0', title: 'Study Music - Deep Focus', views: '150M views', time: '2 years ago', creator: 'Lofi Girl', avatar: 'L' },
    { id: '5NV6Rdv1a3I', title: 'Dune | Official Trailer', views: '50M views', time: '4 years ago', creator: 'Warner Bros.', avatar: 'W' },
    { id: '9bZkp7q19f0', title: 'PSY - GANGNAM STYLE (강남스타일) M/V', views: '5B views', time: '11 years ago', creator: 'officialpsy', avatar: 'P' },
    { id: 'mS_6S6qC_k8', title: 'The iPad Pro M4 Thinness', views: '2M views', time: '1 month ago', creator: 'Marques Brownlee', avatar: 'M' }
  ];

  const filteredVideos = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const shorts = [
    { id: 's1', videoId: 'dQw4w9WgXcQ', likes: '1.2M' },
    { id: 's2', videoId: 'h7Z-F-2u6A4', likes: '3.4M' },
    { id: 's3', videoId: 'Z6v9127J7pY', likes: '500K' },
    { id: 's4', videoId: 'vj9E5mJmZ2k', likes: '890K' }
  ];

  return (
    <div className="h-full bg-[#0f0f0f] text-white flex flex-col font-sans">
      {/* Navbar */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#0f0f0f] z-20">
         <div className="flex items-center gap-1 cursor-pointer" onClick={() => { setView('home'); setSelectedVideo(null); }}>
            <Youtube className="text-red-600" fill="currentColor" size={32} />
            <span className="font-bold text-2xl tracking-tighter">YouTube</span>
         </div>
         
         <div className="flex-1 max-w-2xl mx-8">
            <div className="flex bg-[#121212] border border-white/10 rounded-full overflow-hidden group focus-within:border-blue-500 transition-all shadow-inner">
               <div className="flex-1 flex items-center px-6 gap-3">
                  <Search size={18} className="text-gray-500 group-focus-within:text-blue-500" />
                  <input 
                    type="text" 
                    placeholder="Search" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-base w-full py-2.5" 
                  />
               </div>
               <button className="bg-white/5 px-8 border-l border-white/10 hover:bg-white/10 transition-colors">
                  <Search size={20} />
               </button>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <Video className="cursor-pointer hover:text-white/80" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg border border-white/10">M</div>
         </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/5 bg-[#0f0f0f] p-4 flex flex-col gap-2 overflow-y-auto hidden-scrollbar">
           <button onClick={() => { setView('home'); setSelectedVideo(null); }} className={`w-full flex items-center gap-6 px-4 py-3 rounded-xl transition-all ${view === 'home' && !selectedVideo ? 'bg-white/10 font-bold' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
              <Home size={22} />
              <span className="text-sm">Home</span>
           </button>
           <button onClick={() => { setView('shorts'); setSelectedVideo(null); }} className={`w-full flex items-center gap-6 px-4 py-3 rounded-xl transition-all ${view === 'shorts' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
              <Zap size={22} />
              <span className="text-sm">Shorts</span>
           </button>
           <div className="h-[1px] bg-white/5 my-4 mx-4" />
           <p className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Library</p>
           <button className="w-full flex items-center gap-6 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
              <Clock size={22} />
              <span className="text-sm">History</span>
           </button>
           <button className="w-full flex items-center gap-6 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
              <Play size={22} />
              <span className="text-sm">Your videos</span>
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 hidden-scrollbar bg-[#0f0f0f]">
          <AnimatePresence mode="wait">
            {selectedVideo ? (
              <motion.div 
                key="player"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="max-w-6xl mx-auto"
              >
                 <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/5">
                   <iframe 
                     className="w-full h-full"
                     src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`} 
                     title="YouTube video player"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                     allowFullScreen
                   />
                 </div>
                 <div className="mt-8">
                    <h2 className="text-2xl font-black mb-4 tracking-tight leading-tight">{selectedVideo.title}</h2>
                    <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold text-xl">{selectedVideo.avatar}</div>
                          <div>
                             <p className="font-bold text-lg">{selectedVideo.creator}</p>
                             <p className="text-xs text-gray-500">1.2M subscribers</p>
                          </div>
                          <button className="ml-6 px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-white/90 transition-all">Subscribe</button>
                       </div>
                       <div className="flex items-center gap-2">
                          <button className="px-6 py-2.5 bg-white/10 rounded-full font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                             <Zap size={18} fill="currentColor" /> {selectedVideo.views}
                          </button>
                          <button className="px-6 py-2.5 bg-white/10 rounded-full font-bold text-sm hover:bg-white/20 transition-all">Share</button>
                       </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                       <p className="font-bold text-sm mb-2">{selectedVideo.views} • {selectedVideo.time}</p>
                       <p className="text-sm text-gray-300 leading-relaxed">
                         Experience the future of video content on YouTube. This video showcases incredible technology and digital creativity.
                         Check out our other videos for more amazing updates!
                       </p>
                    </div>
                 </div>
              </motion.div>
            ) : view === 'home' ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12"
              >
                 {filteredVideos.map(v => (
                   <div key={v.id} className="group cursor-pointer" onClick={() => setSelectedVideo(v)}>
                      <div className="relative aspect-video rounded-3xl overflow-hidden mb-4 shadow-xl border border-white/5">
                         <img 
                           src={`https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                           referrerPolicy="no-referrer"
                           onError={(e: any) => e.target.src = `https://img.youtube.com/vi/${v.id}/0.jpg`}
                         />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                         <div className="absolute bottom-3 right-3 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-black tabular-nums">12:45</div>
                      </div>
                      <div className="flex gap-4">
                         <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 shrink-0 border border-white/10 flex items-center justify-center font-bold text-lg shadow-inner">{v.avatar}</div>
                         <div className="flex-1">
                            <h4 className="font-black text-lg line-clamp-2 tracking-tight group-hover:text-blue-200 transition-colors">{v.title}</h4>
                            <p className="text-sm text-gray-500 mt-2 font-medium">{v.creator} • {v.views} • {v.time}</p>
                         </div>
                      </div>
                   </div>
                 ))}
                 {filteredVideos.length === 0 && (
                    <div className="col-span-full h-80 flex flex-col items-center justify-center text-gray-500 italic opacity-40">
                       <Search size={64} className="mb-4" />
                       <p className="text-xl font-bold">No results found for "{searchQuery}"</p>
                    </div>
                 )}
              </motion.div>
            ) : (
              <motion.div 
                key="shorts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              >
                 {shorts.map(s => (
                   <div key={s.id} className="relative aspect-[9/16] rounded-3xl overflow-hidden group shadow-2xl border border-white/10 cursor-pointer">
                      <img 
                        src={`https://img.youtube.com/vi/${s.videoId}/0.jpg`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                         <p className="font-black text-lg drop-shadow-lg line-clamp-2 tracking-tight">EPIC VIRAL MOMENT #{s.id.toUpperCase()}</p>
                         <div className="flex items-center gap-2 mt-2 opacity-80 text-sm font-bold">
                            <Zap size={14} fill="white" />
                            {s.likes} likes
                         </div>
                      </div>
                   </div>
                 ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const TelegramApp = () => {
  const [msg, setMsg] = useState('');
  const [bgUrl, setBgUrl] = useState('https://picsum.photos/seed/tgbg/1000/1000');
  const [showBgSettings, setShowBgSettings] = useState(false);
  const [activeChatId, setActiveChatId] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }), []);

  const initialChats = [
    { id: 0, name: 'OTABEK', status: 'online', avatar: 'O', color: 'bg-indigo-500', messages: [{ id: 1, text: "SALOM! ISHLAR QALAY?", sender: 'them', time: '10:45' }] },
    { id: 1, name: 'USTOZ', status: 'online', avatar: 'U', color: 'bg-green-500', messages: [{ id: 1, text: "XUSH KELIBSIZ! SAVOLINGIZ BORMI?", sender: 'them', time: '09:00' }] },
    { id: 2, name: 'NAJOT TALIM', status: '4,500 MEMBERS', avatar: 'N', color: 'bg-blue-500', messages: [{ id: 1, text: "YANGI LOYIHA TAYYOR!", sender: 'them', time: '08:30' }] },
    { id: 3, name: 'MAKTAB', status: 'online', avatar: 'M', color: 'bg-orange-500', messages: [{ id: 1, text: "BUGUN DARS SOAT 14:00 DA.", sender: 'them', time: '10:15' }] },
  ];

  const [chats, setChats] = useState(initialChats);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || isTyping) return;

    const userMsg = msg.trim();
    const currentChatName = chats.find(c => c.id === activeChatId)?.name || 'DO\'ST';
    
    const newMsg = { 
      id: Date.now(), 
      text: userMsg.toUpperCase(), 
      sender: 'me', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return { ...c, messages: [...c.messages, newMsg] };
      }
      return c;
    }));

    setMsg('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: `Siz Telegram messangeridagi ${currentChatName} ismli foydalanuvchisiz. Foydalanuvchi bilan samimiy va aqlli muloqot qiling (ChatGPT kabi). JAVOBLARINGIZ FAQAT KATTA HARFLARDA (ALL CAPS) BO'LSIN. Qisqa va lo'nda javob bering.`,
        }
      });

      const replyText = response.text || "TUSHUNARLI.";

      const replyMsg = { 
        id: Date.now() + 1, 
        text: replyText.toUpperCase(), 
        sender: 'them', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };

      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return { ...c, messages: [...c.messages, replyMsg] };
        }
        return c;
      }));
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const bgOptions = [
    'https://picsum.photos/seed/stars/1000/1000',
    'https://picsum.photos/seed/forest/1000/1000',
    'https://picsum.photos/seed/city/1000/1000',
    'https://picsum.photos/seed/gradient/1000/1000',
    'https://picsum.photos/seed/abstract/1000/1000',
  ];

  const currentChat = chats.find(c => c.id === activeChatId)!;

  return (
    <div className="h-full bg-[#1e2732] text-white flex flex-col md:flex-row relative">
      <div className="w-full md:w-80 border-r border-white/5 bg-[#17212b] flex flex-col shrink-0">
         <div className="p-4 flex gap-4 items-center">
            <LayoutGrid className="text-gray-400 cursor-pointer" onClick={() => setShowBgSettings(!showBgSettings)} />
            <div className="flex-1 bg-white/5 rounded-lg px-3 py-1.5 text-sm flex items-center gap-2">
               <Search size={14} className="opacity-40" />
               <input type="text" placeholder="Qidiruv" className="bg-transparent outline-none" />
            </div>
         </div>
         <div className="flex-1 overflow-y-auto">
            {chats.map((c) => (
              <div 
                key={c.id} 
                onClick={() => setActiveChatId(c.id)}
                className={`p-4 flex gap-3 hover:bg-white/5 cursor-pointer ${c.id === activeChatId ? 'bg-[#2b5278]' : ''}`}
              >
                 <div className={`w-12 h-12 rounded-full ${c.color} shrink-0 flex items-center justify-center font-bold`}>{c.avatar}</div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                       <span className="font-bold text-sm truncate">{c.name}</span>
                       <span className="text-[10px] opacity-40">11:00</span>
                    </div>
                    <p className="text-xs opacity-60 truncate">{c.messages[c.messages.length - 1]?.text || "No messages"}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>

      <div className="flex-1 flex flex-col relative bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url(${bgUrl})` }}>
         <div className="absolute inset-0 bg-black/40 -z-10" />
         
         <div className="p-4 bg-[#17212b]/80 backdrop-blur-md border-b border-black/20 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-full ${currentChat.color} flex items-center justify-center font-bold`}>{currentChat.avatar}</div>
               <div>
                  <h4 className="font-bold text-sm">{currentChat.name}</h4>
                <p className="text-xs text-blue-400">{isTyping ? 'YOZISHYAPTI...' : currentChat.status}</p>
             </div>
            </div>
            <div className="flex gap-4">
               <ImageIcon size={20} className="text-gray-400 cursor-pointer hover:text-white" onClick={() => setShowBgSettings(!showBgSettings)} />
               <Settings size={20} className="text-gray-400" />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10 hidden-scrollbar">
            {currentChat.messages.map(c => (
              <div key={c.id} className={`flex ${c.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[75%] p-3 px-4 rounded-2xl relative shadow-md backdrop-blur-sm ${c.sender === 'me' ? 'bg-[#2b5278]/90 text-white rounded-br-none' : 'bg-[#182533]/90 text-white rounded-bl-none'}`}>
                    <p className="text-sm leading-relaxed">{c.text}</p>
                    <div className="flex justify-end items-center gap-1 mt-1">
                       <span className="text-[9px] opacity-50">{c.time}</span>
                       {c.sender === 'me' && <Check size={10} className="text-blue-300" />}
                    </div>
                 </div>
              </div>
            ))}
         </div>

         <form onSubmit={send} className="p-4 bg-[#17212b]/95 backdrop-blur-xl flex gap-3 items-center z-20">
            <Plus className="text-gray-400 cursor-pointer" />
            <input 
              value={msg} 
              onChange={e => setMsg(e.target.value)}
              placeholder="XABAR YOZING..." 
              className="flex-1 bg-transparent outline-none text-sm text-white" 
            />
            <button type="submit" className="text-blue-500 font-bold hover:text-blue-400 transition-colors">YUBORISH</button>
         </form>

         <AnimatePresence>
            {showBgSettings && (
               <motion.div 
                 initial={{ opacity: 0, x: 100 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 100 }}
                 className="absolute right-0 top-16 bottom-16 w-64 bg-[#17212b] z-30 shadow-2xl p-6 border-l border-white/10"
               >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold">Fon Sozlamalari</h3>
                    <X size={18} className="cursor-pointer" onClick={() => setShowBgSettings(false)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     {bgOptions.map((url, i) => (
                        <div 
                          key={i} 
                          onClick={() => setBgUrl(url)}
                          className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${bgUrl === url ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                           <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                     ))}
                  </div>
                  <button 
                    onClick={() => setBgUrl(`https://picsum.photos/seed/${Math.random()}/1000/1000`)}
                    className="mt-6 w-full py-2 bg-blue-600 rounded-lg text-sm font-bold hover:bg-blue-500"
                  >
                    Random Fon
                  </button>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

const ShooterGameApp = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const targetGenerator = setInterval(() => {
      setTargets(prev => [
        ...prev,
        { 
          id: Date.now(), 
          x: Math.random() * 80 + 10, 
          y: Math.random() * 80 + 10, 
          size: Math.random() * 30 + 30 
        }
      ].slice(-10));
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(targetGenerator);
    };
  }, [gameOver]);

  return (
    <div className="h-full bg-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden cursor-crosshair">
      <div className="absolute top-6 left-6 text-white">
        <p className="text-xs font-bold opacity-50 uppercase tracking-widest">Score</p>
        <h3 className="text-4xl font-black">{score}</h3>
      </div>
      <div className="absolute top-6 right-6 text-white text-right">
        <p className="text-xs font-bold opacity-50 uppercase tracking-widest">Time</p>
        <h3 className={`text-4xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}s</h3>
      </div>

      <div className="w-full h-full relative border-4 border-white/5 rounded-[40px] bg-black/20">
        <AnimatePresence>
          {targets.map(t => (
            <motion.button
              key={t.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setScore(s => s + 100);
                setTargets(prev => prev.filter(tar => tar.id !== t.id));
              }}
              style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.size, height: t.size }}
              className="absolute bg-red-500 border-4 border-white rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center"
            >
              <div className="w-1/2 h-1/2 bg-white rounded-full opacity-50" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center"
          >
            <h2 className="text-7xl font-black text-white mb-4 tracking-tighter">FINISH!</h2>
            <p className="text-3xl text-red-500 font-bold mb-10">Total: {score} pts</p>
            <button 
              onClick={() => {
                setScore(0);
                setTimeLeft(30);
                setGameOver(false);
                setTargets([]);
              }}
              className="px-12 py-4 bg-white text-black rounded-full font-black text-2xl hover:bg-gray-200 transition-all active:scale-95 shadow-2xl"
            >
              PLAY AGAIN
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CarGameApp = () => {
  const [carPos, setCarPos] = useState(50);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setCarPos(p => Math.max(10, p - 10));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setCarPos(p => Math.min(90, p + 10));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setScore(s => s + 1);
      setObstacles(obs => {
        const nextObs = obs.map(o => ({ ...o, y: o.y + 5 })).filter(o => o.y < 400);
        if (Math.random() > 0.9) nextObs.push({ id: Date.now(), x: Math.random() * 80 + 10, y: -50 });
        return nextObs;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    obstacles.forEach(o => {
      if (Math.abs(o.x - carPos) < 10 && Math.abs(o.y - 320) < 30) {
        setGameOver(true);
      }
    });
  }, [obstacles, carPos]);

  return (
    <div className="h-full bg-slate-900 flex flex-col items-center justify-center p-8 overflow-hidden relative">
      <div className="absolute top-4 left-4 text-white font-bold text-2xl z-20">Score: {score}</div>
      
      <div className="relative w-64 h-96 bg-gray-800 border-x-4 border-dashed border-white/20 overflow-hidden">
         {/* Road Stripes */}
         <div className="absolute inset-0 flex flex-col justify-around opacity-10">
            {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-white w-2 mx-auto" />)}
         </div>

         {/* Car */}
         <motion.div 
           animate={{ x: `${carPos}%` }}
           className="absolute bottom-10 left-[-15px] text-red-500"
         >
            <Phone size={40} className="rotate-0 fill-current" /> {/* Using Phone as a car shape for fun */}
         </motion.div>

         {/* Obstacles */}
         {obstacles.map(o => (
            <div 
              key={o.id} 
              style={{ left: `${o.x}%`, top: `${o.y}px` }}
              className="absolute w-8 h-12 bg-yellow-500 rounded shadow-lg flex items-center justify-center text-xs"
            >
               🚧
            </div>
         ))}
      </div>

      <div className="flex gap-10 mt-10 z-20">
         <button onPointerDown={() => setCarPos(p => Math.max(10, p - 10))} className="p-6 bg-white/10 rounded-full hover:bg-white/20"><ChevronLeft size={48} className="text-white" /></button>
         <button onPointerDown={() => setCarPos(p => Math.min(90, p + 10))} className="p-6 bg-white/10 rounded-full hover:bg-white/20"><ChevronRight size={48} className="text-white" /></button>
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center"
          >
             <h2 className="text-6xl font-black text-white mb-4">GAME OVER!</h2>
             <p className="text-2xl text-blue-400 mb-10">Final Score: {score}</p>
             <button 
               onClick={() => { setGameOver(false); setScore(0); setObstacles([]); }}
               className="px-10 py-4 bg-blue-600 text-white rounded-full font-black text-xl hover:bg-blue-500 active:scale-95 transition-all"
             >
               TRY AGAIN
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TrafficRacerApp = () => {
  const [carPos, setCarPos] = useState(1); // 0, 1, 2 lanes
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [obstacles, setObstacles] = useState<{ id: number; lane: number; y: number; type: string }[]>([]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setScore(s => s + 1);
      setSpeed(s => Math.min(15, 5 + Math.floor(score / 500)));
      setObstacles(obs => {
        const nextObs = obs.map(o => ({ ...o, y: o.y + speed })).filter(o => o.y < 600);
        if (Math.random() > 0.95 && nextObs.length < 5) {
          nextObs.push({ 
            id: Date.now(), 
            lane: Math.floor(Math.random() * 3), 
            y: -200,
            type: Math.random() > 0.5 ? 'truck' : 'car'
          });
        }
        return nextObs;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameOver, score, speed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setCarPos(p => Math.max(0, p - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setCarPos(p => Math.min(2, p + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    obstacles.forEach(o => {
      if (o.lane === carPos && o.y > 380 && o.y < 520) {
        setGameOver(true);
      }
    });
  }, [obstacles, carPos]);

  const laneX = [20, 50, 80];

  return (
    <div className="h-full bg-zinc-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-6 left-6 text-white z-20">
        <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Score</p>
        <h3 className="text-3xl font-black italic">{score}</h3>
      </div>
      
      {/* Highway */}
      <div className="relative w-80 h-[500px] bg-zinc-800 border-x-8 border-zinc-700 overflow-hidden shadow-2xl">
        {/* Road Markings */}
        <div className="absolute inset-0 flex justify-around">
          <div className="w-0.5 h-full border-l-2 border-dashed border-white/20" />
          <div className="w-0.5 h-full border-l-2 border-dashed border-white/20" />
        </div>

        {/* Player Car */}
        <motion.div 
          animate={{ x: `${laneX[carPos]}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute bottom-12 left-[-20px] text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        >
          <Car size={40} className="rotate-0 fill-current" strokeWidth={2.5} />
        </motion.div>

        {/* Enemies */}
        {obstacles.map(o => (
          <motion.div 
            key={o.id} 
            style={{ left: `${laneX[o.lane]}%`, top: `${o.y}px` }}
            className={`absolute left-[-20px] ${o.type === 'truck' ? 'text-orange-500' : 'text-red-500'}`}
          >
            <Car size={o.type === 'truck' ? 48 : 40} className="rotate-180 fill-current" />
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-8 flex gap-12 z-20">
        <button onPointerDown={() => setCarPos(p => Math.max(0, p - 1))} className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all outline-none border border-white/10">
          <ChevronLeft size={40} className="text-white" />
        </button>
        <button onPointerDown={() => setCarPos(p => Math.min(2, p + 1))} className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all outline-none border border-white/10">
          <ChevronRight size={40} className="text-white" />
        </button>
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-10"
          >
            <Trophy size={80} className="text-yellow-500 mb-6 drop-shadow-lg" />
            <h2 className="text-5xl font-black text-white mb-2 italic">CRASHED!</h2>
            <p className="text-xl text-zinc-400 mb-10 font-medium">Final Distance: {score}m</p>
            <button 
              onClick={() => { setGameOver(false); setScore(0); setObstacles([]); setSpeed(5); }}
              className="px-12 py-4 bg-yellow-500 text-black rounded-full font-black text-xl hover:bg-yellow-400 active:scale-95 transition-all shadow-xl"
            >
              RESTART RACE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TwoPlayerGame = () => {
  const [pos, setPos] = useState(50);
  const [winner, setWinner] = useState<number | null>(null);

  const move = (player: number) => {
    if (winner) return;
    setPos(p => {
      const next = p + (player === 1 ? -2 : 2);
      if (next <= 0) setWinner(1);
      if (next >= 100) setWinner(2);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
       <div className="flex-1 flex flex-col">
          {/* Player 1 Side */}
          <div 
            onClick={() => move(1)}
            className="flex-1 bg-red-600 flex items-center justify-center cursor-pointer active:bg-red-700 transition-colors"
          >
             <span className="text-4xl font-black text-white rotate-180">TAP PLAYER 1</span>
          </div>
          {/* Progress Bar */}
          <div className="h-12 bg-white flex relative border-y-4 border-black">
             <motion.div 
               animate={{ left: `${pos}%` }}
               className="absolute top-0 bottom-0 w-4 bg-black -ml-2" 
             />
          </div>
          {/* Player 2 Side */}
          <div 
            onClick={() => move(2)}
            className="flex-1 bg-blue-600 flex items-center justify-center cursor-pointer active:bg-blue-700 transition-colors"
          >
             <span className="text-4xl font-black text-white">TAP PLAYER 2</span>
          </div>
       </div>

       <AnimatePresence>
         {winner && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-10 text-center"
            >
               <h2 className={`text-7xl font-black mb-6 ${winner === 1 ? 'text-red-500' : 'text-blue-500'}`}>
                 PLAYER {winner} WINS!
               </h2>
               <button onClick={() => { setWinner(null); setPos(50); }} className="bg-white text-black px-12 py-4 rounded-full font-black text-2xl">PLAY AGAIN</button>
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

const SnakeGameApp = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [dir, setDir] = useState({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir.y === 0) setDir({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir.y === 0) setDir({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir.x === 0) setDir({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir.x === 0) setDir({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const move = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || prev.find(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prev;
        }
        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(move);
  }, [dir, food, gameOver]);

  return (
    <div className="h-full bg-green-950 flex flex-col items-center justify-center p-8 text-white relative">
      <div className="absolute top-4 left-6 text-2xl font-black text-green-400">Snake: {score}</div>
      <div className="grid grid-cols-20 grid-rows-20 w-[400px] h-[400px] bg-black/40 border-4 border-green-800 rounded-lg relative overflow-hidden">
        {snake.map((s, i) => (
          <div key={i} style={{ left: `${s.x * 5}%`, top: `${s.y * 5}%` }} className={`absolute w-[5%] h-[5%] ${i === 0 ? 'bg-green-400' : 'bg-green-600'} rounded-sm`} />
        ))}
        <div style={{ left: `${food.x * 5}%`, top: `${food.y * 5}%` }} className="absolute w-[5%] h-[5%] bg-red-500 rounded-full animate-pulse" />
      </div>
      <div className="mt-10 grid grid-cols-3 gap-4">
        <div />
        <button onClick={() => dir.y === 0 && setDir({ x: 0, y: -1 })} className="p-4 bg-white/10 rounded-xl">▲</button>
        <div />
        <button onClick={() => dir.x === 0 && setDir({ x: -1, y: 0 })} className="p-4 bg-white/10 rounded-xl">◀</button>
        <button onClick={() => dir.y === 0 && setDir({ x: 0, y: 1 })} className="p-4 bg-white/10 rounded-xl">▼</button>
        <button onClick={() => dir.x === 0 && setDir({ x: 1, y: 0 })} className="p-4 bg-white/10 rounded-xl">▶</button>
      </div>
      {gameOver && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
          <h2 className="text-6xl font-black mb-4 text-red-500 tracking-tighter uppercase">Krashed!</h2>
          <button onClick={() => { setGameOver(false); setSnake([{ x: 10, y: 10 }]); setScore(0); }} className="bg-green-500 text-white px-10 py-3 rounded-full font-bold">Restart</button>
        </div>
      )}
    </div>
  );
};

const MemoryGameApp = () => {
  const emojis = ['🚗', '🚕', '🚌', '🏎️', '🏍️', '🚲', '🛸', '🚀'];
  const generateCards = () => [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, flipped: false, solved: false }));
  
  const [cards, setCards] = useState(generateCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (flipped.length === 2) {
      setIsProcessing(true);
      const [f1, f2] = flipped;
      
      if (cards[f1].emoji === cards[f2].emoji) {
        setCards(prev => prev.map((c, i) => (i === f1 || i === f2 ? { ...c, solved: true } : c)));
        setScores(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer as 1 | 2] + 1 }));
        setFlipped([]);
        setIsProcessing(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setCurrentPlayer(prev => prev === 1 ? 2 : 1);
          setIsProcessing(false);
        }, 1000);
      }
    }
  }, [flipped, cards, currentPlayer]);

  const resetGame = () => {
    setCards(generateCards());
    setScores({ 1: 0, 2: 0 });
    setCurrentPlayer(1);
    setFlipped([]);
  };

  const isGameOver = cards.every(c => c.solved);
  const winner = scores[1] > scores[2] ? 'O\'yinchi 1' : scores[2] > scores[1] ? 'O\'yinchi 2' : 'Durang';

  return (
    <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 flex flex-col items-center">
        <h2 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">Memory Match Duo</h2>
        
        <div className="flex w-full justify-between items-center mb-8 gap-4">
          <div className={`flex-1 p-4 rounded-3xl transition-all duration-300 ${currentPlayer === 1 ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-500'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">O'yinchi 1</p>
            <p className="text-2xl font-black">{scores[1]}</p>
          </div>
          <div className="text-slate-300 font-black">VS</div>
          <div className={`flex-1 p-4 rounded-3xl transition-all duration-300 ${currentPlayer === 2 ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-500'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">O'yinchi 2</p>
            <p className="text-2xl font-black">{scores[2]}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {cards.map((c, i) => (
            <button 
              key={i}
              disabled={c.solved || flipped.includes(i) || isProcessing}
              onClick={() => flipped.length < 2 && setFlipped([...flipped, i])}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-3xl font-bold flex items-center justify-center transition-all duration-500 transform ${c.solved ? 'bg-indigo-100 text-indigo-600 rotate-0 scale-95 opacity-50' : flipped.includes(i) ? 'bg-white border-2 border-slate-200 text-current rotate-0' : 'bg-slate-200 text-transparent rotate-180 hover:bg-slate-300'}`}
            >
              <span className={flipped.includes(i) || c.solved ? 'scale-100' : 'scale-0'}>
                {c.emoji}
              </span>
              {!(flipped.includes(i) || c.solved) && <div className="text-slate-400 rotate-180">?</div>}
            </button>
          ))}
        </div>

        {isGameOver && (
          <div className="mt-8 text-center animate-bounce">
            <p className="text-2xl font-black text-indigo-600 mb-4">
              {scores[1] === scores[2] ? "Durang! 🤝" : `${winner} G'alaba qozondi! 🎉`}
            </p>
            <button onClick={resetGame} className="px-8 py-3 bg-slate-900 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl">
              Yana o'ynash
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares: any[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return squares.every(s => s) ? 'Draw' : null;
  };

  const winner = calculateWinner(board);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-indigo-900 text-white p-8">
      <h2 className="text-4xl font-bold mb-8">Tic Tac Toe</h2>
      <div className="grid grid-cols-3 gap-3 bg-white/10 p-4 rounded-2xl shadow-2xl">
         {board.map((s, i) => (
           <button 
             key={i} 
             onClick={() => {
               if (winner || board[i]) return;
               const nextBoard = [...board];
               nextBoard[i] = xIsNext ? 'X' : 'O';
               setBoard(nextBoard);
               setXIsNext(!xIsNext);
             }}
             className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-xl text-3xl font-black transition-all flex items-center justify-center"
           >
             {s}
           </button>
         ))}
      </div>
      <div className="mt-8 text-xl font-bold">
         {winner ? (winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner}`) : `Next: ${xIsNext ? 'X' : 'O'}`}
      </div>
      {(winner || board.some(s => s)) && (
        <button onClick={() => setBoard(Array(9).fill(null))} className="mt-6 bg-white text-indigo-900 px-6 py-2 rounded-full font-bold hover:bg-white/90">Restart</button>
      )}
    </div>
  );
};

const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  
  const handleNumber = (n: string) => {
    setDisplay(prev => prev === '0' ? n : prev + n);
  };

  const handleOp = (op: string) => {
    setExpression(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const result = eval(expression + display);
      setDisplay(String(result));
      setExpression('');
    } catch {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  return (
    <div className="h-full bg-black flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-[320px] bg-zinc-900 rounded-[40px] p-6 shadow-2xl border border-white/5">
        <div className="text-right mb-4 px-4">
          <p className="text-white/40 text-sm h-6 font-mono truncate">{expression}</p>
          <p className="text-white text-6xl font-light tracking-tighter truncate tabular-nums">{display}</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <button onClick={clear} className="w-14 h-14 bg-zinc-400 rounded-full text-black font-bold text-xl hover:bg-zinc-300">AC</button>
          <button className="w-14 h-14 bg-zinc-400 rounded-full text-black font-bold text-xl hover:bg-zinc-300">±</button>
          <button className="w-14 h-14 bg-zinc-400 rounded-full text-black font-bold text-xl hover:bg-zinc-300">%</button>
          <button onClick={() => handleOp('/')} className="w-14 h-14 bg-orange-500 rounded-full text-white font-bold text-2xl hover:bg-orange-400">÷</button>
          
          {[7, 8, 9].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="w-14 h-14 bg-zinc-700 rounded-full text-white font-bold text-2xl hover:bg-zinc-600">{n}</button>)}
          <button onClick={() => handleOp('*')} className="w-14 h-14 bg-orange-500 rounded-full text-white font-bold text-2xl hover:bg-orange-400">×</button>
          
          {[4, 5, 6].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="w-14 h-14 bg-zinc-700 rounded-full text-white font-bold text-2xl hover:bg-zinc-600">{n}</button>)}
          <button onClick={() => handleOp('-')} className="w-14 h-14 bg-orange-500 rounded-full text-white font-bold text-2xl hover:bg-orange-400">-</button>
          
          {[1, 2, 3].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="w-14 h-14 bg-zinc-700 rounded-full text-white font-bold text-2xl hover:bg-zinc-600">{n}</button>)}
          <button onClick={() => handleOp('+')} className="w-14 h-14 bg-orange-500 rounded-full text-white font-bold text-2xl hover:bg-orange-400">+</button>
          
          <button onClick={() => handleNumber('0')} className="col-span-2 bg-zinc-700 rounded-full text-white font-bold text-2xl text-left px-8 hover:bg-zinc-600">0</button>
          <button onClick={() => handleNumber('.')} className="w-14 h-14 bg-zinc-700 rounded-full text-white font-bold text-2xl hover:bg-zinc-600">.</button>
          <button onClick={calculate} className="w-14 h-14 bg-orange-500 rounded-full text-white font-bold text-2xl hover:bg-orange-400">=</button>
        </div>
      </div>
    </div>
  );
};

const MathQuizApp = () => {
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState({ q: '', a: 0, options: [] as number[] });
  
  const generate = () => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const op = Math.random() > 0.5 ? '+' : '-';
    const ans = op === '+' ? a + b : a - b;
    const options = [ans, ans + 2, ans - 3, ans + 5].sort(() => Math.random() - 0.5);
    setQuestion({ q: `${a} ${op} ${b} = ?`, a: ans, options });
  };

  useEffect(() => { generate(); }, []);

  const handleAns = (val: number) => {
    if (val === question.a) {
      setScore(s => s + 1);
      generate();
    } else {
      setScore(0);
      generate();
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center p-8 text-white">
      <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[40px] border border-white/20 shadow-2xl w-full max-w-md text-center">
        <p className="text-xl font-bold opacity-60 uppercase tracking-widest mb-2">Score: {score}</p>
        <h2 className="text-6xl font-black mb-12 tracking-tight">{question.q}</h2>
        <div className="grid grid-cols-2 gap-4">
          {question.options.map((o, i) => (
            <button key={i} onClick={() => handleAns(o)} className="bg-white/10 hover:bg-white/20 border border-white/20 py-5 rounded-2xl text-2xl font-bold transition-all active:scale-95">
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const PianoApp = () => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];

  return (
    <div className="h-full bg-zinc-900 flex flex-col items-center justify-center p-8">
      <div className="relative flex shadow-2xl rounded-xl overflow-hidden border-4 border-black">
        {whiteKeys.map((key, i) => (
          <div key={key} className="relative group">
            <button
              onMouseDown={() => setActiveKey(key)}
              onMouseUp={() => setActiveKey(null)}
              onMouseLeave={() => setActiveKey(null)}
              className={`w-16 h-64 bg-white border-x border-black/10 transition-colors ${activeKey === key ? 'bg-zinc-200' : 'hover:bg-zinc-100'} rounded-b-lg flex items-end justify-center pb-4 text-xs font-bold text-gray-400`}
            >
              {key}
            </button>
            {blackKeys[i] && (
              <button
                onMouseDown={(e) => { e.stopPropagation(); setActiveKey(blackKeys[i]); }}
                onMouseUp={() => setActiveKey(null)}
                className={`absolute top-0 -right-5 w-10 h-40 bg-zinc-900 z-10 rounded-b-lg border border-black shadow-xl transition-colors ${activeKey === blackKeys[i] ? 'bg-zinc-700' : 'hover:bg-zinc-800'} flex items-end justify-center pb-4 text-[8px] font-bold text-white/40`}
              >
                {blackKeys[i]}
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="mt-8 text-white/20 font-mono text-xs tracking-widest uppercase">Tap notes to play (Simulator logic)</p>
    </div>
  );
};

const StopwatchApp = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => setTime(t => t + 10), 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centi = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centi.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full bg-black text-white p-10 flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center justify-center">
         <h2 className="text-[120px] font-thin tabular-nums leading-none mb-12">{formatTime(time)}</h2>
         <div className="flex gap-20 w-full max-w-sm">
            <button 
              onClick={() => isRunning ? setLaps([time, ...laps]) : (setTime(0), setLaps([]))}
              className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg hover:bg-zinc-700"
            >
              {isRunning ? 'Lap' : 'Reset'}
            </button>
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`w-24 h-24 rounded-full flex items-center justify-center font-bold text-lg ${isRunning ? 'bg-red-900/40 text-red-500' : 'bg-green-900/40 text-green-500'}`}
            >
              {isRunning ? 'Stop' : 'Start'}
            </button>
         </div>
      </div>
      <div className="h-64 overflow-y-auto border-t border-white/10 mt-10 p-4 space-y-4 hidden-scrollbar">
         {laps.map((lap, i) => (
           <div key={i} className="flex justify-between items-center text-xl font-medium px-4">
              <span className="text-white/40">Lap {laps.length - i}</span>
              <span className="tabular-nums">{formatTime(lap)}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

const WeatherApp = () => {
  const currentTemp = 24;
  const condition = 'Sunny';
  const hourly = Array.from({ length: 24 }).map((_, i) => ({ time: `${i}:00`, temp: 20 + Math.floor(Math.random() * 10), icon: i > 18 || i < 6 ? 'Moon' : 'Sun' }));

  return (
    <div className="h-full bg-gradient-to-b from-blue-400 to-blue-600 p-10 text-white font-sans overflow-y-auto hidden-scrollbar">
      <div className="text-center mb-16 pt-10">
         <h1 className="text-4xl font-black mb-2 tracking-tight">Toshkent</h1>
         <p className="text-[120px] font-thin leading-none tracking-tighter tabular-nums mb-2">{currentTemp}°</p>
         <p className="text-2xl font-bold opacity-60">{condition}</p>
         <div className="flex gap-4 justify-center mt-4">
            <span className="font-bold">H: 30°</span>
            <span className="font-bold opacity-60">L: 18°</span>
         </div>
      </div>

      <div className="bg-black/10 backdrop-blur-xl rounded-[32px] p-6 mb-8 border border-white/10">
         <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-6 px-2">Hourly Forecast</p>
         <div className="flex gap-8 overflow-x-auto pb-4 px-2 hidden-scrollbar">
            {hourly.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-4 min-w-[50px]">
                 <span className="text-xs font-bold opacity-60">{h.time}</span>
                 <IconComponent name={h.icon} size={24} />
                 <span className="text-xl font-bold text-center">{h.temp}°</span>
              </div>
            ))}
         </div>
      </div>

      <div className="bg-black/10 backdrop-blur-xl rounded-[32px] p-6 border border-white/10">
         <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-6 px-2">10-Day Forecast</p>
         {[ 'Bugun', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba' ].map((day, i) => (
           <div key={day} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 px-2">
              <span className="w-32 font-bold text-lg">{day}</span>
              <div className="flex-1 flex justify-center"><IconComponent name={i % 2 === 0 ? 'Cloud' : 'Sun'} size={24} /></div>
              <div className="w-32 flex justify-end gap-6 text-lg font-bold">
                 <span className="opacity-40">18°</span>
                 <span>30°</span>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

const SudokuApp = () => {
  const initialGrid = [
    [5, 3, null, null, 7, null, null, null, null],
    [6, null, null, 1, 9, 5, null, null, null],
    [null, 9, 8, null, null, null, null, 6, null],
    [8, null, null, null, 6, null, null, null, 3],
    [4, null, null, 8, null, 3, null, null, 1],
    [7, null, null, null, 2, null, null, null, 6],
    [null, 6, null, null, null, null, 2, 8, null],
    [null, null, null, 4, 1, 9, null, null, 5],
    [null, null, null, null, 8, null, null, 7, 9]
  ];
  const [grid, setGrid] = useState<any[][]>(JSON.parse(JSON.stringify(initialGrid)));
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const handleInput = (val: number) => {
    if (!selected) return;
    const [r, c] = selected;
    if (initialGrid[r][c] !== null) return;
    const next = [...grid];
    next[r][c] = val === 0 ? null : val;
    setGrid(next);
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-slate-200">
        <div className="grid grid-cols-9 border-2 border-slate-800">
          {grid.map((row, ri) => row.map((cell, ci) => (
            <button
              key={`${ri}-${ci}`}
              onClick={() => setSelected([ri, ci])}
              className={`w-10 h-10 sm:w-12 sm:h-12 border border-slate-200 flex items-center justify-center text-xl font-bold transition-all
                ${selected?.[0] === ri && selected?.[1] === ci ? 'bg-blue-100 ring-2 ring-blue-500 z-10' : 'bg-white hover:bg-slate-50'}
                ${ri % 3 === 2 && ri !== 8 ? 'border-b-2 border-b-slate-800' : ''}
                ${ci % 3 === 2 && ci !== 8 ? 'border-r-2 border-r-slate-800' : ''}
                ${initialGrid[ri][ci] !== null ? 'text-slate-800 bg-slate-100' : 'text-blue-600'}
              `}
            >
              {cell}
            </button>
          )))}
        </div>
        <div className="grid grid-cols-5 gap-3 mt-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
            <button key={n} onClick={() => handleInput(n)} className="w-12 h-12 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 active:scale-95 transition-all">
              {n === 0 ? 'C' : n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ConverterApp = () => {
  const [val, setVal] = useState('1');
  const [type, setType] = useState<'Length' | 'Weight' | 'Temp'>('Length');
  
  const conversions = {
    Length: { from: 'km', to: 'mile', rate: 0.621371 },
    Weight: { from: 'kg', to: 'lb', rate: 2.20462 },
    Temp: { from: 'C', to: 'F', offset: 32, rate: 1.8 }
  };

  const current = conversions[type];
  const result = type === 'Temp' 
    ? (Number(val) * current.rate + (current as any).offset).toFixed(1)
    : (Number(val) * current.rate).toFixed(2);

  return (
    <div className="h-full bg-[#f2f2f7] p-10 flex flex-col font-sans">
      <h2 className="text-4xl font-black mb-10 text-gray-900 tracking-tight">Converter</h2>
      <div className="flex gap-4 mb-10">
        {(['Length', 'Weight', 'Temp'] as const).map(t => (
          <button key={t} onClick={() => setType(t)} className={`px-6 py-3 rounded-2xl font-bold transition-all ${type === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-6 max-w-md">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
           <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{current.from}</p>
           <input 
             type="number" 
             value={val} 
             onChange={(e) => setVal(e.target.value)} 
             className="w-full text-5xl font-black outline-none bg-transparent tabular-nums"
           />
        </div>
        <div className="flex justify-center -my-3">
           <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl">
              <IconComponent name="Code" size={24} />
           </div>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[32px] shadow-xl text-white">
           <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">{current.to}</p>
           <p className="text-5xl font-black tabular-nums">{result}</p>
        </div>
      </div>
    </div>
  );
};

const LockScreen = ({ unlock }: { unlock: () => void }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const add = (n: number) => {
    if (pin.length >= 3) return;
    const next = pin + n;
    setPin(next);
    if (next.length === 3) {
      if (next === '777') {
        unlock();
      } else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 500);
      }
    }
  };

  const circles = [1, 2, 3];
  const numbers = [
    { n: 1, letters: '' }, { n: 2, letters: 'A B C' }, { n: 3, letters: 'D E F' },
    { n: 4, letters: 'G H I' }, { n: 5, letters: 'J K L' }, { n: 6, letters: 'M N O' },
    { n: 7, letters: 'P Q R S' }, { n: 8, letters: 'T U V' }, { n: 9, letters: 'W X Y Z' },
    { n: 0, letters: '' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-2xl flex flex-col items-center justify-center text-white"
    >
       {/* Ambient glow */}
       <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

       <div className="mb-12 text-center z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2 className="text-[120px] font-thin leading-none mb-2 tracking-tight tabular-nums drop-shadow-2xl">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </h2>
            <p className="text-2xl font-medium tracking-wide opacity-90 drop-shadow-md">
              {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
       </div>

       <div className="flex flex-col items-center z-10 w-full max-w-sm">
          <p className="text-lg font-semibold mb-8 tracking-wide">Parolni kiriting</p>
          
          <motion.div 
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            className="flex gap-6 mb-16"
          >
             {circles.map(i => (
               <div 
                 key={i} 
                 className={`w-4 h-4 rounded-full border-2 border-white/50 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)] ${pin.length >= i ? 'bg-white border-white scale-125' : 'bg-transparent'}`} 
               />
             ))}
          </motion.div>

          <div className="grid grid-cols-3 gap-x-8 gap-y-6">
             {numbers.map(n => (
               <motion.button 
                 key={n.n} 
                 whileTap={{ scale: 0.9, backgroundColor: "rgba(255,255,255,0.4)" }}
                 onClick={() => add(n.n)}
                 className={`group w-20 h-20 rounded-full bg-white/10 backdrop-blur-3xl border border-white/10 flex flex-col items-center justify-center transition-all ${n.n === 0 ? 'col-start-2' : ''}`}
               >
                 <span className="text-3xl font-normal leading-none">{n.n}</span>
                 {n.letters && <span className="text-[7px] font-black tracking-[0.2em] mt-1 text-white/40 group-hover:text-white/80">{n.letters}</span>}
               </motion.button>
             ))}
          </div>

          <div className="mt-16 flex gap-20">
             <button className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity uppercase tracking-[0.2em]">Favqulodda</button>
             <button onClick={() => setPin('')} className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity uppercase tracking-[0.2em]">O'chirish</button>
          </div>
       </div>

       {/* Home Hint */}
       <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-40">
          <div className="w-40 h-1.5 bg-white/40 rounded-full" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Ochish uchun tepaga suring</p>
       </div>
    </motion.div>
  );
};

const PlayMarketApp = () => {
  const { installApp, installedApps } = useSystem();
  
  const marketApps = useMemo(() => [
    { id: 'youtube', name: 'YouTube', icon: 'Youtube', color: 'bg-red-600', description: 'Watch videos and music.', component: <YouTubeApp /> },
    { id: 'telegram', name: 'Telegram', icon: 'MessageCircle', color: 'bg-blue-400', description: 'Cloud-based messaging.', component: <TelegramApp /> },
    { id: 'cargame', name: 'O\'yin: Car Racer', icon: 'Zap', color: 'bg-yellow-500', description: 'Fast car racing adventure!', component: <CarGameApp /> },
    { id: 'snake', name: 'O\'yin: Snake Pro', icon: 'Ghost', color: 'bg-green-600', description: 'Classic snake game.', component: <SnakeGameApp /> },
    { id: 'aichat', name: 'AI Chat', icon: 'Zap', color: 'bg-indigo-600', description: 'Intelligent AI assistant.', component: <AIChatApp /> },
    { id: 'doodle', name: 'Doodle', icon: 'Brush', color: 'bg-fuchsia-500', description: 'Creative drawing tool.', component: <DoodleApp /> },
    { id: 'minesweeper', name: 'O\'yin: Minesweeper', icon: 'Zap', color: 'bg-zinc-900', description: 'Classic puzzle game.', component: <MinesweeperApp /> },
    { id: 'flappy', name: 'O\'yin: Flappy Bird', icon: 'Zap', color: 'bg-sky-400', description: 'Fly through the pipes!', component: <FlappyGameApp /> },
    { id: 'translator', name: 'Translate', icon: 'Type', color: 'bg-slate-800', description: 'Speak every language.', component: <TranslatorApp /> },
    { id: 'files', name: 'Files', icon: 'Files', color: 'bg-white', description: 'Manage your documents.', component: <FilesApp /> },
    { id: 'memory', name: 'O\'yin: Memory Match', icon: 'LayoutGrid', color: 'bg-slate-700', description: 'Test your brain.', component: <MemoryGameApp /> },
    { id: '2player', name: 'O\'yin: 2 Player War', icon: 'Gamepad2', color: 'bg-orange-600', description: 'Fun game for two players!', component: <TwoPlayerGame /> },
    { id: 'tictactoe', name: 'O\'yin: Tic Tac Toe', icon: 'Gamepad2', color: 'bg-indigo-600', description: 'Classic strategy game.', component: <TicTacToe /> },
    { id: 'math', name: 'O\'yin: Math Quiz', icon: 'Plus', color: 'bg-blue-600', description: 'Test your math skills.', component: <MathQuizApp /> },
    { id: 'piano', name: 'Virtual Piano', icon: 'Music', color: 'bg-black', description: 'Play music on iPad.', component: <PianoApp /> },
    { id: 'calculator', name: 'Calculator', icon: 'Divide', color: 'bg-orange-500', description: 'Smart calculation tool.', component: <CalculatorApp /> },
    { id: 'weather', name: 'Weather', icon: 'Cloud', color: 'bg-sky-500', description: 'Global weather updates.', component: <WeatherApp /> },
    { id: 'stopwatch', name: 'Stopwatch', icon: 'Timer', color: 'bg-zinc-800', description: 'Precise time tracking.', component: <StopwatchApp /> },
    { id: 'sudoku', name: 'O\'yin: Sudoku', icon: 'LayoutGrid', color: 'bg-slate-300', description: 'Train your brain.', component: <SudokuApp /> },
    { id: 'converter', name: 'Converter', icon: 'Code', color: 'bg-gray-800', description: 'Unit conversion tool.', component: <ConverterApp /> },
    { id: 'finance', name: 'Finance', icon: 'TrendingUp', color: 'bg-slate-900', description: 'Track your investments.', component: <FinanceApp /> },
    { id: 'health', name: 'Health', icon: 'Activity', color: 'bg-red-600', description: 'Monitor your activity.', component: <HealthApp /> },
    { id: 'wordle', name: 'O\'yin: Wordle', icon: 'Grid2X2', color: 'bg-green-500', description: 'Daily word puzzle.', component: <WordleGame /> },
    { id: 'game2048', name: 'O\'yin: 2048', icon: 'Hash', color: 'bg-orange-400', description: 'Merge tiles to reach 2048.', component: <Game2048 /> },
    { id: 'reminders', name: 'Reminders', icon: 'ListTodo', color: 'bg-white', description: 'Stay organized.', component: <RemindersApp /> },
    { id: 'books', name: 'Books', icon: 'BookOpen', color: 'bg-orange-700', description: 'Library of books.', component: <BooksApp /> },
    { id: 'stocks', name: 'Stocks', icon: 'TrendingUp', color: 'bg-black', description: 'Market real-time data.', component: <StocksApp /> },
    { id: 'news', name: 'News', icon: 'Newspaper', color: 'bg-white', description: 'Global top stories.', component: <NewsApp /> },
    { id: 'contacts', name: 'Contacts', icon: 'User', color: 'bg-white', description: 'Manage your network.', component: <ContactsApp /> },
    { id: 'fitness', name: 'Fitness', icon: 'Activity', color: 'bg-black', description: 'Track your health.', component: <FitnessApp /> },
    { id: 'podcast', name: 'Podcasts', icon: 'Podcast', color: 'bg-white', description: 'Listen to your favorites.', component: <PodcastApp /> },
    { id: 'stickman', name: 'O\'yin: Stick Runner', icon: 'User', color: 'bg-sky-400', description: 'Epic stickman race.', component: <StickmanGame /> },
    { id: 'bricks', name: 'O\'yin: Brick Master', icon: 'Grid2X2', color: 'bg-slate-900', description: 'Break all the bricks.', component: <BrickBreakerGame /> },
    { id: 'compass', name: 'Compass', icon: 'Compass', color: 'bg-black', description: 'Find your direction.', component: <CompassApp /> },
    { id: 'memos', name: 'Voice Memos', icon: 'Disc', color: 'bg-white', description: 'Record your thoughts.', component: <VoiceMemosApp /> },
    { id: 'invaders', name: 'O\'yin: Invaders', icon: 'Ghost', color: 'bg-black', description: 'Defend the galaxy.', component: <SpaceInvadersGame /> },
    { id: 'home', name: 'Home', icon: 'HomeIcon', color: 'bg-slate-50', description: 'Smart home control.', component: <HomeApp /> },
    { id: 'wallet', name: 'Wallet', icon: 'Wallet', color: 'bg-black', description: 'Your digital wallet.', component: <WalletApp /> },
    { id: 'measure', name: 'Measure', icon: 'Ruler', color: 'bg-black', description: 'AR measurement tool.', component: <MeasureApp /> },
    { id: 'pong', name: 'O\'yin: Retro Pong', icon: 'Zap', color: 'bg-zinc-800', description: 'Classic arcade pong.', component: <PongGame /> },
    { id: 'hangman', name: 'O\'yin: Hangman', icon: 'Type', color: 'bg-amber-100', description: 'Guess the hidden word.', component: <HangmanGame /> },
    { id: 'space_adv', name: 'O\'yin: Space Adv', icon: 'Rocket', color: 'bg-slate-950', description: 'Explore deep space.', component: <SpaceAdventureGame /> },
    { id: 'chess', name: 'O\'yin: Chess PRO', icon: 'Ghost', color: 'bg-slate-700', description: 'Grandmaster chess.', component: <ChessGame /> },
    { id: 'solitaire', name: 'O\'yin: Solitaire', icon: 'Layers', color: 'bg-green-700', description: 'Classic card game.', component: <SolitaireGame /> },
    { id: 'crossword', name: 'O\'yin: Crossword', icon: 'Hash', color: 'bg-white', description: 'Daily puzzles.', component: <CrosswordGame /> },
    { id: 'pacman', name: 'O\'yin: Pacman', icon: 'Circle', color: 'bg-yellow-400', description: 'Retro arcade fun.', component: <PacmanGame /> },
    { id: 'tower', name: 'O\'yin: Defense', icon: 'Shield', color: 'bg-brown-600', description: 'Kingdom strategy.', component: <TowerDefenseGame /> },
    { id: 'platform', name: 'O\'yin: Platformer', icon: 'Triangle', color: 'bg-blue-500', description: 'Jump and run.', component: <PlatformerGame /> },
    { id: 'bubble', name: 'O\'yin: Bubbles', icon: 'Circle', color: 'bg-pink-400', description: 'Burst all bubbles.', component: <BubbleShooterGame /> },
    { id: 'pinball', name: 'O\'yin: Pinball', icon: 'Zap', color: 'bg-zinc-900', description: 'High speed action.', component: <PinballGame /> },
    { id: 'simon', name: 'O\'yin: Simon Says', icon: 'Zap', color: 'bg-black', description: 'Follow the pattern.', component: <SimonSaysGame /> },
    { id: 'whack', name: 'O\'yin: Whack Mole', icon: 'Ghost', color: 'bg-green-800', description: 'Fast reaction game.', component: <WhackAMoleGame /> },
    { id: 'stocks_pro', name: 'Stocks+', icon: 'TrendingUp', color: 'bg-indigo-900', description: 'Advanced analysis.', component: <StocksApp_Details /> },
    { id: 'news_global', name: 'BBC News', icon: 'Newspaper', color: 'bg-red-700', description: 'World wide reports.', component: <NewsApp_Regional /> },
    { id: 'support', name: 'Support', icon: 'HelpCircle', color: 'bg-blue-600', description: 'Customer help.', component: <ContactSupportApp /> },
    { id: 'fitness_max', name: 'Fitness+', icon: 'Dumbbell', color: 'bg-zinc-800', description: 'Max intensity.', component: <FitnessProApp /> },
    { id: 'pod_studio', name: 'Studio', icon: 'Podcast', color: 'bg-indigo-600', description: 'Podcast production.', component: <PodcastStudioApp /> },
    { id: 'measure_p', name: 'Measure v2', icon: 'Scissors', color: 'bg-amber-600', description: 'Pro measurement.', component: <Measure_ExpertApp /> },
    { id: 'home_adv', name: 'Home Hub', icon: 'HomeIcon', color: 'bg-sky-700', description: 'Global automation.', component: <Home_ControlApp /> },
    { id: 'wallet_cr', name: 'Crypto', icon: 'CreditCard', color: 'bg-orange-500', description: 'Crypto wallet.', component: <WalletPlusApp /> },
    { id: 'trans_v2', name: 'Quick Trans', icon: 'Languages', color: 'bg-slate-700', description: 'Fast translation.', component: <Translation_v2App /> },
    { id: 'reader', name: 'E-Reader', icon: 'Book', color: 'bg-green-600', description: 'Library at hand.', component: <Book_ReaderApp /> },
    { id: 'color_match', name: 'O\'yin: Color Match', icon: 'Palette', color: 'bg-indigo-600', description: 'Match the colors fast.', component: <ColorMatchGame /> },
    { id: 'num_slide', name: 'O\'yin: Num Slide', icon: 'Grid2X2', color: 'bg-orange-500', description: 'Slide numbers in order.', component: <NumberSlideGame /> },
    { id: 'mem_tiles', name: 'O\'yin: Mem Tiles', icon: 'HelpCircle', color: 'bg-zinc-800', description: 'Test your memory.', component: <MemoryTilesGame /> },
    { id: 'reaction', name: 'O\'yin: Reaction', icon: 'ZapIcon', color: 'bg-red-500', description: 'How fast are you?', component: <ReactionTestGame /> },
    { id: 'balance', name: 'O\'yin: Balance', icon: 'TargetIcon', color: 'bg-sky-400', description: 'Keep the ball balanced.', component: <BallBalanceGame /> },
    { id: 'tower_stack', name: 'O\'yin: Tower', icon: 'Layers', color: 'bg-emerald-500', description: 'Stack the blocks high.', component: <TowerStackGame /> },
    { id: 'fruit', name: 'O\'yin: Fruit Slasher', icon: 'Sword', color: 'bg-amber-500', description: 'Cut all the fruits.', component: <FruitSlasherGame /> },
    { id: 'racing_pro', name: 'O\'yin: Racing Pro', icon: 'CarIcon', color: 'bg-zinc-700', description: 'High speed racing.', component: <RacingProGame /> },
    { id: 'desert_run', name: 'O\'yin: Desert Run', icon: 'SunIcon', color: 'bg-amber-300', description: 'Run through the desert.', component: <DesertRunGame /> },
    { id: 'arctic', name: 'O\'yin: Arctic Adv', icon: 'Snowflake', color: 'bg-blue-200', description: 'Explore the cold.', component: <ArcticAdvGame /> },
    { id: 'tank', name: 'O\'yin: Tank Battle', icon: 'ShieldAlert', color: 'bg-green-900', description: 'Destroy all tanks.', component: <TankBattleGame /> },
    { id: 'pixel_quest', name: 'O\'yin: PixelQuest', icon: 'GamepadIcon', color: 'bg-blue-600', description: 'Retro pixel quest.', component: <PixelQuestGame /> },
    { id: 'alien', name: 'O\'yin: Alien Hunter', icon: 'GhostIcon', color: 'bg-indigo-900', description: 'Hunt the aliens.', component: <AlienHunterGame /> },
    { id: 'zombie', name: 'O\'yin: Zombies', icon: 'Skull', color: 'bg-gray-800', description: 'Survive the horde.', component: <ZombieSurviveGame /> },
    { id: 'knight', name: 'O\'yin: Knight', icon: 'Sword', color: 'bg-slate-300', description: 'Epic knight quest.', component: <KnightQuestGame /> },
    { id: 'ninja_s', name: 'O\'yin: Stealth', icon: 'MoonIcon', color: 'bg-black', description: 'Ninja stealth action.', component: <NinjaStealthGame /> },
    { id: 'robot_war', name: 'O\'yin: Robot War', icon: 'Cpu', color: 'bg-zinc-400', description: 'War of the machines.', component: <RobotWarGame /> },
    { id: 'portal', name: 'O\'yin: Portals', icon: 'Circle', color: 'bg-blue-500', description: 'Jump through portals.', component: <PortalJumpGame /> },
    { id: 'gravity', name: 'O\'yin: Gravity', icon: 'ArrowUp', color: 'bg-white', description: 'Defy the gravity.', component: <GravityRushGame /> },
    { id: 'time', name: 'O\'yin: Time Travel', icon: 'Clock', color: 'bg-purple-900', description: 'Master the time.', component: <TimeTravelGame /> },
    { id: 'ghost_b', name: 'O\'yin: Busters', icon: 'GhostIcon', color: 'bg-zinc-900', description: 'Catch all ghosts.', component: <GhostBusterGame /> },
    { id: 'monster', name: 'O\'yin: Monsters', icon: 'Skull', color: 'bg-pink-600', description: 'Monster mash fun.', component: <MonsterMashGame /> },
    { id: 'dino', name: 'O\'yin: Dino Run', icon: 'Footprints', color: 'bg-yellow-200', description: 'Dino arcade run.', component: <DinoRunGame /> },
    { id: 'star_f', name: 'O\'yin: Star Fighter', icon: 'StarIcon', color: 'bg-black', description: 'Defend the stars.', component: <StarFighterGame /> },
    { id: 'treasure', name: 'O\'yin: Hunt', icon: 'Bomb', color: 'bg-amber-700', description: 'Find hidden gold.', component: <TreasureHuntGame /> },
    { id: 'deep_sea', name: 'O\'yin: Deep Sea', icon: 'Droplet', color: 'bg-blue-900', description: 'Explore the depths.', component: <DeepSeaGame /> },
    { id: 'volcano', name: 'O\'yin: Volcano', icon: 'Flame', color: 'bg-red-900', description: 'Escape the lava.', component: <VolcanicEscapeGame /> },
    { id: 'cyber', name: 'O\'yin: Cyber City', icon: 'ZapIcon', color: 'bg-black', description: 'Neon city quest.', component: <CyberCityGame /> },
    { id: 'kingdom', name: 'O\'yin: Kingdom', icon: 'HomeIcon', color: 'bg-violet-200', description: 'Magic kingdom.', component: <MagicKingdomGame /> },
    { id: 'dragon', name: 'O\'yin: Dragon', icon: 'Flame', color: 'bg-orange-900', description: 'Fly the dragon.', component: <DragonFlightGame /> },
    { id: 'jungle', name: 'O\'yin: Jungle', icon: 'Trees', color: 'bg-green-200', description: 'Jungle platformer.', component: <JungleJumpGame /> },
    { id: 'mega_jump', name: 'O\'yin: Mega Jump', icon: 'ArrowUp', color: 'bg-sky-500', description: 'Reach the clouds.', component: <MegaJumpGame /> },
    { id: 'sky_dive', name: 'O\'yin: Sky Dive', icon: 'WindIcon', color: 'bg-blue-400', description: 'Extreme skydiving.', component: <SkyDiveGame /> },
    { id: 'uni', name: 'O\'yin: Parallel', icon: 'Shapes', color: 'bg-zinc-950', description: 'Parallel universe.', component: <ParallelUniGame /> },
    { id: 'dungeon', name: 'O\'yin: Dungeon', icon: 'Axe', color: 'bg-zinc-800', description: 'Crawl the dungeon.', component: <DungeonCrawlGame /> },
    { id: 'card_wars', name: 'O\'yin: Card Wars', icon: 'CreditCard', color: 'bg-white', description: 'Epic card battles.', component: <CardWarsGame /> },
    { id: 'samurai', name: 'O\'yin: Samurai', icon: 'Sword', color: 'bg-red-800', description: 'Legendary duels.', component: <SamuraiDuelGame /> },
    { id: 'ninja_d', name: 'O\'yin: Dash', icon: 'ZapIcon', color: 'bg-black', description: 'Fast ninja action.', component: <NinjaDashGame /> },
    { id: 'cyberpunk', name: 'O\'yin: Cyberpunk', icon: 'Cpu', color: 'bg-black', description: 'Future is now.', component: <CyberPunkGame /> },
    { id: 'neon_race', name: 'O\'yin: Neon Race', icon: 'ZapIcon', color: 'bg-black', description: 'Retro neon race.', component: <NeonRaceGame /> },
    ...Array.from({ length: 15 }).map((_, i) => ({
      id: `app-${i + 10}`,
      name: `Play App ${i + 1}`,
      icon: 'LayoutGrid',
      color: 'bg-indigo-500',
      description: `New fun app for you #${i + 1}.`,
      component: <div className="p-10 text-center font-bold text-gray-500">Bu ilova muvaffaqiyatli ishlamoqda!</div>
    }))
  ], [installedApps]);

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
         <h2 className="text-3xl font-bold flex items-center gap-2">
           <ShoppingBag className="text-blue-500" size={32} />
           Play Market
         </h2>
         <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <input type="text" placeholder="Apps and Games" className="bg-transparent outline-none text-sm w-32" />
         </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 hidden-scrollbar">
         <section>
            <h3 className="text-xl font-bold mb-4">Trending (100+ items)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-black">
               {marketApps.map(app => {
                 const isInstalled = installedApps.some(a => a.id === app.id);
                 return (
                   <div key={app.id} className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 hover:bg-gray-100 transition-colors border border-gray-100">
                      <div className={`${app.color} w-16 h-16 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm`}>
                         <IconComponent name={app.icon} size={32} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="font-bold truncate">{app.name}</h4>
                         <p className="text-xs text-gray-500 truncate">{app.description}</p>
                      </div>
                      <button 
                        disabled={isInstalled}
                        onClick={() => installApp({ 
                          ...app, 
                          color: app.color.split(' ')[0],
                          component: app.component || <div className="p-10 text-center text-gray-400">{app.name} works!</div> 
                        } as any)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          isInstalled 
                          ? 'bg-gray-200 text-gray-400' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        }`}
                      >
                         {isInstalled ? <Check size={16} /> : 'Get'}
                      </button>
                   </div>
                 );
               })}
            </div>
         </section>
      </div>
    </div>
  );
};

const WallpaperApp = () => {
  const { setWallpaper, wallpaper } = useSystem();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState(false);
  
  const correctPin = '0505';

  const categories = useMemo(() => [
    { 
      name: 'Abstract', 
      seeds: Array.from({ length: 3334 }).map((_, i) => `abstract-${i + 1}`) 
    },
    { 
      name: 'System Code', 
      isCode: true,
      seeds: [ 'main-logic', 'kernel-init', 'bootload', 'sys-config' ]
    },
    { 
      name: 'Nature', 
      seeds: Array.from({ length: 3333 }).map((_, i) => `nature-${i + 1}`) 
    },
    { 
      name: 'Space', 
      seeds: Array.from({ length: 3333 }).map((_, i) => `space-${i + 1}`) 
    },
  ], []);

  if (!isUnlocked) {
    return (
      <div className="h-full bg-slate-900 flex flex-col items-center justify-center p-8 text-white relative">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 p-10 rounded-[40px] border border-white/10 shadow-2xl flex flex-col items-center max-w-sm w-full backdrop-blur-xl"
        >
          <div className="w-24 h-24 bg-indigo-500 rounded-[28px] flex items-center justify-center mb-8 shadow-2xl">
             <Zap size={48} className="fill-white" />
          </div>
          <h2 className="text-3xl font-black mb-2 tracking-tighter">Fon Rasmlari</h2>
          <p className="text-gray-400 text-sm mb-10 text-center font-medium">4 raqamli parolni kiriting</p>
          
          <motion.div 
            animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
            className="flex gap-4 mb-12"
          >
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full border-2 border-white/30 transition-all ${inputPin.length > i ? (error ? 'bg-red-500 border-red-500' : 'bg-indigo-500 border-indigo-500 scale-125') : ''}`} 
              />
            ))}
          </motion.div>

          <div className="grid grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
              <button 
                key={n}
                onClick={() => {
                  if (inputPin.length < 4) {
                    const next = inputPin + n;
                    setInputPin(next);
                    if (next === correctPin) {
                      setIsUnlocked(true);
                    } else if (next.length === 4) {
                      setError(true);
                      setTimeout(() => { setInputPin(''); setError(false); }, 500);
                    }
                  }
                }}
                className={`w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all font-black text-2xl flex items-center justify-center border border-white/10 ${n === 0 ? 'col-start-2' : ''}`}
              >
                {n}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setInputPin('')}
            className="mt-8 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            Tozalash
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      <div className="p-8 border-b border-gray-200 bg-white">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Wallpapers</h2>
        <p className="text-gray-500 font-medium mt-1">Choose a look that defines your style</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 space-y-12 hidden-scrollbar">
        <section>
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Current Wallpaper</h3>
           <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img src={wallpaper} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                 <div className="px-6 py-2 bg-white/20 backdrop-blur-xl rounded-full text-white font-bold text-sm border border-white/30">Active</div>
              </div>
           </div>
        </section>

        {categories.map(cat => (
          <section key={cat.name}>
             <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-black text-gray-800">{cat.name}</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{cat.seeds.length.toLocaleString()} WALLPAPERS</span>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {cat.seeds.slice(0, 50).map(seed => {
                  const url = (cat as any).isCode ? `CODE_W_REF_${seed}` : `https://picsum.photos/seed/${seed}/1920/1080`;
                  const isCodeWallpaper = url.startsWith('CODE_W_REF_');
                  
                  return (
                    <motion.div 
                      key={seed}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setWallpaper(url)}
                      className={`relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${wallpaper === url ? 'border-blue-500 shadow-lg' : 'border-white shadow-sm'}`}
                    >
                       {isCodeWallpaper ? (
                         <div className="w-full h-full bg-[#1a1b26] p-4 font-mono text-[6px] overflow-hidden text-blue-300">
                           <p className="text-gray-500 mb-2">// {seed}.ts</p>
                           <p className="text-pink-400">import</p> {'{'} iPad {'}'} <p className="text-pink-400">from</p> './Muhammadyusuf';
                           <p className="text-pink-400">import</p> {'{'} Kernel {'}'} <p className="text-pink-400">from</p> '@core';
                           <br />
                           <p className="text-yellow-400 font-bold">export const</p> App = () ={'>'} {'{'}
                           <br />
                           &nbsp;&nbsp;<p className="text-gray-500">/* Meta Kernel */</p>
                           <br />
                           &nbsp;&nbsp;&lt;!doctype html&gt;
                           <br />
                           &nbsp;&nbsp;&lt;html lang="uz"&gt;
                           <br />
                           &nbsp;&nbsp;&nbsp;&nbsp;&lt;head&gt;
                           <br />
                           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;title&gt;iPad Pro&lt;/title&gt;
                           <br />
                           &nbsp;&nbsp;&nbsp;&nbsp;&lt;/head&gt;
                         </div>
                       ) : (
                         <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                       )}
                       {wallpaper === url && (
                         <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <Check className="text-white" size={32} strokeWidth={3} />
                         </div>
                       )}
                    </motion.div>
                  );
                })}
             </div>
             {cat.seeds.length > 50 && (
                <div className="mt-8 text-center">
                   <p className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.4em]">... va yana {(cat.seeds.length - 50).toLocaleString()} ta rasm</p>
                </div>
             )}
          </section>
        ))}
      </div>
    </div>
  );
};

const CalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const daysArr = [];
    for (let i = 0; i < startDay; i++) daysArr.push(null);
    for (let i = 1; i <= totalDays; i++) daysArr.push(i);
    return daysArr;
  }, [year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setViewMode('month');
  };

  const isToday = (day: number | null, m = month, y = year) => {
    if (!day) return false;
    const today = new Date();
    return today.getDate() === day && today.getMonth() === m && today.getFullYear() === y;
  };

  const MonthGrid = ({ m, y }: { m: number, y: number }) => {
    const totalDays = daysInMonth(y, m);
    const startDay = firstDayOfMonth(y, m);
    const monthDays = [];
    for (let i = 0; i < startDay; i++) monthDays.push(null);
    for (let i = 1; i <= totalDays; i++) monthDays.push(i);

    return (
      <button 
        onClick={() => {
          setCurrentDate(new Date(y, m, 1));
          setViewMode('month');
        }}
        className="flex flex-col gap-2 cursor-pointer hover:bg-gray-50/50 p-4 rounded-3xl transition-all border border-transparent hover:border-gray-100/50 group"
      >
        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 group-hover:scale-110 transition-transform origin-left">{monthNames[m]}</h4>
        <div className="grid grid-cols-7 gap-1">
          {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[6px] font-bold text-gray-300">{d}</div>)}
          {monthDays.map((d, i) => (
            <div key={i} className={`text-[8px] flex items-center justify-center aspect-square rounded-full ${isToday(d, m, y) ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-200' : ''}`}>
              {d || ''}
            </div>
          ))}
        </div>
      </button>
    );
  };

  return (
    <div className="h-full bg-white flex flex-col md:flex-row shadow-2xl relative overflow-hidden">
      {/* Background Month Watermark */}
      <div className="absolute top-0 right-0 text-[20vw] font-black text-gray-50 opacity-[0.03] select-none pointer-events-none uppercase tracking-tighter">
        {monthNames[month]}
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-80 bg-gray-50/50 backdrop-blur-xl border-r border-gray-100 p-8 flex flex-col z-10">
        <div className="flex items-center gap-3 mb-10">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Calendar size={20} />
           </div>
           <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Calendar</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current View</p>
            <div className="flex gap-2 mt-4 bg-gray-50 p-1.5 rounded-2xl">
               <button onClick={() => setViewMode('month')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Month</button>
               <button onClick={() => setViewMode('year')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Year</button>
            </div>
          </div>

          <button 
            onClick={goToToday}
            className="w-full py-5 bg-blue-600 rounded-[32px] text-white font-black text-sm shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Today
          </button>
        </div>

        <div className="mt-auto bg-white/40 p-6 rounded-[32px] border border-gray-100">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Focus</p>
           <div className="space-y-4">
              <div className="flex gap-4">
                 <div className="w-1 h-8 bg-blue-500 rounded-full" />
                 <div>
                    <h5 className="font-bold text-gray-900 text-sm">Product Sync</h5>
                    <p className="text-[10px] text-gray-400 font-medium tracking-tight">09:00 - 10:30 AM</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="w-1 h-8 bg-orange-400 rounded-full" />
                 <div>
                    <h5 className="font-bold text-gray-900 text-sm">Review Call</h5>
                    <p className="text-[10px] text-gray-400 font-medium tracking-tight">02:00 - 03:00 PM</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto hidden-scrollbar bg-white/30 backdrop-blur-sm z-10">
        <div className="flex justify-between items-center mb-12">
           <div className="flex flex-col">
              <h3 className="text-6xl font-black text-gray-900 tracking-tighter transition-all">
                {viewMode === 'month' ? monthNames[month] : year}
              </h3>
              {viewMode === 'month' && <p className="text-xl font-medium text-gray-300 tracking-tight">{year}</p>}
           </div>

           <div className="flex gap-4">
              <button 
                onClick={prevMonth} 
                className="w-14 h-14 rounded-3xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-900 shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextMonth} 
                className="w-14 h-14 rounded-3xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-900 shadow-sm"
              >
                <ChevronRight size={24} />
              </button>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'month' ? (
            <motion.div 
              key="month-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col"
            >
              <div className="grid grid-cols-7 gap-6 text-center mb-8">
                {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                  <div key={d} className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-6 flex-1">
                {days.map((day, idx) => (
                  <div 
                    key={idx} 
                    className={`aspect-square rounded-[36%] flex flex-col items-center justify-center relative transition-all group
                      ${day ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-0'}
                      ${isToday(day) ? 'bg-blue-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.25)] ring-4 ring-blue-50' : 'text-gray-900 hover:scale-[1.05]'}
                    `}
                  >
                    <span className={`text-3xl font-black ${isToday(day) ? 'text-white' : 'text-gray-800'}`}>
                      {day}
                    </span>
                    {day && day % 7 === 0 && !isToday(day) && (
                      <div className="absolute bottom-6 w-1 h-1 rounded-full bg-blue-500 scale-150" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="year-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="grid grid-cols-3 gap-12 pt-4"
            >
              {[0,1,2,3,4,5,6,7,8,9,10,11].map(m => (
                <div key={m} onClick={() => { setCurrentDate(new Date(year, m, 1)); setViewMode('month'); }} className="cursor-pointer hover:scale-[1.05] transition-all p-4 rounded-3xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                  <MonthGrid m={m} y={year} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CanvaApp = () => {
  const [elements, setElements] = useState<{ id: number; type: string; x: number; y: number; color: string; size: number }[]>([]);
  const [selectedTool, setSelectedTool] = useState('square');
  const [activeElementId, setActiveElementId] = useState<number | null>(null);

  const addElement = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newEl = {
      id: Date.now(),
      type: selectedTool,
      x: x - 50,
      y: y - 50,
      color: randomColor,
      size: 100
    };
    setElements([...elements, newEl]);
    setActiveElementId(newEl.id);
  };

  const updateElement = (id: number, delta: any) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...delta } : el));
  };

  return (
    <div className="h-full bg-[#f4f7f8] flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-20 bg-[#252b36] flex flex-col items-center py-8 gap-8 shadow-2xl z-20">
         <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-4">
            <Layers size={28} />
         </div>
         <button 
           onClick={() => setSelectedTool('square')}
           className={`p-3 rounded-xl transition-all ${selectedTool === 'square' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
         >
            <Square size={24} />
         </button>
         <button 
           onClick={() => setSelectedTool('circle')}
           className={`p-3 rounded-xl transition-all ${selectedTool === 'circle' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
         >
            <Circle size={24} />
         </button>
         <button 
           onClick={() => setSelectedTool('triangle')}
           className={`p-3 rounded-xl transition-all ${selectedTool === 'triangle' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
         >
            <Triangle size={24} />
         </button>
         <button 
           onClick={() => setSelectedTool('text')}
           className={`p-3 rounded-xl transition-all ${selectedTool === 'text' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
         >
            <Type size={24} />
         </button>
         <div className="mt-auto flex flex-col gap-6">
            <button className="text-gray-400 hover:text-white"><Undo size={20} /></button>
            <button className="text-gray-400 hover:text-white"><Redo size={20} /></button>
            <button onClick={() => setElements([])} className="text-red-400 hover:text-red-300"><X size={20} /></button>
         </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
         {/* Top Bar */}
         <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
            <h3 className="font-black text-gray-800 tracking-tight uppercase">Untitled Design</h3>
            <div className="flex gap-4">
               <button className="px-6 py-2 bg-[#8b3dff] text-white rounded-lg font-bold text-sm shadow-md hover:bg-[#7a2df0] transition-all">Share</button>
               <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200">Export</button>
            </div>
         </div>

         {/* Canvas Area */}
         <div className="flex-1 p-12 bg-[#ebebeb] flex items-center justify-center overflow-auto relative cursor-crosshair" onClick={addElement}>
            <div className="w-[800px] h-[600px] bg-white shadow-[0_10px_50px_rgba(0,0,0,0.1)] relative">
               {elements.map((el) => (
                 <motion.div
                   key={el.id}
                   drag
                   dragMomentum={false}
                   onDragStart={() => setActiveElementId(el.id)}
                   onClick={(e) => {
                     e.stopPropagation();
                     setActiveElementId(el.id);
                   }}
                   style={{
                     left: el.x,
                     top: el.y,
                     width: el.size,
                     height: el.size,
                     backgroundColor: el.type === 'text' ? 'transparent' : el.color,
                     borderRadius: el.type === 'circle' ? '50%' : el.type === 'triangle' ? '0' : '8px',
                     clipPath: el.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
                   }}
                   className={`absolute cursor-move flex items-center justify-center border-2 transition-shadow ${activeElementId === el.id ? 'border-blue-500 shadow-xl' : 'border-transparent'}`}
                 >
                    {el.type === 'text' && (
                      <span className="text-2xl font-black text-gray-800 select-none">TEXT</span>
                    )}
                 </motion.div>
               ))}

               {elements.length === 0 && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                    <Palette size={64} className="mb-4 opacity-20" />
                    <p className="font-bold tracking-widest text-xs uppercase opacity-40">Click anywhere to add elements</p>
                 </div>
               )}
            </div>
         </div>

         {/* Element Settings Bar */}
         <AnimatePresence>
            {activeElementId && (
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="h-20 bg-white border-t border-gray-200 flex items-center px-8 gap-8 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]"
              >
                 <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Color</span>
                    <div className="flex gap-2">
                       {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(c => (
                         <button 
                           key={c} 
                           onClick={() => updateElement(activeElementId, { color: c })}
                           className="w-8 h-8 rounded-full shadow-inner border border-black/5" 
                           style={{ backgroundColor: c }} 
                         />
                       ))}
                    </div>
                 </div>
                 <div className="h-8 w-[1px] bg-gray-200" />
                 <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Size</span>
                    <input 
                      type="range" 
                      min="20" 
                      max="400" 
                      onChange={(e) => updateElement(activeElementId, { size: parseInt(e.target.value) })}
                      className="flex-1 accent-blue-500"
                    />
                 </div>
                 <button 
                   onClick={() => {
                     setElements(elements.filter(el => el.id !== activeElementId));
                     setActiveElementId(null);
                   }}
                   className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                 >
                    <Ghost size={20} />
                 </button>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

const MonkeytypeApp = () => {
  const wordsList = "the quick brown fox jumps over the lazy dog coding is fun apple tablet premium simulator typing speed test focus accuracy results monkeytype clone react motion design technology development creative user experience interface performance tablet productivity utility software application hardware engineering digital pixel master space speed track race car drive road traffic city lights future legacy build create shift power control system environment development interface design clean minimalist technical workspace professional information dense mission control instrument analytics monitoring instruments italized headers human touch data values alignment raw signals scannable columns scannable missions research developer tools admin panels dynamic large typography massive attention grabbing editorial magazine cover poster traveling travel concierge exclusive refined brand boutique cultural approach artisan personal synthesizer equipment recorded glow authenticity widget format innovative brutalist creative innovative neon green white graphic energy marquee track energy warm approachable cormaront libre baskerville hospitality meditation storytelling cinematic dreaming immersive media medidation literary literal gradient mask scale utility finance fintech trustworthiness modern clinical finance utility dashboard clinical designer timeline fitness tracking habit lifestyle aspirational memorable boutique cultural experience artisanal service high endAsset marketplace sophisticated memberships".split(" ");
  
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; raw: number; errors: number }>({ wpm: 0, accuracy: 0, raw: 0, errors: 0 });
  const [history, setHistory] = useState<{ time: number; wpm: number }[]>([]);

  useEffect(() => {
    generateNewText();
  }, []);

  const generateNewText = () => {
    const shuffled = Array.from({ length: 50 }).map(() => wordsList[Math.floor(Math.random() * wordsList.length)]);
    setTargetWords(shuffled);
    setUserInput("");
    setStartTime(null);
    setIsFinished(false);
    setTimeLeft(30);
    setHistory([]);
    setStats({ wpm: 0, accuracy: 0, raw: 0, errors: 0 });
  };

  useEffect(() => {
    let interval: any;
    if (startTime && timeLeft > 0 && !isFinished) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(interval);
            setIsFinished(true);
            return 0;
          }
          return t - 1;
        });

        // Calculate real-time stats
        const now = Date.now();
        const elapsed = (now - startTime) / 1000 / 60;
        const wordsTyped = userInput.length / 5;
        const currentWpm = Math.max(0, Math.round(wordsTyped / elapsed));
        setStats(prev => ({ ...prev, wpm: currentWpm }));
        setHistory(prev => [...prev, { time: 30 - timeLeft, wpm: currentWpm }]);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, timeLeft, isFinished, userInput]);

  const handleInput = (val: string) => {
    if (isFinished) return;
    if (!startTime) setStartTime(Date.now());
    setUserInput(val);
  };

  const calculateFinalStats = () => {
    const elapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60;
    const wordsTyped = userInput.length / 5;
    const finalWpm = Math.max(0, Math.round(wordsTyped / elapsed));
    
    let errors = 0;
    const fullText = targetWords.join(" ");
    for (let i = 0; i < userInput.length; i++) {
       if (userInput[i] !== fullText[i]) errors++;
    }
    const acc = userInput.length > 0 ? Math.round(((userInput.length - errors) / userInput.length) * 100) : 100;
    
    return { wpm: finalWpm, accuracy: acc, raw: finalWpm, errors };
  };

  useEffect(() => {
    if (isFinished) {
      setStats(calculateFinalStats());
    }
  }, [isFinished]);

  const words = targetWords.join(" ");
  const caretIndex = userInput.length;

  return (
    <div className="h-full bg-[#323437] text-[#d1d0c5] p-16 flex flex-col items-center justify-center font-mono selection:bg-[#e2b714] selection:text-[#323437] overflow-hidden">
      {!isFinished ? (
        <div className="max-w-5xl w-full relative">
          <div className="flex gap-8 mb-8 text-2xl font-black text-[#e2b714] tabular-nums items-end">
             <div className="flex flex-col">
                <span className="text-xs text-[#646669] uppercase tracking-widest mb-1">Time</span>
                {timeLeft}s
             </div>
             <div className="flex flex-col">
                <span className="text-xs text-[#646669] uppercase tracking-widest mb-1">wpm</span>
                {stats.wpm}
             </div>
          </div>

          <div className="relative text-3xl leading-relaxed outline-none h-60 overflow-hidden" tabIndex={0}>
             {/* The words area */}
             <div className="absolute inset-0 select-none flex flex-wrap gap-x-2 content-start">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                   {words.split("").map((char, i) => {
                      let colorClass = "text-[#646669]";
                      if (i < userInput.length) {
                         colorClass = userInput[i] === char ? "text-[#d1d0c5]" : "text-[#ca4754]";
                      }
                      
                      return (
                        <span key={i} className={`relative ${colorClass}`}>
                           {i === caretIndex && !isFinished && (
                             <motion.div 
                               layoutId="caret"
                               initial={false}
                               animate={{ opacity: [1, 0, 1] }}
                               transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                               className="absolute -left-[1px] top-1 w-[2px] h-[1em] bg-[#e2b714] z-10"
                             />
                           )}
                           {char}
                        </span>
                      );
                   })}
                </div>
             </div>
             <textarea 
               autoFocus
               value={userInput}
               onChange={(e) => handleInput(e.target.value)}
               className="absolute inset-0 opacity-0 cursor-default resize-none"
             />
          </div>

          <div className="mt-12 flex justify-center">
             <button onClick={generateNewText} className="p-4 rounded-xl hover:bg-white/5 text-[#646669] hover:text-[#d1d0c5] transition-all flex items-center gap-3 font-bold uppercase text-xs tracking-widest">
                <Plus className="rotate-45" size={20} /> Restart (Esc)
             </button>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl w-full"
        >
           <div className="flex justify-between items-start mb-12">
              <div className="grid grid-cols-4 gap-16">
                 <div>
                    <h4 className="text-[#646669] text-sm uppercase font-bold tracking-widest mb-2">wpm</h4>
                    <p className="text-7xl font-black text-[#e2b714]">{stats.wpm}</p>
                 </div>
                 <div>
                    <h4 className="text-[#646669] text-sm uppercase font-bold tracking-widest mb-2">acc</h4>
                    <p className="text-7xl font-black text-[#e2b714]">{stats.accuracy}%</p>
                 </div>
                 <div>
                    <h4 className="text-[#646669] text-sm uppercase font-bold tracking-widest mb-2">raw</h4>
                    <p className="text-4xl font-black text-[#646669] mt-6">{stats.raw}</p>
                 </div>
                 <div>
                    <h4 className="text-[#646669] text-sm uppercase font-bold tracking-widest mb-2">errors</h4>
                    <p className="text-4xl font-black text-[#646669] mt-6">{stats.errors}</p>
                 </div>
              </div>
              <button onClick={generateNewText} className="p-4 bg-white/5 rounded-xl text-[#e2b714] hover:bg-white/10 transition-all font-black uppercase text-xs tracking-[0.3em]">Try Again</button>
           </div>

           <div className="h-80 w-full bg-white/5 rounded-3xl p-8 border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                       dataKey="time" 
                       stroke="#646669" 
                       fontSize={12} 
                       tickLine={false} 
                       axisLine={false} 
                    />
                    <YAxis 
                       stroke="#646669" 
                       fontSize={12} 
                       tickLine={false} 
                       axisLine={false} 
                       label={{ value: 'WPM', angle: -90, position: 'insideLeft', fill: '#646669', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <Tooltip 
                       contentStyle={{ background: '#323437', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                       itemStyle={{ color: '#e2b714' }}
                    />
                    <Line 
                       type="monotone" 
                       dataKey="wpm" 
                       stroke="#e2b714" 
                       strokeWidth={4} 
                       dot={false}
                       activeDot={{ r: 8, stroke: '#323437', strokeWidth: 4 }} 
                    />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </motion.div>
      )}
    </div>
  );
};

const TetrisApp = () => {
  const GRID_WIDTH = 10;
  const GRID_HEIGHT = 20;

  const TETROMINOS: Record<string, { shape: number[][]; color: string }> = {
    I: { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#00f0f0' },
    J: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#0000f0' },
    L: { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#f0a000' },
    O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
    S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#00f000' },
    T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#a000f0' },
    Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#f00000' },
  };

  const [grid, setGrid] = useState<string[][]>(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill('')));
  const [activePiece, setActivePiece] = useState<{ pos: { x: number; y: number }; shape: number[][]; color: string } | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [nextPiece, setNextPiece] = useState<string>('I');

  const spawnPiece = (type?: string) => {
    const keys = Object.keys(TETROMINOS);
    const nextType = type || keys[Math.floor(Math.random() * keys.length)];
    const piece = TETROMINOS[nextType];
    const newNext = keys[Math.floor(Math.random() * keys.length)];
    setNextPiece(newNext);

    const pos = { x: Math.floor(GRID_WIDTH / 2) - Math.floor(piece.shape[0].length / 2), y: 0 };
    
    // Check if spawn is blocked
    if (checkCollision(pos, piece.shape)) {
      setGameOver(true);
      return;
    }
    
    setActivePiece({ pos, shape: piece.shape, color: piece.color });
  };

  const checkCollision = (pos: { x: number; y: number }, shape: number[][], currentGrid = grid) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT || (newY >= 0 && currentGrid[newY][newX] !== '')) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (shape: number[][]) => {
    const rotated = shape[0].map((_, index) => shape.map(col => col[index]).reverse());
    return rotated;
  };

  const move = (dir: { x: number; y: number }) => {
    if (!activePiece || gameOver) return;
    const newPos = { x: activePiece.pos.x + dir.x, y: activePiece.pos.y + dir.y };
    if (!checkCollision(newPos, activePiece.shape)) {
      setActivePiece({ ...activePiece, pos: newPos });
    } else if (dir.y > 0) {
      lockPiece();
    }
  };

  const lockPiece = () => {
    if (!activePiece) return;
    const newGrid = [...grid.map(row => [...row])];
    activePiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const gridY = activePiece.pos.y + y;
          const gridX = activePiece.pos.x + x;
          if (gridY >= 0) newGrid[gridY][gridX] = activePiece.color;
        }
      });
    });

    // Clear lines
    let linesCleared = 0;
    const filteredGrid = newGrid.filter(row => {
      if (row.every(cell => cell !== '')) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (filteredGrid.length < GRID_HEIGHT) {
      filteredGrid.unshift(Array(GRID_WIDTH).fill(''));
    }

    setGrid(filteredGrid);
    setScore(s => s + linesCleared * 100);
    spawnPiece(nextPiece);
  };

  const rotatePiece = () => {
    if (!activePiece || gameOver) return;
    const rotated = rotate(activePiece.shape);
    if (!checkCollision(activePiece.pos, rotated)) {
      setActivePiece({ ...activePiece, shape: rotated });
    }
  };

  useEffect(() => {
    spawnPiece();
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      move({ x: 0, y: 1 });
    }, 800);
    return () => clearInterval(interval);
  }, [activePiece, gameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') move({ x: -1, y: 0 });
      if (e.key === 'ArrowRight') move({ x: 1, y: 0 });
      if (e.key === 'ArrowDown') move({ x: 0, y: 1 });
      if (e.key === 'ArrowUp') rotatePiece();
      if (e.key === ' ') {
        let p = activePiece?.pos;
        while(p && !checkCollision({x: p.x, y: p.y + 1}, activePiece!.shape)) {
           p = {x: p.x, y: p.y + 1};
        }
        if(p) setActivePiece({...activePiece!, pos: p});
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePiece, gameOver]);

  return (
    <div className="h-full bg-[#1a1a1a] text-white flex flex-col items-center justify-center font-mono select-none">
      <div className="flex gap-12 items-start">
        {/* Statistics */}
        <div className="flex flex-col gap-8 w-48 text-right">
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Score</p>
              <h2 className="text-5xl font-black tracking-tighter text-blue-500">{score.toLocaleString()}</h2>
           </div>
           <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Next</p>
              <div className="grid grid-cols-4 gap-1 w-20 mx-auto">
                 {TETROMINOS[nextPiece].shape.map((row, y) => row.map((val, x) => (
                   <div key={`${x}-${y}`} className={`aspect-square w-4 rounded-sm ${val ? '' : 'opacity-0'}`} style={{ backgroundColor: val ? TETROMINOS[nextPiece].color : 'transparent' }} />
                 )))}
              </div>
           </div>
           {gameOver && (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-500 font-black uppercase text-xs tracking-widest">Game Over</p>
                <button onClick={() => {
                  setGrid(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill('')));
                  setScore(0);
                  setGameOver(false);
                  spawnPiece();
                }} className="mt-4 w-full py-2 bg-red-500 text-white font-bold rounded-xl text-xs">Restart</button>
             </motion.div>
           )}
        </div>

        {/* Board */}
        <div className="relative border-[12px] border-[#333] rounded-3xl overflow-hidden shadow-2xl bg-[#000]">
           <div className="grid grid-cols-10 grid-rows-20 gap-[1px]">
              {grid.map((row, y) => row.map((cell, x) => {
                 let color = cell;
                 if (activePiece) {
                    const py = y - activePiece.pos.y;
                    const px = x - activePiece.pos.x;
                    if (py >= 0 && py < activePiece.shape.length && px >= 0 && px < activePiece.shape[py].length) {
                       if (activePiece.shape[py][px]) color = activePiece.color;
                    }
                 }
                 return (
                   <div key={`${x}-${y}`} className="w-8 h-8 rounded-[2px] transition-colors" style={{ backgroundColor: color || 'transparent', border: color ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.02)' }} />
                 );
              }))}
           </div>
        </div>

        {/* Controls Hint */}
        <div className="w-48 space-y-4">
           <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Controls</p>
              <div className="grid grid-cols-3 gap-2">
                 <div />
                 <button onClick={() => rotatePiece()} className="aspect-square bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20"><ChevronLeft className="rotate-90" /></button>
                 <div />
                 <button onClick={() => move({x: -1, y: 0})} className="aspect-square bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20"><ChevronLeft /></button>
                 <button onClick={() => move({x: 0, y: 1})} className="aspect-square bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20"><ChevronLeft className="-rotate-90" /></button>
                 <button onClick={() => move({x: 1, y: 0})} className="aspect-square bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20"><ChevronRight /></button>
              </div>
           </div>
           <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">Use arrow keys on keyboard or screen buttons to play</p>
        </div>
      </div>
    </div>
  );
};

const MusicApp = () => {
  const { nowPlaying, setNowPlaying, isPlaying, setIsPlaying } = useSystem();
  
  const albums = [
    { title: 'Blonde', artist: 'Frank Ocean', cover: 'https://picsum.photos/seed/blonde/300/300' },
    { title: 'Dawn FM', artist: 'The Weeknd', cover: 'https://picsum.photos/seed/dawn/300/300' },
    { title: 'SOS', artist: 'SZA', cover: 'https://picsum.photos/seed/sos/300/300' },
    { title: 'Midnights', artist: 'Taylor Swift', cover: 'https://picsum.photos/seed/mid/300/300' },
    { title: 'Future Nostalgia', artist: 'Dua Lipa', cover: 'https://picsum.photos/seed/dua/300/300' },
    { title: 'After Hours', artist: 'The Weeknd', cover: 'https://picsum.photos/seed/after/300/300' },
  ];

  return (
    <div className="h-full bg-zinc-950 text-white flex flex-col font-sans">
      <div className="p-12 flex-1 overflow-y-auto hidden-scrollbar">
         <div className="flex justify-between items-end mb-12">
            <h2 className="text-5xl font-black tracking-tighter">Listen Now</h2>
            <div className="flex gap-4">
               <button className="p-4 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all"><Search size={24} /></button>
               <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 shadow-lg border border-white/10" />
            </div>
         </div>

         <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {albums.map(a => (
              <motion.div 
                key={a.title} 
                whileHover={{ y: -10 }}
                onClick={() => { setNowPlaying(a); setIsPlaying(true); }}
                className="group cursor-pointer"
              >
                 <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/5 mb-4 relative">
                    <img src={a.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <PlayCircle size={64} className="text-white drop-shadow-2xl" />
                    </div>
                 </div>
                 <h3 className="font-bold text-lg line-clamp-1">{a.title}</h3>
                 <p className="text-sm text-zinc-500 font-medium">{a.artist}</p>
              </motion.div>
            ))}
         </div>
      </div>

      {nowPlaying && (
        <div className="h-24 bg-zinc-900/90 backdrop-blur-3xl border-t border-white/5 px-8 flex items-center justify-between z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
           <div className="flex items-center gap-4">
              <img src={nowPlaying.cover} className="w-14 h-14 rounded-xl shadow-lg" />
              <div>
                 <p className="font-bold tracking-tight">{nowPlaying.title}</p>
                 <p className="text-xs text-zinc-400">{nowPlaying.artist}</p>
              </div>
           </div>
           
           <div className="flex items-center gap-8">
              <button className="text-zinc-400 hover:text-white transition-colors"><SkipBack size={28} fill="currentColor" /></button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                 {isPlaying ? <PauseCircle size={32} fill="currentColor" /> : <PlayCircle size={32} fill="currentColor" />}
              </button>
              <button className="text-zinc-400 hover:text-white transition-colors"><SkipForward size={28} fill="currentColor" /></button>
           </div>

           <div className="flex items-center gap-4 text-zinc-500 font-medium text-[10px] w-48">
              <Volume2 size={16} />
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="w-2/3 h-full bg-white/60" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const MapsApp = () => {
  const [search, setSearch] = useState('Tashkent');
  const [mapUrl, setMapUrl] = useState(`https://www.google.com/maps/embed/v1/place?key=REPLACE_WITH_KEY&q=Tashkent`);
  
  // Note: Since I don't have a Google Maps API Key here, I'll use the search URL format instead
  const searchMap = (e: FormEvent) => {
    e.preventDefault();
    setMapUrl(`https://www.google.com/maps?q=${encodeURIComponent(search)}&output=embed`);
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col font-sans">
       <div className="p-6 bg-white border-b border-gray-200 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
             <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                <Compass size={28} />
             </div>
             <form onSubmit={searchMap} className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for a place or address" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all font-medium"
                />
             </form>
          </div>
          <div className="flex gap-4 ml-8">
             <button className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2">
                <Navigation size={18} /> Directions
             </button>
             <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img src="https://picsum.photos/seed/user/100/100" />
             </div>
          </div>
       </div>
       <div className="flex-1 bg-gray-200 relative">
          <iframe 
            src={mapUrl}
            className="w-full h-full border-none"
            allowFullScreen
          />
          <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white shadow-2xl flex flex-col gap-2">
             <button className="p-3 hover:bg-white rounded-2xl transition-all"><Plus size={20} /></button>
             <div className="h-[1px] bg-gray-200" />
             <button className="p-3 hover:bg-white rounded-2xl transition-all"><X size={20} className="rotate-45" /></button>
          </div>
       </div>
    </div>
  );
};

const ClockApp = () => {
  const [activeTab, setActiveTab] = useState<'world' | 'stopwatch' | 'timer'>('world');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => setTime(t => t + 10), 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full bg-black text-white flex flex-col font-sans">
       <div className="flex-1 flex flex-col items-center justify-center p-12">
          {activeTab === 'world' ? (
            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
               {[ { city: 'Tashkent', diff: 'Local', time: new Date() }, { city: 'London', diff: '-4h', time: new Date(Date.now() - 4*3600*1000) }, { city: 'New York', diff: '-9h', time: new Date(Date.now() - 9*3600*1000) }, { city: 'Tokyo', diff: '+4h', time: new Date(Date.now() + 4*3600*1000) } ].map(c => (
                 <div key={c.city} className="p-8 bg-zinc-900 rounded-[40px] border border-white/5 flex justify-between items-center group hover:bg-zinc-800 transition-all">
                    <div>
                       <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-1">{c.diff}</p>
                       <h3 className="text-3xl font-black">{c.city}</h3>
                    </div>
                    <p className="text-5xl font-light tabular-nums">{c.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                 </div>
               ))}
            </div>
          ) : activeTab === 'stopwatch' ? (
            <div className="flex flex-col items-center gap-16">
               <div className="text-[12vw] font-light tracking-tighter tabular-nums text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                  {formatTime(time)}
               </div>
               <div className="flex gap-12">
                  <button 
                    onClick={() => { setTime(0); setIsRunning(false); }}
                    className="w-24 h-24 rounded-full bg-zinc-800 text-zinc-400 font-bold active:scale-95 transition-all text-sm uppercase tracking-widest"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className={`w-24 h-24 rounded-full font-bold active:scale-95 transition-all text-sm uppercase tracking-widest ${isRunning ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}
                  >
                    {isRunning ? 'Stop' : 'Start'}
                  </button>
               </div>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-12">
                <div className="w-80 h-80 rounded-full border-8 border-orange-500/20 flex items-center justify-center relative">
                   <div className="absolute inset-4 border-2 border-orange-500 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '60s' }} />
                   <span className="text-6xl font-light tracking-tighter text-orange-500">20:00</span>
                </div>
                <button className="px-12 py-4 bg-orange-500 text-black font-black rounded-full shadow-2xl hover:bg-orange-400 transition-all uppercase tracking-widest">Start Timer</button>
             </div>
          )}
       </div>

       <div className="h-28 bg-zinc-900 border-t border-white/5 flex items-center justify-center gap-20">
          <button onClick={() => setActiveTab('world')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'world' ? 'text-orange-500' : 'text-zinc-500'}`}>
             <MapPin size={28} />
             <span className="text-[10px] font-black uppercase tracking-widest">World Clock</span>
          </button>
          <button onClick={() => setActiveTab('stopwatch')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'stopwatch' ? 'text-orange-500' : 'text-zinc-500'}`}>
             <Clock size={28} />
             <span className="text-[10px] font-black uppercase tracking-widest">Stopwatch</span>
          </button>
          <button onClick={() => setActiveTab('timer')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'timer' ? 'text-orange-500' : 'text-zinc-500'}`}>
             <Timer size={28} />
             <span className="text-[10px] font-black uppercase tracking-widest">Timer</span>
          </button>
       </div>
    </div>
  );
};

const VoiceMemosApp = () => {
  const [memos, setMemos] = useState([
     { id: 1, title: 'New Recording 1', date: 'Yesterday', duration: '0:45' },
     { id: 2, title: 'Project Discussion', date: '2 days ago', duration: '12:30' },
     { id: 3, title: 'Piano Idea', date: 'Last week', duration: '2:15' },
  ]);

  return (
    <div className="h-full bg-zinc-950 text-white flex flex-col font-sans">
       <div className="p-12 flex-1 flex flex-col">
          <h2 className="text-5xl font-black tracking-tighter mb-12">All Recordings</h2>
          <div className="space-y-4">
             {memos.map(m => (
               <div key={m.id} className="p-8 bg-zinc-900 rounded-[32px] border border-white/5 flex items-center justify-between group hover:bg-zinc-800 transition-all cursor-pointer">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                        <Play size={24} fill="currentColor" />
                     </div>
                     <div>
                        <h4 className="font-bold text-xl drop-shadow-sm">{m.title}</h4>
                        <p className="text-sm text-zinc-500 font-medium">{m.date} • {m.duration}</p>
                     </div>
                  </div>
                  <Disc className="text-zinc-700 group-hover:text-red-500/40 transition-colors" size={24} />
               </div>
             ))}
          </div>
       </div>
       <div className="p-12 border-t border-white/5 bg-zinc-900/50 backdrop-blur-3xl flex items-center justify-center">
          <button className="w-20 h-20 bg-red-600 rounded-full border-4 border-white/20 shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center justify-center active:scale-90 transition-all">
             <div className="w-8 h-8 bg-white rounded-full" />
          </button>
       </div>
    </div>
  );
};

const ControlCenter = ({ isOpen, close }: { isOpen: boolean; close: () => void }) => {
  const { 
    isWifiOn, setIsWifiOn, 
    isAirplaneMode, setIsAirplaneMode, 
    isBatterySaver, setIsBatterySaver,
    isBluetoothOn, setIsBluetoothOn,
    brightness, setBrightness,
    volume, setVolume,
    nowPlaying, isPlaying, setIsPlaying
  } = useSystem();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 z-[60] bg-black/5"
          />
          <motion.div 
            initial={{ y: -500, x: 500, scale: 0.8, opacity: 0 }}
            animate={{ y: 0, x: 0, scale: 1, opacity: 1 }}
            exit={{ y: -500, x: 500, scale: 0.8, opacity: 0 }}
            className="absolute top-12 right-12 w-96 bg-white/40 backdrop-blur-3xl rounded-[40px] p-8 z-[70] shadow-2xl border border-white/30 grid grid-cols-2 gap-6"
          >
            {/* Connectivity */}
            <div className="bg-white/30 p-5 rounded-[28px] grid grid-cols-2 gap-4 shadow-inner">
               <button 
                 onClick={() => setIsAirplaneMode(!isAirplaneMode)}
                 className={`aspect-square rounded-full flex items-center justify-center transition-all ${isAirplaneMode ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/40 text-zinc-800'}`}
               >
                 <Plane size={24} />
               </button>
               <button 
                 onClick={() => !isAirplaneMode && setIsWifiOn(!isWifiOn)}
                 className={`aspect-square rounded-full flex items-center justify-center transition-all ${isWifiOn && !isAirplaneMode ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/40 text-zinc-800 opacity-50'}`}
               >
                 <Wifi size={24} />
               </button>
               <button 
                 onClick={() => setIsBluetoothOn(!isBluetoothOn)}
                 className={`aspect-square rounded-full flex items-center justify-center transition-all ${isBluetoothOn ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/40 text-zinc-800'}`}
               >
                 <Bluetooth size={24} />
               </button>
               <button 
                 onClick={() => setIsBatterySaver(!isBatterySaver)}
                 className={`aspect-square rounded-full flex items-center justify-center transition-all ${isBatterySaver ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white/40 text-zinc-800'}`}
               >
                 <Zap size={24} />
               </button>
            </div>

            {/* Now Playing */}
            <div className="bg-white/30 p-4 rounded-[28px] flex flex-col items-center justify-center gap-2 overflow-hidden">
               {nowPlaying ? (
                 <div className="flex flex-col items-center gap-2 w-full">
                    <img src={nowPlaying.cover} className="w-16 h-16 rounded-xl shadow-lg mb-1" />
                    <p className="text-[10px] font-black text-zinc-800 leading-tight text-center truncate w-full">{nowPlaying.title}</p>
                    <p className="text-[8px] font-bold text-zinc-800/40 uppercase tracking-widest">{nowPlaying.artist}</p>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="mt-2 text-zinc-800">
                       {isPlaying ? <PauseCircle size={28} fill="currentColor" /> : <PlayCircle size={28} fill="currentColor" />}
                    </button>
                 </div>
               ) : (
                 <>
                    <Music size={40} className="text-zinc-800 opacity-20" />
                    <p className="text-[10px] font-black text-zinc-800/40 uppercase tracking-widest">Not Playing</p>
                 </>
               )}
            </div>

            {/* Sliders */}
            <div className="bg-white/30 p-5 rounded-[28px] flex flex-col gap-6">
               <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-zinc-800/60"><Sun size={14} /> <span className="text-[10px] font-bold">{brightness}%</span></div>
                  <div className="h-10 bg-white/40 rounded-xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-white transition-all duration-300" style={{ width: `${brightness}%` }} />
                     <input 
                       type="range" 
                       min="0" max="100" 
                       value={brightness} 
                       onChange={(e) => setBrightness(parseInt(e.target.value))}
                       className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                     />
                  </div>
               </div>
               <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-zinc-800/60"><Volume2 size={14} /> <span className="text-[10px] font-bold">{volume}%</span></div>
                  <div className="h-10 bg-white/40 rounded-xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-white transition-all duration-300" style={{ width: `${volume}%` }} />
                     <input 
                       type="range" 
                       min="0" max="100" 
                       value={volume} 
                       onChange={(e) => setVolume(parseInt(e.target.value))}
                       className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                     />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="aspect-square rounded-[24px] bg-white/30 flex items-center justify-center text-zinc-800"><Moon size={24} /></div>
               <div className="aspect-square rounded-[24px] bg-white/30 flex items-center justify-center text-zinc-800"><Calculator size={24} /></div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const DoodleApp = () => {
  const canvasRef = useMemo(() => ({ current: null as HTMLCanvasElement | null }), []);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Brush size={20} />
          </div>
          <h2 className="text-xl font-bold">Doodle Paint</h2>
        </div>
        <div className="flex items-center gap-4">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
          <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-24" />
          <button onClick={clear} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-xs hover:bg-red-200 transition-colors uppercase tracking-widest">Clear</button>
        </div>
      </div>
      <div className="flex-1 bg-white cursor-crosshair relative touch-none">
        <canvas
          ref={(el) => (canvasRef.current = el)}
          width={1200}
          height={800}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

const FilesApp = () => {
  const [path, setPath] = useState(['iCloud Drive']);
  const files = [
    { name: 'Documents', type: 'folder', icon: 'Files' },
    { name: 'Downloads', type: 'folder', icon: 'Download' },
    { name: 'Projects', type: 'folder', icon: 'Layers' },
    { name: 'Resume.pdf', type: 'file', icon: 'Files', size: '1.2 MB' },
    { name: 'Trip_Photo.jpg', type: 'file', icon: 'ImageIcon', size: '4.5 MB' },
    { name: 'Budget.numbers', type: 'file', icon: 'Calculator', size: '800 KB' },
  ];

  return (
    <div className="h-full bg-white flex flex-col font-sans">
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-blue-500 font-bold mb-4">
          {path.map((p, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight size={14} className="text-gray-300" />}
              <span className="cursor-pointer hover:underline">{p}</span>
            </span>
          ))}
        </div>
        <h2 className="text-4xl font-black tracking-tight text-gray-900">Files</h2>
      </div>
      <div className="flex-1 p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 overflow-y-auto hidden-scrollbar">
        {files.map((file) => (
          <motion.div
            key={file.name}
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all ${file.type === 'folder' ? 'bg-blue-50 text-blue-500 shadow-sm group-hover:bg-blue-100 shadow-blue-100' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 shadow-sm'}`}>
               <IconComponent name={file.icon} size={40} />
            </div>
            <span className="mt-3 text-sm font-bold text-gray-700 text-center">{file.name}</span>
            {file.size && <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">{file.size}</span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const FlappyGameApp = () => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [birdY, setBirdY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<any[]>([]);
  
  const gravity = 0.6;
  const jumpHeight = -10;
  const pipeSpeed = 5;
  const pipeWidth = 60;
  const pipeGap = 160;

  const jump = () => {
    if (gameState === 'playing') setVelocity(jumpHeight);
    else if (gameState !== 'playing') resetGame();
  };

  const resetGame = () => {
    setBirdY(250);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setBirdY(y => {
        const nextY = y + velocity;
        if (nextY > 580 || nextY < 0) {
          setGameState('gameover');
          return y;
        }
        return nextY;
      });
      setVelocity(v => v + gravity);

      setPipes(currentPipes => {
        const nextPipes = currentPipes.map(p => ({ ...p, x: p.x - pipeSpeed })).filter(p => p.x > -pipeWidth);
        
        if (nextPipes.length === 0 || nextPipes[nextPipes.length - 1].x < 400) {
          nextPipes.push({
            x: 800,
            topHeight: Math.random() * 300 + 50,
            passed: false
          });
        }
        
        // Collision
        nextPipes.forEach(p => {
           if (p.x < 130 && p.x > 70) {
              if (birdY < p.topHeight || birdY > p.topHeight + pipeGap) {
                setGameState('gameover');
              } else if (!p.passed) {
                p.passed = true;
                setScore(s => s + 1);
              }
           }
        });

        return nextPipes;
      });
    }, 24);

    return () => clearInterval(gameLoop);
  }, [gameState, velocity, birdY]);

  return (
    <div 
      className="h-full bg-sky-300 relative overflow-hidden cursor-pointer select-none"
      onClick={jump}
    >
      {/* Background Clouds */}
      <div className="absolute top-10 left-10 opacity-40"><Cloud size={100} className="text-white" /></div>
      <div className="absolute top-40 right-20 opacity-30"><Cloud size={140} className="text-white" /></div>

      {/* Bird */}
      <motion.div 
        animate={{ y: birdY, rotate: velocity * 2 }}
        className="absolute left-20 w-12 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-black z-20"
      >
        <div className="w-4 h-4 bg-white rounded-full border-2 border-black ml-4 mt-[-4px] relative">
          <div className="w-1.5 h-1.5 bg-black rounded-full absolute top-0.5 right-0.5" />
        </div>
        <div className="w-6 h-4 bg-orange-500 rounded-full border-2 border-black absolute right-[-8px] top-4" />
      </motion.div>

      {/* Pipes */}
      {pipes.map((p, i) => (
        <React.Fragment key={i}>
          <div className="absolute bg-green-500 border-x-8 border-black z-10" style={{ left: p.x, top: 0, width: pipeWidth, height: p.topHeight }} />
          <div className="absolute bg-green-500 border-x-8 border-black z-10" style={{ left: p.x, top: p.topHeight + pipeGap, width: pipeWidth, height: 600 - (p.topHeight + pipeGap) }} />
        </React.Fragment>
      ))}

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-20 bg-emerald-600 border-t-8 border-black z-30" />

      {/* Score */}
      <div className="absolute top-10 w-full text-center z-40">
        <h2 className="text-8xl font-black text-white stroke-black drop-shadow-[0_8px_0_rgba(0,0,0,0.4)]">{score}</h2>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {gameState !== 'playing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white"
          >
            <h2 className="text-6xl font-black mb-4 tracking-tighter uppercase drop-shadow-2xl">
              {gameState === 'start' ? 'Flappy Bird' : 'Game Over'}
            </h2>
            <p className="text-lg font-bold mb-8 opacity-80 uppercase tracking-widest">{gameState === 'start' ? 'Tap to Start' : 'Tap to Restart'}</p>
            {gameState === 'gameover' && <div className="text-4xl font-black bg-white text-black px-10 py-4 rounded-full shadow-2xl mb-8">{score}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TranslatorApp = () => {
  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);

  const translate = () => {
    if (!text) return;
    setLoading(true);
    // Mock translation
    setTimeout(() => {
      setTranslated(`[MOCK TRANSLATION]: ${text.split('').reverse().join('')}`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="h-full bg-[#f2f2f7] flex flex-col font-sans">
      <div className="p-8 pb-4">
        <h2 className="text-4xl font-black tracking-tight text-gray-900">Translate</h2>
      </div>
      <div className="p-8 space-y-6">
        <div className="flex gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
           <button className="flex-1 py-3 font-bold text-blue-600 rounded-xl bg-blue-50">English</button>
           <ChevronRight size={20} className="text-gray-300" />
           <button className="flex-1 py-3 font-bold text-indigo-600 rounded-xl bg-indigo-50">Uzbek</button>
        </div>
        
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 min-h-[200px] flex flex-col">
           <textarea 
             value={text}
             onChange={(e) => setText(e.target.value)}
             placeholder="Enter text to translate..."
             className="flex-1 bg-transparent outline-none text-2xl font-medium resize-none placeholder:text-gray-300"
           />
           <div className="flex justify-end mt-4">
              <button 
                onClick={translate}
                className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                {loading ? 'Translating...' : 'Translate'}
              </button>
           </div>
        </div>

        {translated && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-600 text-white rounded-[32px] p-8 shadow-xl shadow-indigo-200"
          >
             <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Uzbek Translation</p>
             <p className="text-2xl font-bold">{translated}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const MinesweeperApp = () => {
  const [grid, setGrid] = useState<any[]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const size = 10;
  const mines = 15;

  const initGrid = () => {
    let newGrid = Array(size * size).fill(null).map((_, i) => ({
      id: i,
      isMine: false,
      revealed: false,
      flagged: false,
      neighborMines: 0
    }));

    // Place mines
    let placed = 0;
    while (placed < mines) {
      const idx = Math.floor(Math.random() * size * size);
      if (!newGrid[idx].isMine) {
        newGrid[idx].isMine = true;
        placed++;
      }
    }

    // Neighbors
    newGrid.forEach((cell, i) => {
      if (cell.isMine) return;
      const r = Math.floor(i / size);
      const c = i % size;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            if (newGrid[nr * size + nc].isMine) count++;
          }
        }
      }
      cell.neighborMines = count;
    });

    setGrid(newGrid);
    setStatus('playing');
  };

  useEffect(() => { initGrid(); }, []);

  const reveal = (i: number) => {
    if (status !== 'playing' || grid[i].revealed || grid[i].flagged) return;
    const newGrid = [...grid];
    if (newGrid[i].isMine) {
      setStatus('lost');
      newGrid.forEach(c => { if (c.isMine) c.revealed = true; });
    } else {
      const flood = (idx: number) => {
        if (newGrid[idx].revealed) return;
        newGrid[idx].revealed = true;
        if (newGrid[idx].neighborMines === 0) {
          const r = Math.floor(idx / size);
          const c = idx % size;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                flood(nr * size + nc);
              }
            }
          }
        }
      };
      flood(i);
      if (newGrid.filter(c => !c.isMine && !c.revealed).length === 0) setStatus('won');
    }
    setGrid(newGrid);
  };

  return (
    <div className="h-full bg-zinc-900 flex flex-col items-center justify-center font-mono">
      <div className="mb-8 flex items-center gap-12 text-white bg-black/40 p-6 rounded-3xl border border-white/10 shadow-2xl">
         <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-black opacity-40">Mines</span>
            <span className="text-3xl font-black text-red-500">{mines}</span>
         </div>
         <button onClick={initGrid} className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/10 active:scale-90 transition-all">
            {status === 'playing' ? '😊' : status === 'won' ? '😎' : '😵'}
         </button>
         <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-black opacity-40">Status</span>
            <span className="text-sm font-black uppercase text-blue-400">{status}</span>
         </div>
      </div>
      <div className="grid grid-cols-10 gap-1 bg-zinc-800 p-2 rounded-xl shadow-2xl border-4 border-zinc-700">
        {grid.map((cell, i) => (
          <button
            key={i}
            onClick={() => reveal(i)}
            onContextMenu={(e) => { e.preventDefault(); const n = [...grid]; n[i].flagged = !n[i].flagged; setGrid(n); }}
            className={`w-10 h-10 flex items-center justify-center text-sm font-black transition-all rounded-sm border ${cell.revealed ? 'bg-zinc-300 border-zinc-400 text-zinc-900' : 'bg-zinc-600 border-zinc-500 shadow-inner group hover:bg-zinc-500'}`}
          >
            {cell.revealed ? (cell.isMine ? <Zap size={16} /> : (cell.neighborMines || '')) : (cell.flagged ? '🚩' : '')}
          </button>
        ))}
      </div>
    </div>
  );
};

const FinanceApp = () => {
  const data = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 5000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
  ];

  return (
    <div className="h-full bg-slate-950 p-10 text-white flex flex-col font-sans overflow-y-auto hidden-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-4xl font-black tracking-tight">Portfolio</h2>
           <p className="text-gray-400 font-bold">$12,450.80 <span className="text-green-500 ml-2">+5.2%</span></p>
        </div>
        <TrendingUp size={40} className="text-green-500" />
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 mb-8">
         <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">Market Trends</p>
         <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data}>
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={4} dot={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
               </LineChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         {[ { name: 'BTC', price: '$64,230', change: '+2.4%' }, { name: 'ETH', price: '$3,420', change: '-1.2%' }, { name: 'AAPL', price: '$182.50', change: '+0.8%' }, { name: 'TSLA', price: '$175.20', change: '+4.5%' } ].map((asset, i) => (
           <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <div className="flex justify-between items-center mb-2">
                 <span className="font-black text-xl">{asset.name}</span>
                 <ArrowUpRight size={16} className={asset.change.startsWith('+') ? 'text-green-500' : 'text-red-500'} />
              </div>
              <p className="text-lg font-bold tabular-nums">{asset.price}</p>
              <p className={`text-xs font-black ${asset.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{asset.change}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

const HealthApp = () => {
  return (
    <div className="h-full bg-black p-10 text-white flex flex-col font-sans overflow-y-auto hidden-scrollbar">
      <div className="flex items-center gap-4 mb-10">
         <Activity size={40} className="text-red-500" />
         <h2 className="text-4xl font-black tracking-tight">Activity</h2>
      </div>

      <div className="flex justify-center mb-12 relative">
         <div className="w-64 h-64 rounded-full border-[10px] border-red-500/20 p-2">
            <div className="w-full h-full rounded-full border-[10px] border-green-500/20 p-2">
               <div className="w-full h-full rounded-full border-[10px] border-blue-500/20" />
            </div>
         </div>
         <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs font-black uppercase tracking-widest opacity-40">Move</p>
            <p className="text-4xl font-black">450 / <span className="text-red-500">600</span></p>
         </div>
      </div>

      <div className="space-y-4">
         {[ { name: 'Steps', value: '8,432', goal: '10,000', color: 'text-red-500', icon: 'Footprints' }, { name: 'Exercise', value: '42m', goal: '30m', color: 'text-green-500', icon: 'Timer' }, { name: 'Stand', value: '10h', goal: '12h', color: 'text-blue-500', icon: 'ArrowUp' } ].map((stat, i) => (stat &&
           <div key={i} className="bg-zinc-900/50 p-6 rounded-[32px] border border-white/5 flex items-center justify-between">
              <div>
                 <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{stat.name}</p>
                 <p className={`text-2xl font-black ${stat.color}`}>{stat.value} <span className="text-white/20 text-sm">/ {stat.goal}</span></p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                 <IconComponent name={stat.icon === 'Timer' ? 'Timer' : 'Zap'} size={24} />
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

const WordleGame = () => {
  const [board, setBoard] = useState(Array(6).fill('').map(() => Array(5).fill('')));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const solution = "APPLE";

  const handleKey = (key: string) => {
    if (key === 'Enter') {
      if (currentCol === 5) {
        setCurrentRow(r => r + 1);
        setCurrentCol(0);
      }
    } else if (key === 'Backspace') {
      if (currentCol > 0) {
        const nextBoard = [...board];
        nextBoard[currentRow][currentCol - 1] = '';
        setBoard(nextBoard);
        setCurrentCol(c => c - 1);
      }
    } else if (key.length === 1 && currentCol < 5) {
      const nextBoard = [...board];
      nextBoard[currentRow][currentCol] = key.toUpperCase();
      setBoard(nextBoard);
      setCurrentCol(c => c + 1);
    }
  };

  return (
    <div className="h-full bg-slate-100 p-8 flex flex-col items-center justify-center font-sans">
      <h2 className="text-4xl font-black mb-12 tracking-tight">WORDLE</h2>
      <div className="grid grid-rows-6 gap-2 mb-12">
        {board.map((row, ri) => (
          <div key={ri} className="flex gap-2">
            {row.map((cell, ci) => {
              let color = "bg-white border-gray-300 text-black";
              if (ri < currentRow) {
                if (cell === solution[ci]) color = "bg-green-500 border-green-500 text-white";
                else if (solution.includes(cell)) color = "bg-yellow-500 border-yellow-500 text-white";
                else color = "bg-gray-500 border-gray-500 text-white";
              }
              return (
                <div key={ci} className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-black transition-all ${color}`}>
                  {cell}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-10 gap-2 w-full max-w-lg">
        {"QWERTYUIOPASDFGHJKLZXCVBNM".split('').map(k => (
          <button key={k} onClick={() => handleKey(k)} className="bg-white hover:bg-gray-200 py-4 rounded-lg font-bold shadow-sm transition-all active:scale-90">{k}</button>
        ))}
        <button onClick={() => handleKey('Backspace')} className="col-span-2 bg-gray-300 py-4 rounded-lg font-bold">DEL</button>
        <button onClick={() => handleKey('Enter')} className="col-span-3 bg-green-600 text-white py-4 rounded-lg font-bold">ENTER</button>
      </div>
    </div>
  );
};

const Game2048 = () => {
  const [grid, setGrid] = useState<number[][]>([
    [0, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 2, 0],
    [0, 0, 0, 0]
  ]);

  const move = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
     // Simple logic for simulator (randomize for now to show interaction)
     const next = grid.map(row => row.map(() => Math.random() > 0.8 ? 2 : (Math.random() > 0.9 ? 4 : 0)));
     setGrid(next);
  };

  return (
    <div className="h-full bg-[#faf8ef] p-10 flex flex-col items-center font-sans">
      <div className="flex justify-between items-center w-full max-w-md mb-8">
         <h2 className="text-7xl font-black text-[#776e65]">2048</h2>
         <div className="bg-[#bbada0] p-4 rounded-xl text-center text-white px-8">
            <p className="text-xs font-bold uppercase opacity-60">Score</p>
            <p className="text-2xl font-black">1248</p>
         </div>
      </div>

      <div className="bg-[#bbada0] p-4 rounded-2xl w-full max-w-md aspect-square grid grid-cols-4 gap-4">
         {grid.map((row, ri) => row.map((cell, ci) => (
           <div key={`${ri}-${ci}`} className={`rounded-xl flex items-center justify-center text-3xl font-black transition-all duration-300
             ${cell === 0 ? 'bg-[#cdc1b4]' : (cell < 8 ? 'bg-[#eee4da] text-[#776e65]' : 'bg-[#f2b179] text-white')}
           `}>
             {cell || ''}
           </div>
         )))}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">
         <div />
         <button onClick={() => move('UP')} className="p-4 bg-[#bbada0] text-white rounded-xl active:scale-90 shadow-lg"><ArrowUpRight className="-rotate-45" /></button>
         <div />
         <button onClick={() => move('LEFT')} className="p-4 bg-[#bbada0] text-white rounded-xl active:scale-90 shadow-lg"><ArrowUpRight className="-rotate-135" /></button>
         <button onClick={() => move('DOWN')} className="p-4 bg-[#bbada0] text-white rounded-xl active:scale-90 shadow-lg"><ArrowUpRight className="rotate-135" /></button>
         <button onClick={() => move('RIGHT')} className="p-4 bg-[#bbada0] text-white rounded-xl active:scale-90 shadow-lg"><ArrowUpRight className="rotate-45" /></button>
      </div>
    </div>
  );
};

const RemindersApp = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Buy groceries', completed: false, category: 'Personal' },
    { id: 2, text: 'Finish project', completed: true, category: 'Work' },
    { id: 3, text: 'Workout', completed: false, category: 'Health' },
  ]);

  return (
    <div className="h-full bg-white p-10 text-gray-900 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-10">
         <h2 className="text-4xl font-black tracking-tight text-blue-600">Reminders</h2>
         <Plus size={32} className="text-blue-600" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
         {[ { name: 'Today', count: 3, color: 'bg-blue-600', icon: 'Calendar' }, { name: 'Scheduled', count: 12, color: 'bg-red-500', icon: 'Clock' }, { name: 'All', count: 42, color: 'bg-gray-800', icon: 'ListTodo' }, { name: 'Flagged', count: 1, color: 'bg-orange-500', icon: 'Star' } ].map((box, i) => (
           <div key={i} className="bg-gray-50 p-6 rounded-[28px] border border-gray-100 flex flex-col justify-between h-32 hover:bg-gray-100 transition-all cursor-pointer">
              <div className="flex justify-between">
                 <div className={`${box.color} w-10 h-10 rounded-full flex items-center justify-center text-white`}>
                    <IconComponent name={box.icon} size={20} />
                 </div>
                 <span className="text-3xl font-black text-gray-900">{box.count}</span>
              </div>
              <span className="font-bold text-gray-500">{box.name}</span>
           </div>
         ))}
      </div>

      <h3 className="text-2xl font-black mb-6">List</h3>
      <div className="space-y-2 overflow-y-auto hidden-scrollbar">
         {tasks.map(t => (
           <div key={t.id} className="flex items-center gap-4 py-4 border-b border-gray-50">
              <button 
                onClick={() => setTasks(tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x))}
                className={`w-6 h-6 rounded-full border-2 transition-all ${t.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-200'}`}
              >
                 {t.completed && <Check size={14} className="text-white mx-auto" />}
              </button>
              <span className={`text-lg font-medium ${t.completed ? 'text-gray-300 line-through' : 'text-gray-900'}`}>{t.text}</span>
              <span className="ml-auto text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{t.category}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

const BooksApp = () => {
  const books = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    title: `Book ${i + 1}`,
    author: 'Famous Author',
    cover: `https://picsum.photos/seed/book-${i}/300/450`
  }));

  return (
    <div className="h-full bg-white flex flex-col font-sans">
      <div className="p-10 pb-6 border-b border-gray-100">
         <h2 className="text-4xl font-black tracking-tight mb-2">My Library</h2>
         <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">All Books</p>
      </div>
      <div className="flex-1 overflow-y-auto p-10 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-8 hidden-scrollbar">
         {books.map(b => (
           <div key={b.id} className="flex flex-col gap-3 group">
              <div className="aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all group-hover:-translate-y-2">
                 <img src={b.cover} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                 <p className="font-black text-sm line-clamp-1">{b.title}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{b.author}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

const StocksApp = () => {
  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '182.52', change: '+1.24%' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '142.30', change: '-0.45%' },
    { symbol: 'MSFT', name: 'Microsoft', price: '402.10', change: '+0.89%' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: '175.20', change: '+4.52%' },
    { symbol: 'NVDA', name: 'NVIDIA', price: '890.30', change: '+2.10%' },
  ];

  return (
    <div className="h-full bg-black p-10 text-white flex flex-col font-sans overflow-y-auto hidden-scrollbar">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
         <div>
            <h2 className="text-4xl font-black tracking-tight">Stocks</h2>
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Market Overview</p>
         </div>
         <TrendingUp size={32} className="text-green-500" />
      </div>

      <div className="space-y-4">
         {stocks.map((s, i) => (
           <div key={i} className="flex justify-between items-center p-6 bg-zinc-900 rounded-[32px] border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
              <div>
                 <p className="text-xl font-black group-hover:text-amber-400 transition-colors">{s.symbol}</p>
                 <p className="text-xs font-bold text-gray-500">{s.name}</p>
              </div>
              <div className="text-right">
                 <p className="text-xl font-black tabular-nums">{s.price}</p>
                 <p className={`text-xs font-black px-3 py-1 rounded-full inline-block mt-1 ${s.change.startsWith('+') ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {s.change}
                 </p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

const NewsApp = () => {
  const news = [
    { title: "Major Breakthrough in Quantum Computing", source: "Tech Daily", category: "Technology", image: "https://picsum.photos/seed/tech/400/250" },
    { title: "New Discovery in Ancient Civilizations", source: "History Mag", category: "Science", image: "https://picsum.photos/seed/history/400/250" },
    { title: "Global Sports Event Kicks Off in Paris", source: "World Sports", category: "Sports", image: "https://picsum.photos/seed/sports/400/250" },
  ];

  return (
    <div className="h-full bg-white flex flex-col font-sans overflow-y-auto hidden-scrollbar">
      <div className="p-10 pb-6 border-b border-gray-100 flex justify-between items-end">
         <div>
            <h2 className="text-5xl font-black tracking-tighter">News</h2>
            <p className="text-red-600 font-black uppercase tracking-widest text-xs mt-2">Latest Updates</p>
         </div>
         <p className="text-gray-400 font-bold">April 18, 2026</p>
      </div>

      <div className="p-10 space-y-12">
         {news.map((item, i) => (
           <div key={i} className="flex flex-col gap-6 group cursor-pointer">
              <div className="aspect-video bg-gray-100 rounded-[40px] overflow-hidden shadow-xl group-hover:scale-[1.02] transition-all">
                 <img src={item.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="px-4">
                 <p className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-3">{item.category}</p>
                 <h3 className="text-3xl font-black leading-tight mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                 <p className="text-gray-400 font-bold">{item.source} • 2h ago</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

const ContactsApp = () => {
  const contacts = [
    { name: "John Doe", job: "Software Engineer", phone: "+998 90 123 45 67", initials: "JD", color: "bg-blue-500" },
    { name: "Jane Smith", job: "Product Designer", phone: "+998 90 765 43 21", initials: "JS", color: "bg-pink-500" },
    { name: "Muhammadyusuf", job: "Developer", phone: "+998 99 999 99 99", initials: "M", color: "bg-orange-500" },
    { name: "Lazizbek", job: "UI Explorer", phone: "+998 91 111 22 33", initials: "L", color: "bg-green-500" },
  ];

  return (
    <div className="h-full bg-gray-50 flex font-sans">
      <div className="w-80 bg-white border-r border-gray-100 p-8 flex flex-col gap-8 shadow-sm">
         <h2 className="text-3xl font-black tracking-tight">Contacts</h2>
         <div className="bg-gray-100 p-3 rounded-2xl flex items-center gap-2">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search" className="bg-transparent outline-none w-full font-medium" />
         </div>
         <div className="space-y-2">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all">
                 <div className={`w-10 h-10 ${c.color} rounded-full flex items-center justify-center text-white font-black shadow-lg`}>
                    {c.initials}
                 </div>
                 <span className="font-bold text-gray-800">{c.name}</span>
              </div>
            ))}
         </div>
      </div>
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-20 text-center">
         <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-8 shadow-inner">
            <User size={64} />
         </div>
         <h3 className="text-4xl font-black tracking-tight text-gray-900 mb-2">No Contact Selected</h3>
         <p className="text-gray-400 font-bold">Select a contact to view their details.</p>
      </div>
    </div>
  );
};

const FitnessApp = () => {
  return (
    <div className="h-full bg-black p-10 text-white flex flex-col font-sans overflow-y-auto hidden-scrollbar">
       <div className="flex items-center justify-between mb-12">
          <h2 className="text-5xl font-black tracking-tighter">Fitness</h2>
          <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center text-green-500 shadow-xl">
             <Activity size={32} />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-zinc-900 p-8 rounded-[40px] border border-white/5 shadow-2xl">
             <p className="text-green-500 font-black uppercase tracking-widest text-xs mb-4">Activity</p>
             <p className="text-5xl font-black tabular-nums">480 <span className="text-xl text-gray-500">kcal</span></p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-[40px] border border-white/5 shadow-2xl">
             <p className="text-blue-500 font-black uppercase tracking-widest text-xs mb-4">Exercise</p>
             <p className="text-5xl font-black tabular-nums">35 <span className="text-xl text-gray-500">min</span></p>
          </div>
       </div>

       <h3 className="text-2xl font-black mb-8 px-2">Workouts</h3>
       <div className="space-y-4">
          {[ { name: 'Indoor Run', time: 'Yesterday', icon: 'Zap' }, { name: 'Functional Force', time: 'Monday', icon: 'Dumbbell' }, { name: 'Yoga with Adriene', time: 'April 15', icon: 'Waves' } ].map((w, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-zinc-900/50 rounded-[32px] border border-white/5 hover:border-white/15 transition-all cursor-pointer">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-green-500">
                     <IconComponent name={w.icon} size={32} />
                  </div>
                  <div>
                     <p className="text-xl font-black">{w.name}</p>
                     <p className="text-sm font-bold text-gray-500">{w.time}</p>
                  </div>
               </div>
               <ChevronRight className="text-gray-700" />
            </div>
          ))}
       </div>
    </div>
  );
};

const PodcastApp = () => {
  return (
    <div className="h-full bg-white flex flex-col font-sans overflow-y-auto hidden-scrollbar">
       <div className="p-10 pb-6 border-b border-gray-100">
          <h2 className="text-4xl font-black tracking-tight mb-2">Listen Now</h2>
          <p className="text-purple-600 font-black uppercase tracking-widest text-xs">Recently Played</p>
       </div>
       <div className="p-10 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="flex flex-col gap-4 group cursor-pointer">
               <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-lg group-hover:scale-105 transition-all">
                  <img src={`https://picsum.photos/seed/pod-${i}/400/400`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </div>
               <div>
                  <p className="font-black text-lg line-clamp-1">Podcast Episode #{i}</p>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Creator Name</p>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

const StickmanGame = () => {
  return (
    <div className="h-full bg-sky-100 flex flex-col items-center justify-center font-sans">
       <div className="relative w-full max-w-2xl h-80 bg-white rounded-[40px] shadow-2xl border-b-8 border-green-500 overflow-hidden flex flex-col items-center justify-end p-20">
          <motion.div 
            animate={{ y: [0, -100, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-12 h-24 bg-black rounded-lg"
          />
          <p className="mt-10 text-2xl font-black text-gray-400">STICKMAN RUNNER</p>
       </div>
       <button className="mt-12 bg-black text-white px-12 py-5 rounded-full text-2xl font-black shadow-xl active:scale-90 transition-all">START GAME</button>
    </div>
  );
};

const BrickBreakerGame = () => {
  return (
    <div className="h-full bg-slate-900 p-10 flex flex-col items-center justify-center font-sans overflow-hidden">
       <div className="w-full max-w-md bg-black/50 rounded-3xl border border-white/10 aspect-[4/5] p-4 flex flex-col shadow-2xl">
          <div className="grid grid-cols-8 gap-1 mb-20">
             {Array.from({ length: 40 }).map((_, i) => (
               <div key={i} className={`h-4 rounded-sm ${i < 8 ? 'bg-red-500' : i < 16 ? 'bg-orange-500' : 'bg-yellow-500'}`} />
             ))}
          </div>
          <div className="flex-1 relative">
             <motion.div 
               animate={{ x: [0, 300, 0], y: [0, 400, 0] }}
               transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
               className="w-4 h-4 bg-white rounded-full absolute top-0 left-0"
             />
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-blue-500 rounded-full" />
          </div>
       </div>
       <div className="mt-8 text-white font-black text-2xl tracking-widest uppercase opacity-40">Brick Breaker PRO</div>
    </div>
  );
};

const HomeApp = () => {
  return (
    <div className="h-full bg-slate-50 p-10 font-sans flex flex-col overflow-y-auto hidden-scrollbar">
       <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-black tracking-tight text-gray-900">Home</h2>
          <Plus size={32} className="text-orange-500" />
       </div>
       <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex flex-col justify-between h-48 group">
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                   <HomeIcon size={24} />
                </div>
                <div className="w-12 h-6 bg-gray-100 rounded-full p-1 flex items-center justify-start group-hover:justify-end transition-all">
                   <div className="w-4 h-full bg-white rounded-full shadow-sm" />
                </div>
             </div>
             <div>
                <p className="font-black text-xl">Living Room</p>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">4 Lights On</p>
             </div>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex flex-col justify-between h-48 opacity-60">
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500">
                   <Thermometer size={24} />
                </div>
             </div>
             <div>
                <p className="font-black text-xl">Nest</p>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">72° • Cooling</p>
             </div>
          </div>
       </div>
       <h3 className="text-2xl font-black mb-6 px-2">Scenes</h3>
       <div className="grid grid-cols-3 gap-4">
          {[ 'Arriving Home', 'Good Night', 'Movie Night' ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer">
               <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-gray-400">
                  <Zap size={16} />
               </div>
               <span className="font-bold text-sm">{s}</span>
            </div>
          ))}
       </div>
    </div>
  );
};

const WalletApp = () => {
  return (
    <div className="h-full bg-black p-10 flex flex-col font-sans overflow-hidden">
       <div className="flex justify-between items-center mb-10 text-white">
          <h2 className="text-4xl font-black tracking-tight">Wallet</h2>
          <Plus size={32} className="text-white" />
       </div>
       <div className="relative flex-1">
          <motion.div 
            initial={{ y: 0 }}
            whileHover={{ y: -20 }}
            className="absolute top-0 left-0 right-0 bg-gradient-to-br from-indigo-600 to-indigo-800 h-64 rounded-[32px] p-8 shadow-2xl border border-white/10 text-white flex flex-col justify-between"
          >
             <div className="flex justify-between items-start">
                <p className="font-bold tracking-widest">VISA</p>
                <div className="w-12 h-10 bg-amber-400/20 rounded-md border border-amber-400/30" />
             </div>
             <div className="text-2xl font-mono tracking-[0.3em]">**** **** **** 7777</div>
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-[10px] uppercase opacity-40 mb-1">Card Holder</p>
                   <p className="font-black tracking-tight">MUHAMMADYUSUF</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] uppercase opacity-40 mb-1">Expires</p>
                   <p className="font-bold text-xs uppercase opacity-40 mb-1">Card Holder</p>
                   <p className="font-black tracking-tight">MUHAMMADYUSUF</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] uppercase opacity-40 mb-1">Expires</p>
                   <p className="font-bold">12/30</p>
                </div>
             </div>
          </motion.div>
          <motion.div 
            initial={{ y: 150 }}
            whileHover={{ y: 130 }}
            className="absolute top-0 left-0 right-0 bg-gradient-to-br from-zinc-800 to-zinc-950 h-64 rounded-[32px] p-8 shadow-2xl border border-white/10 text-white flex flex-col justify-between"
          >
             <div className="flex justify-between items-start">
                <p className="font-bold tracking-widest">SILVER</p>
             </div>
             <div className="text-2xl font-mono tracking-[0.3em]">**** **** **** 8888</div>
             <div className="flex justify-between items-end">
                <p className="font-bold">TITANIUM CARD</p>
             </div>
          </motion.div>
       </div>
    </div>
  );
};

const MeasureApp = () => {
  return (
    <div className="h-full bg-black relative flex flex-col items-center justify-center font-sans">
       <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full grid grid-cols-[repeat(50,minmax(0,1fr))] grid-rows-[repeat(50,minmax(0,1fr))]">
             {Array.from({ length: 2500 }).map((_, i) => (
               <div key={i} className="border-[0.5px] border-white/20" />
             ))}
          </div>
       </div>
       <div className="relative">
          <div className="w-80 h-1 bg-white shadow-[0_0_20px_white]">
             <div className="absolute -left-1 -top-2 w-2 h-5 bg-white rounded-full" />
             <div className="absolute -right-1 -top-2 w-2 h-5 bg-white rounded-full" />
          </div>
          <p className="mt-8 text-white text-6xl font-black tabular-nums tracking-tighter text-center">32 <span className="text-xl text-gray-500 uppercase tracking-widest ml-2">cm</span></p>
       </div>
       <div className="absolute bottom-20 flex gap-4">
          <button className="bg-white text-black px-10 py-4 rounded-full font-black shadow-2xl active:scale-95 transition-all">ADD POINT</button>
          <button className="bg-zinc-800 text-white px-10 py-4 rounded-full font-black shadow-2xl active:scale-95 transition-all border border-white/10">RESET</button>
       </div>
       <div className="absolute top-20 text-white/40 font-black uppercase tracking-[0.5em] text-xs">Augmented Reality</div>
    </div>
  );
};

const PongGame = () => {
  return (
    <div className="h-full bg-black flex items-center justify-center p-10 font-mono">
       <div className="w-full max-w-2xl aspect-video bg-zinc-900 border-4 border-white rounded-[40px] relative shadow-2xl overflow-hidden">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 border-l-2 border-dashed border-white/20" />
          <div className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-24 bg-white rounded-full" />
          <div className="absolute right-8 top-1/4 -translate-y-1/2 w-4 h-24 bg-white rounded-full" />
          <motion.div 
            animate={{ x: [0, 600, 0], y: [0, 300, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full shadow-[0_0_20px_white]"
          />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-20 text-white text-6xl font-black opacity-20">
             <span>0</span>
             <span>3</span>
          </div>
       </div>
    </div>
  );
};

const HangmanGame = () => {
  return (
    <div className="h-full bg-amber-50 p-10 flex flex-col items-center font-sans">
       <h2 className="text-4xl font-black mb-12 tracking-tight text-amber-900">Hangman Master</h2>
       <div className="flex gap-20 items-center mb-12">
          <div className="w-48 h-64 border-b-8 border-l-8 border-t-8 border-amber-900 relative">
             <div className="absolute top-0 right-0 w-8 h-8 rounded-full border-4 border-amber-900 bg-white" />
          </div>
          <div className="flex gap-4">
             {["_", "A", "P", "_", "E"].map((l, i) => (
               <div key={i} className="w-12 h-16 border-b-4 border-amber-900 flex items-center justify-center text-4xl font-black text-amber-900">
                  {l === "_" ? "" : l}
               </div>
             ))}
          </div>
       </div>
       <div className="grid grid-cols-7 gap-2">
          {"QWERTYUIOPASDFGHJKLZXCVBNM".split("").map(k => (
            <button key={k} className="w-12 h-12 bg-white rounded-xl shadow-md border border-amber-100 font-black text-amber-900 active:scale-95 transition-all">{k}</button>
          ))}
       </div>
    </div>
  );
};

const SpaceAdventureGame = () => {
  return (
    <div className="h-full bg-slate-950 p-10 flex flex-col items-center font-sans overflow-hidden">
       <div className="w-full h-full relative">
          <div className="absolute inset-0">
             {Array.from({ length: 50 }).map((_, i) => (
               <motion.div 
                 key={i}
                 animate={{ opacity: [0.2, 1, 0.2] }}
                 transition={{ repeat: Infinity, duration: Math.random() * 3 + 2 }}
                 className="absolute w-1 h-1 bg-white rounded-full"
                 style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
               />
             ))}
          </div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
             <Rocket size={64} className="text-orange-500 fill-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]" />
          </motion.div>
          <div className="absolute top-10 right-10 text-white font-black text-xl">Score: 12,450</div>
       </div>
       <div className="absolute bottom-10 flex gap-8">
          <button className="w-20 h-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"><ChevronLeft size={32} /></button>
          <button className="w-20 h-20 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">🔥</button>
          <button className="w-20 h-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"><ChevronRight size={32} /></button>
       </div>
    </div>
  );
};

const CompassApp = () => {
  return (
    <div className="h-full bg-black flex flex-col items-center justify-center text-white font-sans p-10">
       <div className="relative w-80 h-80 rounded-full border-4 border-zinc-700 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 flex flex-col items-center justify-between p-4 text-zinc-500 font-black text-xl">
             <span>N</span>
             <span>S</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-between p-4 text-zinc-500 font-black text-xl">
             <span>W</span>
             <span>E</span>
          </div>
          <motion.div animate={{ rotate: 15 }} className="w-1 h-64 bg-zinc-800 rounded-full flex flex-col justify-between">
             <div className="w-full h-32 bg-red-600 rounded-t-full shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
          </motion.div>
          <div className="w-4 h-4 bg-zinc-400 rounded-full shadow-lg z-10" />
       </div>
       <div className="mt-12 text-center">
          <p className="text-6xl font-black tracking-tighter tabular-nums mb-2">342° NW</p>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Toshkent, O'zbekiston</p>
       </div>
    </div>
  );
};

const SpaceInvadersGame = () => {
  return (
    <div className="h-full bg-black flex flex-col items-center justify-center p-10 font-mono">
       <div className="w-full max-w-lg aspect-video bg-zinc-900 rounded-[32px] border-4 border-green-500 p-8 flex flex-col shadow-[0_0_50px_rgba(34,197,94,0.3)] overflow-hidden">
          <div className="grid grid-cols-8 gap-4 mb-20">
             {Array.from({ length: 24 }).map((_, i) => (
               <Ghost key={i} size={24} className="text-green-500 animate-pulse" />
             ))}
          </div>
          <div className="mt-auto flex justify-center">
             <div className="w-12 h-10 bg-green-500 rounded-t-xl" />
          </div>
       </div>
    </div>
  );
};

// Additional 10 App Templates
const StocksApp_Details = () => <div className="p-10 text-center font-black text-gray-400">Stocks Pro - Real-time Analysis</div>;
const NewsApp_Regional = () => <div className="p-10 text-center font-black text-gray-400">Global News - Breaking Local</div>;
const ContactSupportApp = () => <div className="p-10 text-center font-black text-gray-400">Customer Support v2.0</div>;
const FitnessProApp = () => <div className="p-10 text-center font-black text-gray-400">Fitness Pro - Advanced Tracking</div>;
const PodcastStudioApp = () => <div className="p-10 text-center font-black text-gray-400">Podcast Studio - Record Now</div>;
const Measure_ExpertApp = () => <div className="p-10 text-center font-black text-gray-400">Measure Expert - AR Pro</div>;
const Home_ControlApp = () => <div className="p-10 text-center font-black text-gray-400">Home Control - Automation Explorer</div>;
const WalletPlusApp = () => <div className="p-10 text-center font-black text-gray-400">Wallet Plus - Multi-currency</div>;
const Translation_v2App = () => <div className="p-10 text-center font-black text-gray-400">Translate Pro - Real-time Voice</div>;
const Book_ReaderApp = () => <div className="p-10 text-center font-black text-gray-400">Book Reader - Night Mode</div>;

// Additional 10 Game Templates
const ChessGame = () => <div className="p-10 text-center font-black text-gray-400">Grandmaster Chess v1.0</div>;
const SolitaireGame = () => <div className="p-10 text-center font-black text-gray-400">Classic Solitaire - Cards</div>;
const CrosswordGame = () => <div className="p-10 text-center font-black text-gray-400">Daily Crossword Puzzle</div>;
const PacmanGame = () => <div className="p-10 text-center font-black text-gray-400">Retro Arcade Runner</div>;
const TowerDefenseGame = () => <div className="p-10 text-center font-black text-gray-400">Kingdom Defense - Strategy</div>;
const PlatformerGame = () => <div className="p-10 text-center font-black text-gray-400">Level Up - Platform Adventure</div>;
const BubbleShooterGame = () => <div className="p-10 text-center font-black text-gray-400">Pop All Bubbles - Match 3</div>;
const PinballGame = () => <div className="p-10 text-center font-black text-gray-400">Hyper Speed Pinball</div>;
const SimonSaysGame = () => <div className="p-10 text-center font-black text-gray-400">Memory Master - Simon Says</div>;
const WhackAMoleGame = () => <div className="p-10 text-center font-black text-gray-400">Mole Smasher - Fast Action</div>;

// 40 MORE GAMES
const ColorMatchGame = () => <div className="h-full bg-gradient-to-br from-indigo-500 to-purple-800 flex flex-col items-center justify-center p-10"><div className="grid grid-cols-2 gap-4"><div className="w-20 h-20 bg-red-400 rounded-2xl animate-pulse" /><div className="w-20 h-20 bg-blue-400 rounded-2xl" /><div className="w-20 h-20 bg-green-400 rounded-2xl" /><div className="w-20 h-20 bg-yellow-400 rounded-2xl animate-bounce" /></div><p className="mt-10 text-white font-black text-2xl">Color Match Pro</p></div>;
const NumberSlideGame = () => <div className="h-full bg-orange-50 flex flex-col items-center justify-center p-10"><div className="grid grid-cols-3 gap-2 bg-orange-100 p-4 rounded-3xl shadow-inner">{[1,2,3,4,5,6,7,8,""].map((n, i) => <div key={i} className="w-16 h-16 bg-white rounded-xl shadow flex items-center justify-center text-2xl font-black text-orange-600 cursor-pointer hover:bg-orange-500 hover:text-white transition-all">{n}</div>)}</div><p className="mt-8 text-orange-900 font-black text-xl uppercase tracking-widest">Number Slide</p></div>;
const MemoryTilesGame = () => <div className="h-full bg-zinc-900 p-10 flex flex-col items-center justify-center"><div className="grid grid-cols-4 gap-3">{Array.from({length: 16}).map((_, i) => <div key={i} className="w-14 h-14 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white/20"><HelpCircle size={20} /></div>)}</div><p className="mt-8 text-white font-black text-xl tracking-tighter">Memory Tiles HD</p></div>;
const ReactionTestGame = () => <div className="h-full bg-red-500 p-10 flex flex-col items-center justify-center cursor-pointer active:bg-green-500 transition-colors"><p className="text-white text-4xl font-black text-center">WAIT FOR GREEN<br/>THEN CLICK!</p></div>;
const BallBalanceGame = () => <div className="h-full bg-sky-100 p-10 flex flex-col items-center justify-center"><div className="w-64 h-2 bg-slate-800 rounded-full relative"><motion.div animate={{ x: [-100, 100, -100] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="absolute -top-4 left-1/2 w-8 h-8 bg-red-500 rounded-full shadow-lg" /></div><p className="mt-12 font-black text-slate-800 uppercase tracking-[0.3em]">Ball Balance 3D</p></div>;
const TowerStackGame = () => <div className="h-full bg-emerald-500 p-10 flex flex-col items-center justify-end overflow-hidden"><motion.div animate={{ y: [0, -300] }} transition={{ repeat: Infinity, duration: 5 }} className="w-32 h-20 bg-white mb-2 rounded-lg shadow-xl" /><div className="w-32 h-20 bg-white/80 mb-2 rounded-lg" /><div className="w-32 h-20 bg-white/60 mb-2 rounded-lg" /><div className="w-32 h-20 bg-white/40 mb-2 rounded-lg" /><p className="absolute top-20 text-white font-black text-3xl">Tower Stack Pro</p></div>;
const FruitSlasherGame = () => <div className="h-full bg-black/90 p-10 flex flex-col items-center justify-center relative"><motion.div animate={{ y: [400, -200, 400], rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl">🍎</motion.div><motion.div animate={{ x: [-200, 200, -200], rotate: -360 }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl absolute">🍉</motion.div><p className="mt-20 text-white font-black text-2xl uppercase tracking-widest">Fruit Slasher</p></div>;
const RacingProGame = () => <div className="h-full bg-zinc-800 p-10 flex flex-col items-center justify-center"><div className="w-48 h-full bg-zinc-900 border-x-4 border-dashed border-zinc-700 relative flex justify-center"><motion.div animate={{ y: [400, -400] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-20 bg-red-600 rounded-xl mt-auto absolute bottom-10" /></div><p className="absolute bottom-10 text-white font-black text-xl italic">RACING PRO 2026</p></div>;
const DesertRunGame = () => <div className="h-full bg-amber-200 p-10 flex flex-col items-center justify-center overflow-hidden"><motion.div animate={{ x: [400, -400] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="text-4xl absolute top-1/2">🌵</motion.div><p className="mt-20 font-black text-amber-900 text-3xl">Desert Runner</p></div>;
const ArcticAdvGame = () => <div className="h-full bg-blue-50 p-10 flex flex-col items-center justify-center"><div className="text-6xl animate-bounce">🐧</div><p className="mt-8 font-black text-blue-900 text-2xl">Arctic Adventure</p></div>;
const TankBattleGame = () => <div className="h-full bg-green-900 p-10 flex flex-col items-center justify-center"><div className="w-24 h-24 bg-green-700 border-4 border-green-600 rounded-2xl relative"><div className="absolute top-1/2 left-1/2 w-20 h-4 bg-green-700 -translate-y-1/2" /></div><p className="mt-12 text-white font-black text-xl">Tank Battle Royale</p></div>;
const PixelQuestGame = () => <div className="h-full bg-black p-10 flex flex-col items-center justify-center"><div className="w-16 h-16 bg-blue-500 animate-pulse border-4 border-white" /><p className="mt-10 text-white font-mono font-black text-2xl tracking-tighter">PIXEL QUEST: BEGINS</p></div>;
const AlienHunterGame = () => <div className="h-full bg-indigo-950 p-10 flex flex-col items-center justify-center"><div className="text-6xl animate-spin">🛸</div><p className="mt-12 text-white font-black text-2xl uppercase tracking-[0.4em]">Alien Hunter</p></div>;
const ZombieSurviveGame = () => <div className="h-full bg-gray-900 p-10 flex flex-col items-center justify-center"><div className="text-6xl animate-pulse">🧟</div><p className="mt-12 text-green-500 font-black text-2xl italic tracking-tighter">ZOMBIE SURVIVAL</p></div>;
const KnightQuestGame = () => <div className="h-full bg-slate-100 p-10 flex flex-col items-center justify-center"><div className="text-6xl">⚔️</div><p className="mt-8 font-black text-slate-800 text-3xl">Knight's Quest</p></div>;
const NinjaStealthGame = () => <div className="h-full bg-black p-10 flex flex-col items-center justify-center"><div className="text-6xl opacity-20 hover:opacity-100 transition-opacity">🥷</div><p className="mt-8 text-white font-black text-2xl">Ninja Stealth</p></div>;
const RobotWarGame = () => <div className="h-full bg-zinc-300 p-10 flex flex-col items-center justify-center"><div className="text-6xl animate-pulse">🤖</div><p className="mt-8 font-black text-zinc-900 text-3xl uppercase tracking-widest">ROBOT WAR III</p></div>;
const PortalJumpGame = () => <div className="h-full bg-black p-10 flex flex-col items-center justify-center"><div className="w-32 h-32 rounded-full border-8 border-blue-500 animate-spin flex items-center justify-center"><div className="w-24 h-24 rounded-full border-4 border-orange-500" /></div><p className="mt-12 text-white font-black text-2xl italic">PORTAL JUMPER</p></div>;
const GravityRushGame = () => <div className="h-full bg-white p-10 flex flex-col items-center justify-center overflow-hidden"><motion.div animate={{ y: [-300, 300] }} transition={{ repeat: Infinity, duration: 2, yoyo: true }} className="text-6xl">🍏</motion.div><p className="mt-10 font-black text-gray-900 text-2xl">Gravity Rush Pro</p></div>;
const TimeTravelGame = () => <div className="h-full bg-purple-900 p-10 flex flex-col items-center justify-center"><Clock size={80} className="text-white animate-spin" /><p className="mt-10 text-white font-black text-3xl tracking-[0.5em]">TIME TRAVELER</p></div>;
const GhostBusterGame = () => <div className="h-full bg-zinc-950 p-10 flex flex-col items-center justify-center"><GhostIcon size={80} className="text-green-400 animate-pulse" /><p className="mt-8 text-green-400 font-black text-2xl">GHOST BUSTER 2026</p></div>;
const MonsterMashGame = () => <div className="h-full bg-pink-900 p-10 flex flex-col items-center justify-center"><div className="text-8xl">👹</div><p className="mt-8 text-white font-black text-3xl">Monster Mash</p></div>;
const DinoRunGame = () => <div className="h-full bg-yellow-50 p-10 flex flex-col items-center justify-center overflow-hidden"><div className="text-6xl animate-bounce mb-4">🦖</div><div className="w-full h-2 bg-yellow-900 rounded-full" /><p className="mt-8 font-black text-yellow-900 text-2xl">Dino Run Classic</p></div>;
const StarFighterGame = () => <div className="h-full bg-black p-10 flex flex-col items-center justify-center"><StarIcon size={64} className="text-yellow-400 animate-ping mb-4" /><p className="text-white font-black text-3xl tracking-widest">STAR FIGHTER</p></div>;
const TreasureHuntGame = () => <div className="h-full bg-amber-600 p-10 flex flex-col items-center justify-center"><div className="text-8xl mb-6">💎</div><p className="text-white font-black text-3xl tracking-tighter shadow-xl">Treasure Hunter</p></div>;
const DeepSeaGame = () => <div className="h-full bg-blue-900 p-10 flex flex-col items-center justify-center"><div className="text-6xl animate-pulse mb-4">🦈</div><p className="text-white font-black text-xl italic">Deep Sea Explorer</p></div>;
const VolcanicEscapeGame = () => <div className="h-full bg-red-950 p-10 flex flex-col items-center justify-center"><Flame size={80} className="text-orange-600 mb-6 animate-bounce" /><p className="text-white font-black text-2xl">VOLCANIC ESCAPE</p></div>;
const CyberCityGame = () => <div className="h-full bg-black p-10 flex flex-col items-center justify-center"><div className="w-full h-40 border-t-2 border-b-2 border-cyan-500 relative flex items-center justify-center"><p className="text-cyan-500 font-black text-4xl shadow-[0_0_20px_cyan]">CYBER CITY</p></div></div>;
const MagicKingdomGame = () => <div className="h-full bg-violet-100 p-10 flex flex-col items-center justify-center"><div className="text-8xl mb-6 animate-bounce">🏰</div><p className="font-black text-violet-900 text-3xl">Magic Kingdom</p></div>;
const DragonFlightGame = () => <div className="h-full bg-orange-950 p-10 flex flex-col items-center justify-center"><div className="text-8xl mb-6 animate-pulse">🐉</div><p className="text-orange-500 font-black text-2xl italic uppercase tracking-widest">Dragon Flight</p></div>;
const JungleJumpGame = () => <div className="h-full bg-green-50 p-10 flex flex-col items-center justify-center"><div className="text-8xl mb-6 animate-bounce">🐒</div><p className="text-green-900 font-black text-3xl">Jungle Jumper</p></div>;
const MegaJumpGame = () => <div className="h-full bg-sky-400 p-10 flex flex-col items-center justify-center"><ArrowUp size={80} className="text-white animate-bounce mb-6" /><p className="text-white font-black text-4xl italic">MEGA JUMP!</p></div>;
const SkyDiveGame = () => <div className="h-full bg-blue-400 p-10 flex flex-col items-center justify-center overflow-hidden"><motion.div animate={{y: [400, -400]}} transition={{repeat: Infinity, duration: 2}} className="text-6xl">🪂</motion.div><p className="mt-auto text-white font-black text-3xl shadow-lg">Sky Diver Pro</p></div>;
const ParallelUniGame = () => <div className="h-full bg-zinc-950 p-10 flex flex-col items-center justify-center"><div className="flex gap-10"><div className="w-20 h-20 bg-blue-500 rounded-full animate-pulse" /><div className="w-20 h-20 bg-red-500 rounded-full animate-pulse delay-75" /></div><p className="mt-12 text-white font-black text-2xl tracking-[0.5em]">PARALLEL UNIVERSE</p></div>;
const DungeonCrawlGame = () => <div className="h-full bg-zinc-900 p-10 flex flex-col items-center justify-center"><Skull size={80} className="text-gray-500 mb-6" /><p className="text-white font-black text-2xl uppercase tracking-widest">Dungeon Crawler</p></div>;
const CardWarsGame = () => <div className="h-full bg-slate-100 p-10 flex flex-col items-center justify-center"><div className="flex gap-4"><div className="w-20 h-32 bg-white rounded-lg shadow-xl border border-gray-200 flex items-center justify-center text-4xl font-black text-red-600">A</div><div className="w-20 h-32 bg-indigo-600 rounded-lg shadow-xl border border-white/20 flex items-center justify-center text-white text-4xl font-black">?</div></div><p className="mt-12 font-black text-slate-800 text-3xl">CARD WARS PRO</p></div>;
const SamuraiDuelGame = () => <div className="h-full bg-red-900 p-10 flex flex-col items-center justify-center"><Sword size={80} className="text-white mb-6" /><p className="text-white font-black text-3xl italic tracking-tighter">SAMURAI DUEL</p></div>;
const NinjaDashGame = () => <div className="h-full bg-black p-10 flex flex-col items-center justify-center"><motion.div animate={{x: [-300, 300]}} transition={{repeat: Infinity, duration: 1}} className="text-6xl">🥷</motion.div><p className="mt-12 text-white font-black text-2xl tracking-[0.3em]">NINJA DASH</p></div>;
const CyberPunkGame = () => <div className="h-full bg-black p-10 flex flex-col items-center justify-center"><p className="text-[#f3ef00] font-black text-5xl italic shadow-[5px_5px_#00f0ff] -skew-x-12">CYBERPUNK 2026</p></div>;
const NeonRaceGame = () => <div className="h-full bg-black p-10 flex flex-col items-center justify-center"><div className="w-64 h-40 border-4 border-pink-500 rounded-[50px] shadow-[0_0_30px_#ec4899] flex items-center justify-center"><p className="text-pink-500 font-black text-3xl animate-pulse">NEON RACE</p></div></div>;

const AIChatApp = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user' as const, parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMsg],
      });
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response.text || "Kechirasiz, xatolik yuz berdi." }] }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Xatolik: Tizimga ulanib bo'lmadi." }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col font-sans">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-lg text-white">
               <Zap size={24} fill="currentColor" />
            </div>
            <div>
               <h2 className="text-xl font-black tracking-tight">Gemini AI</h2>
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Online</span>
               </div>
            </div>
         </div>
         <button className="text-blue-600 font-bold text-sm">New Chat</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 hidden-scrollbar">
         {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-center px-10">
              <Zap size={48} className="text-indigo-600 mb-6 animate-bounce" />
              <h3 className="text-2xl font-black mb-2">Sizga qanday yordam bera olaman?</h3>
              <p className="text-gray-400 text-sm font-medium">Istalgan mavzuda savol bering yoki topshiriq bering.</p>
           </div>
         )}
         {messages.map((m, i) => (
           <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-[28px] ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none shadow-sm'}`}>
                 <p className="text-sm font-medium leading-relaxed">{m.parts[0].text}</p>
              </div>
           </div>
         ))}
         {loading && (
           <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-[28px] rounded-bl-none animate-pulse">
                 <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full delay-75" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full delay-150" />
                 </div>
              </div>
           </div>
         )}
      </div>
      <div className="p-6 bg-white border-t border-gray-100">
         <div className="bg-gray-100 p-2 rounded-[24px] flex items-center gap-3 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Habaringizni yozing..." 
              className="flex-1 bg-transparent py-2.5 px-4 outline-none text-base font-medium"
            />
            <button 
              onClick={sendMessage}
              className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all"
            >
               <Zap size={20} fill="currentColor" />
            </button>
         </div>
      </div>
    </div>
  );
};

const IconComponent = ({ name, size = 24 }: { name: string; size?: number }) => {
  const icons: Record<string, any> = {
    StickyNote, ImageIcon, Settings, Chrome, Mail, Map, Music, Phone, ShoppingBag, Video, Camera, MessageCircle, Plus, Calendar, Gamepad2, Monitor, Car, Trophy, Zap, Ghost, LayoutGrid, Calculator, Type, Keyboard, Palette, Brush, PenTool, Square, Circle, Triangle, Shapes, Files, Undo, Redo, Cloud, SunMedium, Compass, Clock, MapPin, Navigation, Timer, Disc, Divide, Sun, Moon, Code, Terminal, Activity, TrendingUp, ListTodo, BookOpen, Heart, Target, ArrowUpRight, Grid2X2, Hash, Box, Newspaper, User, Podcast, HomeIcon, Wallet, Scissors, Ruler, HelpCircle, Lightbulb, SearchCode, Languages, Book, Shield, CreditCard, Briefcase, FlaskConical, GraduationCap, HardDrive, Cpu, MousePointer2, Table, HeartPulse, Sprout, Waves, Mountain, Rocket, Bug, Brain, Dumbbell, Gamepad, Coffee, Ticket, Gavel, Scale, Atom, Microscope, Stethoscope, Umbrella, Footprints, ArrowUp, Axe, Sword, ShieldAlert, Skull, GhostIcon, Tent, Trees, CloudLightning, Flame, Droplet, Snowflake, WindIcon, SunIcon, MoonIcon, StarIcon, TargetIcon, ZapIcon, Bomb, RocketIcon, PlaneIcon, CarIcon, Bike, Ship, Anchor, CompassIcon, MapIcon, CameraIcon, Mic, MusicIcon, Speaker, Headphones, GamepadIcon, MonitorIcon, Smartphone, Watch, BatteryCharging, WifiIcon
  };
  const Icon = icons[name] || Ghost;
  return <Icon size={size} />;
};

const BootScreen = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center"
    >
       <motion.div 
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ duration: 1 }}
       >
          <svg width="120" height="120" viewBox="0 0 512 512" fill="white">
            <path d="M344.4 25.1c-19.1 22.8-49.3 38.6-77.9 36.5-3.3-27.1 10.2-58.4 28.5-80 18.2-21.7 51.5-37.5 76.5-33.1 3.5 27.6-10.4 57.1-27.1 76.6zm72 82.3c-28.7 0-66.2 18.3-88.7 18.3-22.1 0-54.6-17-79.6-17-32.9 0-63.1 19.3-80 49.3-34.2 60 8.8 149.3 42 196.8 16.2 23.3 35.5 49.7 60.1 48.8 23.3-.8 32.1-15.3 60.5-15.3 28.4 0 36.3 15.3 60.9 14.8s44.2-28.4 60.5-51.7c18.8-27.5 26.3-54.2 26.7-55.5-.6-.3-52.1-19.1-52.1-79.6 0-50.5 41.2-74.7 43.3-75.9-23.7-34.7-60.1-38.6-73.6-38.3z" />
          </svg>
       </motion.div>
       <div className="absolute bottom-32 w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-white"
          />
       </div>
    </motion.div>
  );
};

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [runningAppIds, setRunningAppIds] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('ipad_wallpaper') || 'https://picsum.photos/id/10/1920/1080');
  const [isLocked, setIsLocked] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);

  // System States
  const [isWifiOn, setIsWifiOn] = useState(true);
  const [isAirplaneMode, setIsAirplaneMode] = useState(false);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [isBluetoothOn, setIsBluetoothOn] = useState(true);
  const [brightness, setBrightness] = useState(() => Number(localStorage.getItem('ipad_brightness')) || 100);
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('ipad_volume')) || 80);
  const [deviceName, setDeviceName] = useState(() => localStorage.getItem('ipad_deviceName') || "Muhammadyusuf's iPad");
  const [nowPlaying, setNowPlaying] = useState<{ title: string; artist: string; cover: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [installedApps, setInstalledApps] = useState<AppConfig[]>(() => {
    const saved = localStorage.getItem('ipad_installedApps_ids');
    const defaultApps = [
      { id: 'notes', name: 'Notes', icon: 'StickyNote', color: 'bg-amber-400', component: <NotesApp /> },
      { id: 'photos', name: 'Photos', icon: 'ImageIcon', color: 'bg-white', component: <PhotosApp /> },
      { id: 'wallpaper_app', name: 'Wallpapers', icon: 'Zap', color: 'bg-indigo-500', component: <WallpaperApp /> },
      { id: 'settings', name: 'Settings', icon: 'Settings', color: 'bg-gray-200', component: <SettingsApp /> },
      { id: 'calculator', name: 'Calculator', icon: 'Calculator', color: 'bg-zinc-800', component: <CalculatorApp /> },
      { id: 'safari', name: 'Safari', icon: 'Chrome', color: 'bg-blue-50', component: <SafariApp /> },
      { id: 'playmarket', name: 'Play Market', icon: 'ShoppingBag', color: 'bg-white', component: <PlayMarketApp /> },
      { id: 'telegram', name: 'Telegram', icon: 'MessageCircle', color: 'bg-blue-400', component: <TelegramApp /> },
      { id: 'cargame', name: 'O\'yin: Car Racer', icon: 'Zap', color: 'bg-yellow-500', component: <CarGameApp /> },
      { id: 'youtube', name: 'YouTube', icon: 'Youtube', color: 'bg-red-600', component: <YouTubeApp /> },
      { id: 'snake', name: 'O\'yin: Snake Pro', icon: 'Ghost', color: 'bg-green-600', component: <SnakeGameApp /> },
      { id: 'tictactoe', name: 'O\'yin: Tic Tac Toe', icon: 'Gamepad2', color: 'bg-indigo-600', component: <TicTacToe /> },
      { id: '2player', name: 'O\'yin: 2 Player War', icon: 'Gamepad2', color: 'bg-orange-600', component: <TwoPlayerGame /> },
      { id: 'shooter', name: 'O\'yin: Target Hit', icon: 'Monitor', color: 'bg-red-700', component: <ShooterGameApp /> },
      { id: 'trafficracer', name: 'O\'yin: Traffic Racer', icon: 'Car', color: 'bg-zinc-800', component: <TrafficRacerApp /> },
      { id: 'memory', name: 'O\'yin: Memory Match', icon: 'LayoutGrid', color: 'bg-slate-700', component: <MemoryGameApp /> },
      { id: 'monkeytype', name: 'Monkeytype', icon: 'Keyboard', color: 'bg-[#323437]', component: <MonkeytypeApp /> },
      { id: 'tetris', name: 'O\'yin: Tetris PRO', icon: 'Shapes', color: 'bg-blue-600', component: <TetrisApp /> },
      { id: 'music', name: 'Music', icon: 'Music', color: 'bg-[#fa243c]', component: <MusicApp /> },
      { id: 'weather', name: 'Weather', icon: 'Cloud', color: 'bg-[#3eb7f1]', component: <WeatherApp /> },
      { id: 'math', name: 'O\'yin: Math Quiz', icon: 'Plus', color: 'bg-blue-600', component: <MathQuizApp /> },
      { id: 'piano', name: 'Virtual Piano', icon: 'Music', color: 'bg-black', component: <PianoApp /> },
      { id: 'sudoku', name: 'O\'yin: Sudoku', icon: 'LayoutGrid', color: 'bg-slate-300', component: <SudokuApp /> },
      { id: 'converter', name: 'Converter', icon: 'Code', color: 'bg-gray-800', component: <ConverterApp /> },
      { id: 'stopwatch', name: 'Stopwatch', icon: 'Timer', color: 'bg-zinc-800', component: <StopwatchApp /> },
      { id: 'finance', name: 'Finance', icon: 'TrendingUp', color: 'bg-slate-900', component: <FinanceApp /> },
      { id: 'health', name: 'Health', icon: 'Activity', color: 'bg-red-600', component: <HealthApp /> },
      { id: 'wordle', name: 'O\'yin: Wordle', icon: 'Grid2X2', color: 'bg-green-500', component: <WordleGame /> },
      { id: 'game2048', name: 'O\'yin: 2048', icon: 'Hash', color: 'bg-orange-400', component: <Game2048 /> },
      { id: 'reminders', name: 'Reminders', icon: 'ListTodo', color: 'bg-white', component: <RemindersApp /> },
      { id: 'books', name: 'Books', icon: 'BookOpen', color: 'bg-orange-700', component: <BooksApp /> },
      { id: 'stocks', name: 'Stocks', icon: 'TrendingUp', color: 'bg-black', component: <StocksApp /> },
      { id: 'news', name: 'News', icon: 'Newspaper', color: 'bg-white', component: <NewsApp /> },
      { id: 'contacts', name: 'Contacts', icon: 'User', color: 'bg-white', component: <ContactsApp /> },
      { id: 'fitness', name: 'Fitness', icon: 'Activity', color: 'bg-black', component: <FitnessApp /> },
      { id: 'podcast', name: 'Podcasts', icon: 'Podcast', color: 'bg-white', component: <PodcastApp /> },
      { id: 'compass', name: 'Compass', icon: 'Compass', color: 'bg-black', component: <CompassApp /> },
      { id: 'home', name: 'Home', icon: 'HomeIcon', color: 'bg-slate-50', component: <HomeApp /> },
      { id: 'wallet', name: 'Wallet', icon: 'Wallet', color: 'bg-black', component: <WalletApp /> },
      { id: 'measure', name: 'Measure', icon: 'Ruler', color: 'bg-black', component: <MeasureApp /> },
      { id: 'maps', name: 'Maps', icon: 'Compass', color: 'bg-white', component: <MapsApp /> },
      { id: 'clock', name: 'Clock', icon: 'Clock', color: 'bg-black', component: <ClockApp /> },
      { id: 'voicememos', name: 'Voice Memos', icon: 'Disc', color: 'bg-zinc-900', component: <VoiceMemosApp /> },
      { id: 'canva', name: 'Canva', icon: 'Palette', color: 'bg-[#8b3dff]', component: <CanvaApp /> },
      { id: 'calendar', name: 'Calendar', icon: 'Calendar', color: 'bg-white', component: <CalendarApp /> },
      { id: 'doodle', name: 'Doodle', icon: 'Brush', color: 'bg-fuchsia-500', component: <DoodleApp /> },
      { id: 'files', name: 'Files', icon: 'Files', color: 'bg-white', component: <FilesApp /> },
      { id: 'flappy', name: 'Flappy Bird', icon: 'Zap', color: 'bg-sky-400', component: <FlappyGameApp /> },
      { id: 'translator', name: 'Translate', icon: 'Type', color: 'bg-slate-800', component: <TranslatorApp /> },
      { id: 'aichat', name: 'AI Chat', icon: 'Zap', color: 'bg-indigo-600', component: <AIChatApp /> },
      { id: 'minesweeper', name: 'Minesweeper', icon: 'Zap', color: 'bg-zinc-900', component: <MinesweeperApp /> },
    ];

    if (saved) {
      const ids = JSON.parse(saved) as string[];
      // We need all default ones to be present, plus any preserved ones from the repo that might be added via market
      // But for simplicity in this sandbox, we just trust the stored list for now or merge
      return defaultApps; 
    }
    return defaultApps;
  });

  const openApp = (id: string) => {
    if (!runningAppIds.includes(id)) {
      setRunningAppIds([...runningAppIds, id]);
    }
    setActiveAppId(id);
  };

  const closeApp = (id: string) => {
    setRunningAppIds(runningAppIds.filter(i => i !== id));
    if (activeAppId === id) setActiveAppId(null);
  };

  const minimizeApp = () => {
    setActiveAppId(null);
  };

  const installApp = (app: AppConfig) => {
    if (!installedApps.find(a => a.id === app.id)) {
      setInstalledApps([...installedApps, app]);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Persistence
  useEffect(() => { localStorage.setItem('ipad_wallpaper', wallpaper); }, [wallpaper]);
  useEffect(() => { localStorage.setItem('ipad_brightness', String(brightness)); }, [brightness]);
  useEffect(() => { localStorage.setItem('ipad_volume', String(volume)); }, [volume]);
  useEffect(() => { localStorage.setItem('ipad_deviceName', deviceName); }, [deviceName]);
  useEffect(() => { localStorage.setItem('ipad_installedApps_ids', JSON.stringify(installedApps.map(a => a.id))); }, [installedApps]);

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const activeApp = useMemo(() => installedApps.find(a => a.id === activeAppId), [activeAppId, installedApps]);

  const contextValue: SystemContextType = {
    wallpaper,
    setWallpaper,
    installedApps,
    installApp,
    setActiveAppId,
    setIsLocked,
    deviceName,
    setDeviceName,
    isWifiOn, setIsWifiOn,
    isAirplaneMode, setIsAirplaneMode,
    isBatterySaver, setIsBatterySaver,
    isBluetoothOn, setIsBluetoothOn,
    brightness, setBrightness,
    volume, setVolume,
    nowPlaying, setNowPlaying,
    isPlaying, setIsPlaying
  };

  return (
    <SystemContext.Provider value={contextValue}>
      <AnimatePresence>
         {isBooting && <BootScreen onComplete={() => setIsBooting(false)} />}
      </AnimatePresence>
      <div className="w-screen h-screen bg-[#000] flex flex-col font-sans selection:bg-blue-500 selection:text-white overflow-hidden p-0 relative">
        
        {/* Passcode Lock Screen */}
        <AnimatePresence>
           {isLocked && (
             <LockScreen unlock={() => {
                setIsLocked(false);
                setIsBooting(true);
             }} />
           )}
        </AnimatePresence>

        {/* Screen Container - NOW FULL SCREEN */}
        <div className="relative w-full h-full bg-[#000] flex flex-col items-center">
          {/* BRIGHTNESS OVERLAY */}
            <div 
              className="absolute inset-0 pointer-events-none z-[999]" 
              style={{ backgroundColor: `black`, opacity: (100 - brightness) / 100 }} 
            />
            
            {/* Wallpapers / Background */}
            <div className="absolute inset-0 z-0">
               <motion.div 
                 key={wallpaper}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="absolute inset-0"
               >
                 {wallpaper.startsWith('CODE_W_REF_') ? (
                    <div className="w-full h-full bg-[#1a1b26] p-20 font-mono text-xl leading-loose text-blue-300">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                           <p className="text-gray-500 mb-8">// {wallpaper.replace('CODE_W_REF_', '')}.tsx</p>
                           <p className="text-pink-400">import</p> {'{'} iPad {'}'} <p className="text-pink-400">from</p> './Muhammadyusuf';
                           <br />
                           <p className="text-yellow-400 font-bold">const</p> Kernel = () ={'>'} {'{'}
                           <br />
                           &nbsp;&nbsp;&lt;!doctype html&gt;
                           <br />
                           &nbsp;&nbsp;&lt;html lang="uz"&gt;
                           <br />
                           &nbsp;&nbsp;&nbsp;&nbsp;&lt;head&gt;
                           <br />
                           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;title&gt;Muhammadyusuf's iPad Pro&lt;/title&gt;
                           <br />
                           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;script src="/_aistudio-iframe.js"&gt;&lt;/script&gt;
                           <br />
                           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;meta name="viewport" content="width=device-width, initial-scale=1.0" /&gt;
                           <br />
                           &nbsp;&nbsp;&nbsp;&nbsp;&lt;/head&gt;
                           <br />
                           &nbsp;&nbsp;&nbsp;&nbsp;&lt;body&gt;
                           <br />
                           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;div id="root"&gt;&lt;/div&gt;
                           <br />
                           &nbsp;&nbsp;&nbsp;&nbsp;&lt;/body&gt;
                        </motion.div>
                    </div>
                 ) : (
                    <img 
                      src={wallpaper} 
                      alt="Background" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                 )}
                 <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
               </motion.div>
            </div>

            <ControlCenter isOpen={showControlCenter} close={() => setShowControlCenter(false)} />

            {/* Status Bar */}
            <div className="relative w-full z-[80] px-16 py-4 flex justify-between items-center text-white text-sm font-bold">
               <div className="flex items-center gap-8">
                 <div className="flex flex-col">
                   <span className="text-xl tracking-tight leading-none">{timeString}</span>
                   <span className="text-[9px] font-black opacity-40 uppercase tracking-widest mt-1">{deviceName}</span>
                 </div>
                 <span className="text-xs font-semibold opacity-60 ml-2">{dateString}</span>
               </div>
               <div 
                 onClick={() => setShowControlCenter(true)}
                 className="flex items-center gap-6 cursor-pointer hover:bg-white/10 px-4 py-2 rounded-full transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isAirplaneMode ? <Plane size={14} className="text-orange-400" /> : (
                      <>
                        <Signal size={18} strokeWidth={2} className={isWifiOn ? 'text-white' : 'text-white/30'} />
                        <Wifi size={18} strokeWidth={2} className={isWifiOn ? 'text-white' : 'text-white/30'} />
                      </>
                    )}
                    {isBluetoothOn && <Bluetooth size={14} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[12px]">{isAirplaneMode ? '85%' : '95%'}</span>
                    <div className={`relative w-8 h-4 rounded-[4px] border ${isBatterySaver ? 'border-yellow-400' : 'border-white/40'} p-[2px]`}>
                      <div 
                        className={`h-full rounded-sm transition-all duration-500 ${isBatterySaver ? 'bg-yellow-400' : 'bg-white'}`} 
                        style={{ width: isAirplaneMode ? '85%' : '95%' }} 
                      />
                      <div className={`absolute -right-1.5 top-[5px] w-1 h-2 rounded-sm ${isBatterySaver ? 'bg-yellow-400' : 'bg-white/40'}`} />
                    </div>
                  </div>
               </div>
            </div>

            {/* Home Screen Content */}
            <main className="relative flex-1 w-full z-10 p-12 overflow-y-auto hidden-scrollbar">
               {/* Clock Widget Area - Shrinked */}
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex justify-between items-start max-w-[95%] mx-auto mb-12 relative"
               >
                  <div className="flex items-center gap-4">
                      {/* RED LOCK BUTTON */}
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsLocked(true)}
                        className="w-16 h-16 bg-red-600 rounded-[24px] flex items-center justify-center text-white shadow-lg border-2 border-white/20 hover:bg-red-500 transition-colors"
                      >
                         <Lock size={32} />
                      </motion.button>

                      <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-[32px] border border-white/20 shadow-xl flex flex-col items-center">
                          <span className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                          <span className="text-sm font-bold text-white/60 uppercase tracking-widest mt-1">{dateString}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 scale-90 origin-right">
                     <div className="w-40 h-40 bg-white/10 backdrop-blur-2xl rounded-[32px] border border-white/20 p-6 flex flex-col justify-between">
                        <Calendar size={32} className="text-red-400" />
                        <div>
                           <p className="text-xs font-bold text-white/50 uppercase">Events</p>
                           <p className="text-lg font-bold text-white">No plans Today</p>
                        </div>
                     </div>
                     <div className="w-40 h-40 bg-white/10 backdrop-blur-2xl rounded-[32px] border border-white/20 p-6 flex flex-col justify-between">
                        <ImageIcon size={32} className="text-blue-400" />
                        <div>
                           <p className="text-xs font-bold text-white/50 uppercase">Gallery</p>
                           <p className="text-lg font-bold text-white">Memories</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               <motion.div 
                 layout
                 className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-6 gap-y-12 max-w-[95%] mx-auto"
               >
                 {installedApps.map((app) => (
                   <motion.button
                     key={app.id}
                     layout
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     whileHover={{ scale: 1.1, y: -5 }}
                     whileTap={{ scale: 0.9 }}
                     onClick={() => openApp(app.id)}
                     className="flex flex-col items-center group"
                   >
                     <div className={`${app.color} w-16 h-16 rounded-[18px] shadow-lg flex items-center justify-center text-black/80 transition-all group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]`}>
                        <IconComponent name={app.icon} size={32} />
                     </div>
                     <span className="mt-2 text-white text-[11px] font-bold tracking-tight text-center line-clamp-1 drop-shadow-md">
                       {app.name}
                     </span>
                   </motion.button>
                 ))}
               </motion.div>
            </main>

            {/* Dock */}
            <div className="relative z-10 w-full flex justify-center pb-8">
               <div className="bg-white/10 backdrop-blur-[40px] border border-white/20 rounded-[36px] p-4 px-8 flex items-center gap-6 shadow-2xl">
                 {installedApps.slice(0, 7).map((app) => (
                   <motion.button
                     key={app.id}
                     whileHover={{ y: -15, scale: 1.15 }}
                     transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                     onClick={() => openApp(app.id)}
                     className={`${app.color} w-18 h-18 rounded-[20px] shadow-lg flex items-center justify-center text-black/80`}
                   >
                      <IconComponent name={app.icon} size={36} />
                   </motion.button>
                 ))}
                 <div className="w-[1px] h-12 bg-white/20 mx-2" />
                 <button className="bg-white/5 hover:bg-white/10 w-18 h-18 rounded-[20px] flex items-center justify-center text-white/80 transition-all hover:scale-110 active:scale-95">
                   <LayoutGrid size={36} />
                 </button>
               </div>
            </div>

            {/* Home Indicator - REMOVED GHOST BAR, KEPT NAVIGATION ZONE */}
            <div className="absolute bottom-0 left-0 right-0 h-4 z-50 cursor-pointer" onClick={() => setActiveAppId(null)} />
            

            {/* App Windows */}
            <div className="absolute inset-0 pointer-events-none z-40">
              {installedApps.map((app) => {
                const isRunning = runningAppIds.includes(app.id);
                const isActive = activeAppId === app.id;

                if (!isRunning) return null;

                return (
                  <motion.div
                    key={app.id}
                    initial={{ scale: 0.5, y: 500, opacity: 0, borderRadius: 100 }}
                    animate={{ 
                      scale: isActive ? 1 : 0.5, 
                      y: isActive ? 0 : 500, 
                      opacity: isActive ? 1 : 0, 
                      borderRadius: isActive ? 0 : 100,
                      pointerEvents: isActive ? 'auto' : 'none',
                      zIndex: isActive ? 50 : 0
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.5 }}
                    className="absolute inset-0 bg-[#f2f2f7] overflow-hidden flex flex-col"
                  >
                    {/* App Toolbar */}
                    <div className="flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md border-b border-black/5 pt-10">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => closeApp(app.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors group"
                            title="Close / Exit"
                          >
                            <X size={22} className="text-gray-500 group-hover:text-red-500" />
                          </button>
                          <div className="flex items-center gap-3">
                            <div className={`${app.color} w-8 h-8 rounded-lg flex items-center justify-center shadow-sm`}>
                              <IconComponent name={app.icon} size={18} />
                            </div>
                            <span className="font-bold text-black/90 text-lg tracking-tight">{app.name}</span>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={minimizeApp}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Minimize (Stays in background)"
                          >
                            <Minimize2 size={20} />
                          </button>
                        </div>
                    </div>
                    {/* App Content */}
                    <div className="flex-1 overflow-hidden">
                      {app.component}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
    </SystemContext.Provider>
  );
}
