import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Send, 
  RotateCw, 
  Lock, 
  Unlock, 
  ArrowRight, 
  Ticket, 
  ThumbsUp 
} from 'lucide-react';

// Web Audio API Sound Synthesizer helper
const playSynthSound = (type: 'beep' | 'success' | 'boing' | 'click' | 'tada' | 'spin', isSoundEnabled: boolean) => {
  if (!isSoundEnabled) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'boing') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'spin') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(420, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(520, ctx.currentTime + 0.16);
      osc.frequency.setValueAtTime(620, ctx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'tada') {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.09);
        g.gain.setValueAtTime(0.07, now + idx * 0.09);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);
        o.start(now + idx * 0.09);
        o.stop(now + idx * 0.09 + 0.45);
      });
    }
  } catch (e) {
    // Audiocontext blocked or not supported
  }
};

const NO_BUTTON_COMMENTS = [
  "Ой, промахнулась! 😉",
  "Хм, кнопка телепортировалась! 🔮",
  "Даже не пытайся отказаться! 😄",
  "Тектонические плиты сдвинулись, кнопка улетела! 🌍",
  "Служба безопасности заблокировала эту кнопку! 🛡️",
  "Загрузка... Отказано в доступе! 💻",
  "Анита, мои шутки станут смешнее, если ты нажмешь 'ДА'!",
  "Мой кот считает, что тебе нужно согласиться 🐈",
  "В космосе плачет одна звезда, когда ты нажимаешь сюда ⭐",
  "Ошибка 404: Отказ временно недоступен!",
  "Ого! Какая ловкость пальцев! Но нет 😜",
  "Кажется, мышка барахлит? Жми 'ДА'!",
  "Кофе стынет, пока ты кликаешь на 'Нет'! ☕",
  "Ах так? Кнопка удваивает скорость! 🚀",
];

const COMPLIMENTS_AND_JOKES = [
  {
    title: "Научный факт 🔬",
    text: "Исследования показали, что прогулки с хорошей компанией увеличивают уровень счастья на 450%, а уровень стресса падает ниже плинтуса. А со мной показатели удваиваются!"
  },
  {
    title: "Для поднятия улыбки ⭐",
    text: "Анита, если бы ты была созвездием, ты бы сияла ярче Большой Медведицы! Давай сделаем вечер таким же сияющим!"
  },
  {
    title: "Теория Круассана 🥐",
    text: "Слухи подтвердились: если не пойти погулять в хорошую погоду, в мире грустит один свежий круассан. Давай спасем круассан и съедим его!"
  },
  {
    title: "Прогноз погоды ☀️",
    text: "В день нашей прогулки ожидается переменная облачность, сильные порывы веселья, шквалистый ветер смешных историй и 100% вероятность улыбок!"
  },
  {
    title: "Комплимент дня 💖",
    text: "Анита, твоя харизма настолько мощная, что даже кофеин перед ней бессилен. Ты заряжаешь позитивом круче любого энергетика!"
  },
  {
    title: "Экономия калорий 🍰",
    text: "Интересный факт: во время прогулки тратится около 220 калорий. Это значит, что мы совершенно легально сможем съесть по кусочку торта!"
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "1. Твой идеальный напиток-компаньон для прогулки это...",
    options: [
      { text: "☕ Сладкий ароматный раф с сиропом", points: "кофеиновый гуру" },
      { text: "🧋 Освежающий бабл-ти с желейными шариками", points: "бабл-ти ценитель" },
      { text: "🍫 Горячий какао со взбитыми сливками", points: "уютный мечтатель" },
      { text: "💧 Чистая водичка (ЗОЖ на максималках!)", points: "активный спортсмен" }
    ]
  },
  {
    question: "2. Какой темп ходьбы Анита считает идеальным?",
    options: [
      { text: "🏃‍♀️ Бешеный тыгыдык (обогнать ветер!)", points: "метеор" },
      { text: "🚶‍♀️ Вальяжный шаг королевы (пусть все любуются)", points: "царственный" },
      { text: "📸 С остановками у каждого красивого дерева для фото", points: "эстет-фотограф" },
      { text: "🍿 Главное — идти в сторону еды!", points: "гурман" }
    ]
  },
  {
    question: "3. Что обязательно должно присутствовать на прогулке?",
    options: [
      { text: "🗣️ Душевные разговоры обо всём на свете", points: "философ" },
      { text: "🤪 Глупые шутки и громкий заразительный смех", points: "весельчак" },
      { text: "🥐 Поедание всяких вкусняшек на ходу", points: "любитель булочек" },
      { text: "🌟 Всё и сразу, заверните в подарочную упаковку!", points: "максималист" }
    ]
  }
];

// Slot Machine Choices
const SLOT_LOCATIONS = ["⛲ Красивый Парк", "🌊 Живописная Набережная", "☕ Уютная Кофейня", "🏙️ Секретная Крыша", "🌳 Ботанический Сад", "🏰 Старинные Улочки"];
const SLOT_SNACKS = ["🥐 Свежий Круассан", "🍦 Сливочное Мороженое", "🍕 Кусочек Пиццы", "🧁 Нежный Капкейк", "🍡 Сладкая Вата", "🍓 Клубника в Шоколаде"];
const SLOT_ACTIVITIES = ["🦆 Кормить наглых уток", "📸 Делать крутые селфи", "😂 Травить нелепые шутки", "🗺️ Бродить без навигатора", "💭 Болтать по душам", "🔮 Гадать на кофейной гуще"];

export default function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [noClicks, setNoClicks] = useState(0);
  const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0 });
  const [commentIndex, setCommentIndex] = useState(0);
  const [showNoWarning, setShowNoWarning] = useState(false);

  // Sound Synth Test Alert
  const [playedInitialSound, setPlayedInitialSound] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'games' | 'rules' | 'compliments'>('games');

  // Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<string | null>(null);

  // Slot Machine State
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slot1, setSlot1] = useState(SLOT_LOCATIONS[0]);
  const [slot2, setSlot2] = useState(SLOT_SNACKS[0]);
  const [slot3, setSlot3] = useState(SLOT_ACTIVITIES[0]);
  const [isSlotLocked1, setIsSlotLocked1] = useState(false);
  const [isSlotLocked2, setIsSlotLocked2] = useState(false);
  const [isSlotLocked3, setIsSlotLocked3] = useState(false);

  // Mood Booster Counter
  const [jokeIndex, setJokeIndex] = useState(0);

  // Final Decision State
  const [isAccepted, setIsAccepted] = useState(false);
  
  // Custom Invite Builder State
  const [inviteDate, setInviteDate] = useState('В эти выходные (будет супер!)');
  const [customDateValue, setCustomDateValue] = useState('');
  const [inviteDrink, setInviteDrink] = useState('🧋 Бабл-ти с шариками');
  const [inviteActivity, setInviteActivity] = useState('Болтать обо всём и кушать круассаны 🥐');
  const [customWishes, setCustomWishes] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger music click note
  const handleInteraction = () => {
    if (!playedInitialSound) {
      playSynthSound('success', isSoundEnabled);
      setPlayedInitialSound(true);
    }
  };

  const handleOpenLetter = () => {
    playSynthSound('tada', isSoundEnabled);
    setIsOpened(true);
    // Fire light celebratory confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  // Flying No button logic
  const handleNoHoverOrClick = () => {
    playSynthSound('boing', isSoundEnabled);
    setNoClicks(prev => prev + 1);
    
    // Pick random comment index
    const randomIdx = Math.floor(Math.random() * NO_BUTTON_COMMENTS.length);
    setCommentIndex(randomIdx);

    // Calculate a random offset position in a safe range
    const range = 180;
    const randomX = (Math.random() - 0.5) * range * 2;
    const randomY = (Math.random() - 0.5) * range * 1.5;

    setNoBtnPos({
      x: Math.min(Math.max(randomX, -200), 200),
      y: Math.min(Math.max(randomY, -150), 150)
    });

    if (noClicks >= 7 && !showNoWarning) {
      setShowNoWarning(true);
    }
  };

  const handleNoClickMobile = () => {
    // If she somehow clicked it (on mobile where hover is different)
    handleNoHoverOrClick();
  };

  // Quiz helper
  const handleQuizAnswer = (points: string) => {
    playSynthSound('click', isSoundEnabled);
    const newAnswers = [...quizAnswers, points];
    setQuizAnswers(newAnswers);
    
    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      // Calculate cute summary
      const uniqueTypes = Array.from(new Set(newAnswers)).join(' + ');
      setQuizResult(uniqueTypes);
      playSynthSound('success', isSoundEnabled);
    }
  };

  const restartQuiz = () => {
    playSynthSound('click', isSoundEnabled);
    setQuizStep(0);
    setQuizAnswers([]);
    setQuizResult(null);
  };

  // Slot Machine Spin
  const spinSlotMachine = () => {
    if (slotSpinning) return;
    setSlotSpinning(true);
    playSynthSound('spin', isSoundEnabled);

    let counter = 0;
    const interval = setInterval(() => {
      if (!isSlotLocked1) {
        setSlot1(SLOT_LOCATIONS[Math.floor(Math.random() * SLOT_LOCATIONS.length)]);
      }
      if (!isSlotLocked2) {
        setSlot2(SLOT_SNACKS[Math.floor(Math.random() * SLOT_SNACKS.length)]);
      }
      if (!isSlotLocked3) {
        setSlot3(SLOT_ACTIVITIES[Math.floor(Math.random() * SLOT_ACTIVITIES.length)]);
      }
      counter++;
      if (counter % 3 === 0) {
        playSynthSound('click', isSoundEnabled);
      }
      if (counter > 15) {
        clearInterval(interval);
        setSlotSpinning(false);
        playSynthSound('success', isSoundEnabled);
        
        // Throw micro confetti on spin end
        confetti({
          particleCount: 15,
          spread: 30,
          colors: ['#FF69B4', '#FFD700', '#FF8C00']
        });
      }
    }, 100);
  };

  // Confetti explosion on "YES!"
  const handleAcceptInvite = () => {
    playSynthSound('tada', isSoundEnabled);
    setIsAccepted(true);
    
    // Beautiful massive confetti explosion
    const end = Date.now() + 3 * 1000;
    const colors = ['#ff69b4', '#ff85a2', '#ffb3c1', '#f3c68f', '#fff0f3'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // Generate RSVP text and Copy / Share to Messengers
  const finalDateStr = inviteDate === 'Своя дата (напишу ниже)' ? (customDateValue || 'Гибкая дата') : inviteDate;
  const inviteMessageText = `Анита подтвердила секретное приглашение на прогулку! 🎉💖\n\n` +
    `📅 Дата: ${finalDateStr}\n` +
    `🧋 Напиток дня: ${inviteDrink}\n` +
    `🎡 Главное развлечение: ${inviteActivity}\n` +
    `🪄 Пожелания: ${customWishes || 'Смеяться до упаду и пить вкусный чай!'}\n\n` +
    `✨ Код билета: ANITA-WALK-2026-YES ✨\n` +
    `Жду с нетерпением! 🥰`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteMessageText);
    setCopiedSuccess(true);
    playSynthSound('success', isSoundEnabled);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const shareViaTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteMessageText)}`;
    window.open(url, '_blank');
  };

  const shareViaWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessageText)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-tr from-pink-100 via-rose-50 to-purple-100 text-slate-800 antialiased font-sans flex flex-col justify-between selection:bg-rose-200 selection:text-rose-900"
      onClick={handleInteraction}
      ref={containerRef}
    >
      {/* Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 border-b border-rose-100 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="animate-pulse bg-rose-500 text-white rounded-full p-1.5 shadow-sm">
              <Heart className="w-5 h-5 fill-white" />
            </span>
            <div>
              <span className="font-bold text-slate-800 text-md sm:text-lg">Для Аниты ✨</span>
              <span className="hidden md:inline-block ml-3 text-xs bg-pink-100 text-pink-700 font-semibold px-2.5 py-0.5 rounded-full">
                Операция: Гулять и Радоваться 🌸
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Health / Mood meter */}
            <div className="bg-rose-50 border border-rose-100 px-3 py-1 rounded-full text-xs font-semibold text-rose-700 flex items-center space-x-1">
              <span className="text-sm">💖</span>
              <span>Счастье Аниты: 100%</span>
            </div>

            {/* Audio Toggle */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsSoundEnabled(!isSoundEnabled);
              }}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
              title={isSoundEnabled ? "Выключить звук" : "Включить звук"}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-5 h-5 text-rose-500 animate-bounce" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        
        {!isOpened ? (
          /* STAGE 1: Sealed Interactive Envelope */
          <div className="text-center py-10 my-auto animate-fade-in">
            <div className="max-w-lg mx-auto bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 relative overflow-hidden">
              
              {/* Outer decorative items */}
              <div className="absolute top-2 left-2 text-rose-300 text-2xl animate-spin">★</div>
              <div className="absolute bottom-4 right-4 text-rose-300 text-3xl animate-bounce">🎈</div>
              <div className="absolute top-6 right-8 text-rose-200 text-xl">✨</div>
              
              <h2 className="text-rose-600 font-bold uppercase tracking-widest text-xs mb-3">Совершенно секретно • Лично в руки</h2>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-6 font-mono">
                Для Аниты <span className="text-rose-500">💌</span>
              </h1>
              
              {/* Envelope visual */}
              <div className="relative group cursor-pointer my-8" onClick={handleOpenLetter}>
                <div className="absolute -inset-1.5 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl blur-xs opacity-65 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-rose-50 rounded-2xl p-6 border-2 border-dashed border-rose-300 flex flex-col items-center justify-center space-y-4 hover:scale-[1.02] transition-transform duration-300">
                  
                  {/* Decorative Cat / Letter image generated */}
                  <img 
                    src="/images/envelope_cat.jpg" 
                    alt="Уютный котик с письмом" 
                    className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-xl shadow-md border-4 border-white mb-2"
                  />
                  
                  {/* Red Wax Seal */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute animate-ping w-14 h-14 rounded-full bg-rose-400 opacity-20"></div>
                    <div className="w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                      <Heart className="w-6 h-6 fill-white" />
                    </div>
                  </div>
                  
                  <p className="text-rose-700 font-medium text-sm sm:text-base animate-pulse">
                    Нажми на печать, чтобы взломать шифр!
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-slate-400 italic">
                *При клике прозвучит милая аудио-нота. Рекомендуем включить звук!
              </div>
            </div>
            
            {/* Quick Teaser */}
            <p className="text-slate-500 text-xs sm:text-sm mt-4">
              P.S. Кнопка "НЕТ" где-то внутри плачет, потому что знает, что у нее нет шансов.
            </p>
          </div>
        ) : (
          /* STAGE 2: Interactive Invitation Hub */
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            
            {/* Hero Card containing personalized warm message */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                <div className="relative shrink-0">
                  <img 
                    src="/images/anita_hero.jpg" 
                    alt="Анита гуляет в парке" 
                    className="w-32 h-32 sm:w-44 sm:h-44 object-cover rounded-2xl shadow-lg border-4 border-pink-200 hover:rotate-3 transition-transform"
                  />
                  <span className="absolute -bottom-2 -right-2 text-3xl">☕</span>
                </div>
                
                <div className="text-center md:text-left">
                  <span className="bg-rose-100 text-rose-700 font-bold px-3 py-1 rounded-full text-xs">
                    ОФИЦИАЛЬНОЕ ПРИГЛАШЕНИЕ
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-2 mb-3">
                    Анита, погнали гулять! 🌸
                  </h1>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Привет! Прекрасная погода, отличный повод попить вкуснейший кофе (или бабл-ти!), похрустеть круассанами, обсудить все мемы планеты и просто чудесно провести время.
                  </p>
                  <p className="text-rose-500 font-semibold text-sm mt-2 flex items-center justify-center md:justify-start gap-1">
                    <Sparkles className="w-4 h-4" /> Специально для тебя я создал этот сайт с играми, чтобы ты не смогла сказать «нет»! 😉
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Selector for Interactive Blocks */}
            <div className="flex bg-white/80 backdrop-blur-xs p-1 rounded-2xl border border-rose-100 shadow-xs max-w-lg mx-auto">
              <button 
                onClick={() => { playSynthSound('click', isSoundEnabled); setActiveTab('games'); }}
                className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'games' 
                    ? 'bg-rose-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                🎮 Игротека
              </button>
              <button 
                onClick={() => { playSynthSound('click', isSoundEnabled); setActiveTab('rules'); }}
                className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'rules' 
                    ? 'bg-rose-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                📜 Кодекс & Гарантии
              </button>
              <button 
                onClick={() => { playSynthSound('click', isSoundEnabled); setActiveTab('compliments'); }}
                className={`flex-1 py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'compliments' 
                    ? 'bg-rose-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                🍰 Подниматель Настроения
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="transition-all duration-300">
              
              {activeTab === 'games' && (
                <div className="space-y-6 sm:space-y-8">
                  
                  {/* Game 1: Interactive Slot Machine */}
                  <div className="bg-white rounded-3xl p-6 shadow-md border border-pink-50 relative overflow-hidden">
                    <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span>🎰</span> Аппарат Судьбы
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <span>🎲</span> Генератор Свиданий Мечты
                    </h3>
                    <p className="text-xs text-slate-500 mb-5">
                      Сгенерируй идеальный план! Нажми «Крутить барабан». Если тебе понравится какой-то пункт, заблокируй его замочком и крути остальные!
                    </p>

                    {/* Slot Machine Interface */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 mb-6">
                      
                      {/* Reel 1: Location */}
                      <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-xs flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Место</span>
                        <div className={`h-12 flex items-center justify-center font-bold text-slate-700 text-center text-sm sm:text-base px-2 ${slotSpinning && !isSlotLocked1 ? 'animate-pulse text-rose-500' : ''}`}>
                          {slot1}
                        </div>
                        <button 
                          onClick={() => { playSynthSound('click', isSoundEnabled); setIsSlotLocked1(!isSlotLocked1); }}
                          className={`mt-2 p-1.5 rounded-full text-xs flex items-center gap-1 transition-all cursor-pointer ${
                            isSlotLocked1 
                              ? 'bg-rose-100 text-rose-600' 
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {isSlotLocked1 ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{isSlotLocked1 ? 'Закреплено' : 'Закрепить'}</span>
                        </button>
                      </div>

                      {/* Reel 2: Snack */}
                      <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-xs flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Перекус</span>
                        <div className={`h-12 flex items-center justify-center font-bold text-slate-700 text-center text-sm sm:text-base px-2 ${slotSpinning && !isSlotLocked2 ? 'animate-pulse text-rose-500' : ''}`}>
                          {slot2}
                        </div>
                        <button 
                          onClick={() => { playSynthSound('click', isSoundEnabled); setIsSlotLocked2(!isSlotLocked2); }}
                          className={`mt-2 p-1.5 rounded-full text-xs flex items-center gap-1 transition-all cursor-pointer ${
                            isSlotLocked2 
                              ? 'bg-rose-100 text-rose-600' 
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {isSlotLocked2 ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{isSlotLocked2 ? 'Закреплено' : 'Закрепить'}</span>
                        </button>
                      </div>

                      {/* Reel 3: Activity */}
                      <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-xs flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Главная фишка</span>
                        <div className={`h-12 flex items-center justify-center font-bold text-slate-700 text-center text-sm sm:text-base px-2 ${slotSpinning && !isSlotLocked3 ? 'animate-pulse text-rose-500' : ''}`}>
                          {slot3}
                        </div>
                        <button 
                          onClick={() => { playSynthSound('click', isSoundEnabled); setIsSlotLocked3(!isSlotLocked3); }}
                          className={`mt-2 p-1.5 rounded-full text-xs flex items-center gap-1 transition-all cursor-pointer ${
                            isSlotLocked3 
                              ? 'bg-rose-100 text-rose-600' 
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {isSlotLocked3 ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{isSlotLocked3 ? 'Закреплено' : 'Закрепить'}</span>
                        </button>
                      </div>

                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button 
                        onClick={spinSlotMachine}
                        disabled={slotSpinning || (isSlotLocked1 && isSlotLocked2 && isSlotLocked3)}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-rose-600 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <RotateCw className={`w-5 h-5 ${slotSpinning ? 'animate-spin' : ''}`} />
                        <span>{slotSpinning ? 'Вычисляем космосом...' : 'Крутить барабан! 🎰'}</span>
                      </button>

                      <button 
                        onClick={() => {
                          playSynthSound('click', isSoundEnabled);
                          setIsSlotLocked1(false);
                          setIsSlotLocked2(false);
                          setIsSlotLocked3(false);
                          setSlot1(SLOT_LOCATIONS[0]);
                          setSlot2(SLOT_SNACKS[0]);
                          setSlot3(SLOT_ACTIVITIES[0]);
                        }}
                        className="text-xs text-slate-400 hover:text-slate-600 hover:underline px-3 py-2 cursor-pointer"
                      >
                        Сбросить замки
                      </button>
                    </div>

                    {/* Cute notification when all are locked */}
                    {isSlotLocked1 && isSlotLocked2 && isSlotLocked3 && (
                      <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-xs text-center font-medium animate-bounce">
                        🎉 Вау! Идеальный комбо-план зафиксирован! Давай внесем его в финальный билет ниже!
                      </div>
                    )}
                  </div>

                  {/* Game 2: Walk Compatibility Quiz */}
                  <div className="bg-white rounded-3xl p-6 shadow-md border border-pink-50 relative overflow-hidden">
                    <div className="absolute top-4 right-4 bg-pink-100 text-pink-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      📝 ТЕСТ
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <span>🔮</span> Интерактивный Распределяющий Тест
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Узнаем твою прогулочную стихию за 3 простых клика:
                    </p>

                    {quizResult === null ? (
                      /* Quiz Active steps */
                      <div className="bg-rose-50/50 p-4 sm:p-5 rounded-2xl border border-rose-100/60">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-slate-400 font-bold">Вопрос {quizStep + 1} из {QUIZ_QUESTIONS.length}</span>
                          <div className="flex gap-1">
                            {QUIZ_QUESTIONS.map((_, idx) => (
                              <div key={idx} className={`w-6 h-1.5 rounded-full ${idx <= quizStep ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
                            ))}
                          </div>
                        </div>

                        <p className="font-bold text-slate-800 text-sm sm:text-base mb-4">
                          {QUIZ_QUESTIONS[quizStep].question}
                        </p>

                        <div className="space-y-2.5">
                          {QUIZ_QUESTIONS[quizStep].options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => handleQuizAnswer(opt.points)}
                              className="w-full text-left p-3 rounded-xl bg-white hover:bg-rose-100/40 border border-slate-100 hover:border-rose-300 transition-all text-xs sm:text-sm text-slate-700 font-medium flex items-center justify-between group cursor-pointer"
                            >
                              <span>{opt.text}</span>
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Quiz Result Screen */
                      <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-100 text-center animate-fade-in">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                          ✨
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-base sm:text-lg mb-1">
                          Твоя прогулочная стихия: 
                        </h4>
                        <p className="text-rose-600 font-bold uppercase tracking-wider text-sm sm:text-md my-2 bg-white px-3 py-1.5 rounded-lg inline-block border border-pink-100">
                          👑 {quizResult}
                        </p>
                        <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                          Это прекрасный диагноз! Ученые прогнозируют 100% совместимость с моим отличным настроением и гарантируют отсутствие неловких пауз.
                        </p>
                        
                        <div className="mt-4 flex gap-3 justify-center">
                          <button
                            onClick={() => {
                              playSynthSound('click', isSoundEnabled);
                              // Auto-fill drink and activities
                              if (quizResult.includes("бабл-ти")) setInviteDrink("🧋 Бабл-ти с шариками");
                              if (quizResult.includes("кофеиновый")) setInviteDrink("☕ Ароматный кофе раф");
                              if (quizResult.includes("уютный")) setInviteDrink("🍫 Какао со взбитыми сливками");
                              
                              if (quizResult.includes("фотограф")) setInviteActivity("Устраивать фотосессию у красивых локаций 📸");
                              if (quizResult.includes("весельчак")) setInviteActivity("Смеяться над глупыми шутками 😂");
                              if (quizResult.includes("гурман") || quizResult.includes("булочек")) setInviteActivity("Обжираться свежими круассанами 🥐");

                              // Show alert
                              alert("Выбор автоматически применился к твоему финальному билету! 🎉");
                            }}
                            className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Применить к билету 🪄
                          </button>
                          
                          <button
                            onClick={restartQuiz}
                            className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
                          >
                            Пройти заново 🔄
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {activeTab === 'rules' && (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-pink-50 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <span>📜</span> Официальный Гарантийный Талон и Кодекс
                    </h3>
                    <p className="text-xs text-slate-500">
                      Все права Аниты защищены на высшем межгалактическом уровне. Проверь наши официальные гарантии:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start space-x-3">
                      <span className="text-lg">☕</span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Гарантия Бесплатности</h4>
                        <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">Вкусный кофе, бабл-ти или какао за мой счёт! Любые сиропы и добавки одобрены по умолчанию.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start space-x-3">
                      <span className="text-lg">🛡️</span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Защита от занудства</h4>
                        <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">Если тебе станет скучно хоть на одну миллисекунду, ты имеешь полное право шлепнуть меня по плечу или заставить мяукать на голубей.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start space-x-3">
                      <span className="text-lg">📸</span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Идеальные Фотки</h4>
                        <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">Буду фоткать тебя с лучших ракурсов, пока не скажешь "хватит!". Исходники отдаю сразу, глаза закрыты не будут.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start space-x-3">
                      <span className="text-lg">🧤</span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Сумочный сервис</h4>
                        <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">Могу нести твой рюкзачок, пакет или тяжелый телефон, пока ты элегантно наслаждаешься ходьбой.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <h4 className="font-bold text-slate-800 text-sm mb-3 text-center">Почему Аните точно стоит пойти? 🚀</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pl-4 list-disc">
                      <li>Я не буду говорить о политике и квантовой физике (если только ты сама не захочешь)</li>
                      <li>Я выучил 3 новых смешных анекдота про капибар</li>
                      <li>Мы можем погулять 40 минут или 4 часа — выбор темпа за тобой</li>
                      <li>Свежий воздух вырабатывает эндорфины бесплатно</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'compliments' && (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-pink-50 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 text-rose-100 text-8xl -z-10 font-serif">“</div>
                  
                  <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center justify-center gap-1.5">
                    <span>💊</span> Карманный Анти-Грустин для Аниты
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Если у тебя был трудный день или просто не хватает улыбки — нажми на кнопку ниже, чтобы получить порцию тепла!
                  </p>

                  <div className="bg-gradient-to-tr from-rose-50 to-pink-50 p-6 rounded-2xl border border-pink-100 max-w-md mx-auto mb-6 min-h-36 flex flex-col justify-center transform hover:scale-[1.01] transition-transform">
                    <span className="text-rose-500 font-extrabold uppercase tracking-widest text-[10px] mb-2 block">
                      {COMPLIMENTS_AND_JOKES[jokeIndex].title}
                    </span>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                      {COMPLIMENTS_AND_JOKES[jokeIndex].text}
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      playSynthSound('beep', isSoundEnabled);
                      setJokeIndex((prev) => (prev + 1) % COMPLIMENTS_AND_JOKES.length);
                    }}
                    className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs sm:text-sm border border-rose-200 transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>🔄 Получить еще порцию милоты</span>
                  </button>
                </div>
              )}

            </div>

            {/* THE DECISION ZONE - THE FINAL CALL TO ACTION */}
            <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-pink-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center">
              
              {/* Star Background elements */}
              <div className="absolute top-4 left-6 text-yellow-300 text-lg animate-pulse">⭐</div>
              <div className="absolute bottom-10 right-8 text-pink-300 text-lg animate-ping">✨</div>
              <div className="absolute top-1/2 left-3 text-purple-300 text-sm animate-pulse">⭐</div>

              <span className="bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs uppercase font-extrabold px-3 py-1 rounded-full tracking-wider">
                Главный вопрос жизни, вселенной и всего такого
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 mb-2">
                Анита, ты пойдешь со мной гулять? 🥰
              </h2>
              
              <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-8">
                Никакого давления (хотя все космические корабли и пушистые котики мира с надеждой смотрят на экран твоего устройства прямо сейчас!).
              </p>

              {!isAccepted ? (
                <div className="relative min-h-[140px] flex flex-col items-center justify-center">
                  
                  {/* Buttons Wrapper */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 w-full max-w-md">
                    
                    {/* YES BUTTON - Huge and pulsating */}
                    <button
                      onClick={handleAcceptInvite}
                      className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg shadow-rose-500/35 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 animate-bounce"
                    >
                      <Heart className="w-6 h-6 fill-white animate-pulse" />
                      <span>ДА, Я СОГЛАСНА! 🎉</span>
                    </button>

                    {/* NO BUTTON - Playful and runs away */}
                    <button
                      onMouseEnter={handleNoHoverOrClick}
                      onClick={handleNoClickMobile}
                      style={{
                        transform: `translate(${noBtnPos.x}px, ${noBtnPos.y}px)`,
                        transition: 'transform 0.15s ease-out'
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Нет, не хочу 🥺</span>
                    </button>

                  </div>

                  {/* Comment Bubble under button attempts */}
                  {noClicks > 0 && (
                    <div className="mt-8 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs text-slate-200 animate-pulse inline-block max-w-sm">
                      💬 <span className="font-bold text-amber-300">Попыток отказать: {noClicks}</span>. {NO_BUTTON_COMMENTS[commentIndex]}
                    </div>
                  )}

                  {showNoWarning && (
                    <div className="mt-2 text-[10px] text-pink-300 font-bold animate-bounce">
                      ⚠️ Внимание: Кнопка "НЕТ" начинает сильно перегреваться от твоей настойчивости!
                    </div>
                  )}
                </div>
              ) : (
                /* ACTION COMPLETED SUCCESS SCREEN */
                <div className="space-y-6 animate-fade-in text-left bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-3xl animate-bounce">
                      ✓
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-300">
                      УРА! Лучшее решение в истории человечества! 🎉
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1">
                      Ты сделала этот день чуточку прекраснее. Давай настроим твой идеальный пригласительный билет!
                    </p>
                  </div>

                  {/* CUSTOMIZER FORM FOR THE DATE TICKET */}
                  <div className="space-y-4 border-t border-white/10 pt-5 mt-3">
                    <h4 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-rose-400" /> Настрой свой Билет на Счастье:
                    </h4>

                    {/* Date select */}
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">📅 Когда пойдём?</label>
                      <select 
                        value={inviteDate}
                        onChange={(e) => { playSynthSound('click', isSoundEnabled); setInviteDate(e.target.value); }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-hidden focus:border-rose-400 cursor-pointer"
                      >
                        <option value="Сегодня же! (Прямо сейчас!)">Сегодня же! (Прямо сейчас!)</option>
                        <option value="Завтра (будет супер-день!)">Завтра (будет супер-день!)</option>
                        <option value="В эти выходные (будет супер!)">В эти выходные (будет супер!)</option>
                        <option value="Выберу день позже в чате">Выберу день позже в чате 💬</option>
                        <option value="Своя дата (напишу ниже)">Своя дата (напишу ниже) 👇</option>
                      </select>

                      {inviteDate === 'Своя дата (напишу ниже)' && (
                        <input 
                          type="text" 
                          placeholder="Напиши желаемую дату и время..." 
                          value={customDateValue}
                          onChange={(e) => setCustomDateValue(e.target.value)}
                          className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-rose-400"
                        />
                      )}
                    </div>

                    {/* Drink select */}
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">🧋 Любимый Напиток для Прогулки:</label>
                      <select 
                        value={inviteDrink}
                        onChange={(e) => { playSynthSound('click', isSoundEnabled); setInviteDrink(e.target.value); }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-hidden focus:border-rose-400 cursor-pointer"
                      >
                        <option value="🧋 Бабл-ти с шариками">🧋 Бабл-ти с сочными шариками</option>
                        <option value="☕ Ароматный кофе раф">☕ Ароматный сладкий Раф</option>
                        <option value="🍫 Какао с маршмеллоу">🍫 Какао с зефирками</option>
                        <option value="🍵 Зеленый чай матча латте">🍵 Матча латте на кокосовом</option>
                        <option value="🍓 Клубничный милкшейк">🍓 Освежающий клубничный милкшейк</option>
                        <option value="🍊 Цитрусовый лимонад">🍊 Цитрусовый лимонад</option>
                        <option value="🧪 Секретный эликсир хорошего настроения">🧪 Секретный эликсир хорошего настроения</option>
                      </select>
                    </div>

                    {/* Activities select */}
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">🎡 Главное Развлечение:</label>
                      <select 
                        value={inviteActivity}
                        onChange={(e) => { playSynthSound('click', isSoundEnabled); setInviteActivity(e.target.value); }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-hidden focus:border-rose-400 cursor-pointer"
                      >
                        <option value="Болтать обо всём и кушать круассаны 🥐">Болтать обо всём и кушать круассаны 🥐</option>
                        <option value="Устраивать фотосессию у красивых локаций 📸">Устраивать фотосессию у красивых локаций 📸</option>
                        <option value="Смеяться над глупыми шутками 😂">Смеяться над глупыми шутками 😂</option>
                        <option value="Бродить по парку и кормить уток 🦆">Бродить по парку и кормить уток 🦆</option>
                        <option value="Просто уютно молчать и пить чай 🌸">Просто уютно молчать и пить чай 🌸</option>
                      </select>
                    </div>

                    {/* Wishes text input */}
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">🪄 Особые пожелания или требования (по желанию):</label>
                      <input 
                        type="text" 
                        placeholder="Например: 'Купить мне шоколадку' или 'Не опаздывать!' 😄" 
                        value={customWishes}
                        onChange={(e) => setCustomWishes(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-rose-400"
                      />
                    </div>
                  </div>

                  {/* DIGITAL TICKET BOARDING PASS PREVIEW */}
                  <div className="relative mt-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl overflow-hidden border-2 border-dashed border-rose-300">
                    
                    {/* Ticket circle cutouts */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full"></div>
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full"></div>
                    
                    <div className="flex justify-between items-start border-b border-white/20 pb-4 mb-4">
                      <div>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold tracking-widest uppercase">
                          VIP Пропуск
                        </span>
                        <h5 className="font-extrabold text-base sm:text-lg mt-1 tracking-tight">БИЛЕТ НА СЧАСТЬЕ</h5>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-pink-200 block uppercase font-bold">Код Билета</span>
                        <span className="font-mono text-xs font-bold text-yellow-300 bg-black/25 px-2 py-0.5 rounded">ANITA-2026-YES</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs border-b border-white/20 pb-4 mb-4">
                      <div>
                        <span className="text-[9px] text-pink-200 block uppercase font-medium">Пассажир</span>
                        <span className="font-bold text-sm">Самая лучшая Анита ✨</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-pink-200 block uppercase font-medium">Дата & Время</span>
                        <span className="font-bold text-sm">{finalDateStr}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-pink-200 block uppercase font-medium">Напиток</span>
                        <span className="font-bold text-sm">{inviteDrink}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-pink-200 block uppercase font-medium">Локация / Движ</span>
                        <span className="font-bold text-sm truncate">{inviteActivity}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[9px] text-pink-200 block uppercase font-medium">Спец. Пожелание</span>
                        <span className="italic text-slate-100">"{customWishes || 'Смеяться и ловить позитив!'}"</span>
                      </div>
                      
                      {/* Fake simulated barcode */}
                      <div className="bg-white p-1 rounded-sm shrink-0 flex flex-col items-center">
                        <div className="h-6 w-24 bg-slate-800 flex items-center justify-around px-1">
                          {[1,3,2,1,2,3,1,2,3,2,1,3,2].map((w, i) => (
                            <div key={i} className="h-full bg-white" style={{ width: `${w * 2}px` }}></div>
                          ))}
                        </div>
                        <span className="text-[8px] text-slate-800 font-mono tracking-widest mt-0.5">ANITA-LOVE-WALK</span>
                      </div>
                    </div>
                  </div>

                  {/* MESSENGER SHARING BUTTONS */}
                  <div className="mt-6 space-y-3">
                    <p className="text-xs text-slate-300 text-center font-semibold">
                      Поделись билетом со мной, чтобы утвердить план на все 100%! 👇
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button 
                        onClick={copyToClipboard}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                      >
                        <ThumbsUp className="w-4 h-4 text-emerald-400" />
                        <span>{copiedSuccess ? 'Скопировано! 🎉' : 'Скопировать текст'}</span>
                      </button>

                      <button 
                        onClick={shareViaTelegram}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Отправить в Telegram</span>
                      </button>

                      <button 
                        onClick={shareViaWhatsApp}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="text-base">💬</span>
                        <span>Отправить в WhatsApp</span>
                      </button>
                    </div>

                    {copiedSuccess && (
                      <div className="p-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs rounded-xl text-center font-bold animate-pulse">
                        📋 Текст скопирован в буфер обмена! Теперь ты можешь просто вставить его в наш диалог.
                      </div>
                    )}
                  </div>

                  <div className="text-center pt-2">
                    <button 
                      onClick={() => {
                        playSynthSound('click', isSoundEnabled);
                        setIsAccepted(false);
                        setNoClicks(0);
                        setNoBtnPos({ x: 0, y: 0 });
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
                    >
                      ← Вернуться к играм и шуткам
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Decorative footer */}
      <footer className="w-full bg-white/40 backdrop-blur-xs py-4 border-t border-rose-100 text-center mt-10 text-xs text-slate-500 font-mono">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>С любовью и заботой для прекрасной Аниты • 2026 💖</p>
          <p className="text-[10px] text-rose-400/80">Все права на хорошее настроение зарезервированы.</p>
        </div>
      </footer>
    </div>
  );
}
