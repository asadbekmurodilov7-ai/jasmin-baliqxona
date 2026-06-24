import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { MenuItem, Room, Order, RoomBooking, PaymentSettings, TelegramSettings, SmsSettings } from './src/types';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const STORE_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(STORE_DIR, 'store.json');


// --- Pre-seeded Default Data ---
const DEFAULT_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Kamalak Foreli (Grill)',
    category: 'baliq',
    price: 155000,
    size: '1 kg',
    description: "Jasmin baliqxonasining eng mashhur taomlaridan biri. Kamalak foreli o'choq olovida, maxsus zirvorlar va limon marinadi bilan butunligicha grilda pishiriladi.",
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'm2',
    name: "Sazan Baliq (Qovurilgan Farg'ona uslubi)",
    category: 'baliq',
    price: 95000,
    size: '1 kg',
    description: "Daryodan yangi tutilgan Sazan balig'i suyaklaridan ajratilib, maxsus sariyog' va un kombinatsiyasida o'ta qarsildoq qilib qovuriladi. Sarimsoqli qayla bilan beriladi.",
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'm3',
    name: "Daryo Som (Pechda dumlangan)",
    category: 'baliq',
    price: 115000,
    size: '1 kg',
    description: "Yumshoq va yog'li som balig'ining dumi piyoz, pomidor va maxsus ko'katlar hamrohligida pechda dimlanadi. Labingizda eriydi.",
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'm4',
    name: "Sudak Kabob (Shashlik)",
    category: 'baliq',
    price: 105000,
    size: '1 kg',
    description: "Sershira sudak balig'i go'shti kubik qilib kesilib, to'g'ralgan limonga marinadlanadi va cho'g'da ohista pishiriladi. Kam yog'li, parhezbop.",
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'm5',
    name: "Haqiqiy Achichuk",
    category: 'salatlar',
    price: 16000,
    size: '1 portsiya',
    description: "Yangi shirin Farg'ona pomidorlari, yupqa to'g'ralgan piyoz va achchiq qalampir murchi bilan birga tayyorlangan an'anaviy baliqbozlik salati.",
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'm6',
    name: "Voha Salati (Oasis)",
    category: 'salatlar',
    price: 22000,
    size: '1 portsiya',
    description: "Bodring, ko'k no'xat, makkajo'xori, sarxil ko'katlar va maxsus zaytun moyli sous solingan tetiklashtiruvchi salat.",
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'm7',
    name: "Kartoshka Fri",
    category: 'yonlar',
    price: 18000,
    size: '1 portsiya',
    description: "Ushbu oltin qarsildoq kartoshkalar baliq go'shtiga eng ajoyib garnir hisoblanadi. Tomat-chesnok sousi tekin qo'shib beriladi.",
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'm8',
    name: 'Sarimsoqli Baliq Sousi',
    category: 'yonlar',
    price: 8000,
    size: '1 idish',
    description: "Jasmin uy sharoitida tayyorlangan maxsus sarimsoq, yashil kashnich, kislotali limon va sariyog'li sous.",
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'm9',
    name: "O'choq Issiq Non",
    category: 'non',
    price: 6000,
    size: '1 dona',
    description: "Baliqxonamiz tandirida tayyorlangan qarsildoq, kunjut sepilgan issiq Uzbek noni.",
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'm10',
    name: "Limonli Ko'k Choy",
    category: 'ichimliklar',
    price: 12000,
    size: '1 choynak',
    description: "Chinni choynakda damlangan yangi limon tilimlari va asal bilan boyitilgan, baliqdan keyin hazm qilishga eng yaxshi ko'k choy.",
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    id: 'm11',
    name: 'Jasmin Maxsus Lemonadi',
    category: 'ichimliklar',
    price: 25000,
    size: '1 litr',
    description: "Yalpiz barglari, yangi siqilgan limon va apelsin sharbatidan tayyorlanadigan tetiklashtiruvchi sovuq ichimlik.",
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    available: true
  }
];

const generateRoomsAndTapchans = (): Room[] => {
  const roomsList: Room[] = [];
  
  // 10 Tapchans
  for (let i = 1; i <= 10; i++) {
    roomsList.push({
      id: `t${i}`,
      name: `Tapchan #${i}`,
      type: 'tapchan',
      capacity: 10,
      priceBooking: 25000,
      description: "Shinam va go'zal an'anaviy o'zbekona tapchan. Atrof yashillik bilan o'ralgan va shinam ko'rpachalar bor. Maks. 10 kishi uchun.",
      features: ["Shinam muhit", "Yumshoq yostiqlar", "Telefon zaryadlash moslamasi"],
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
      available: true
    });
  }

  // 31 Rooms/Kabinkas
  // 1 to 15: 8 kishilik
  // 16 to 25: 12 kishilik
  // 26 to 31: 15-20 kishilik (represented by capacity 20)
  for (let i = 1; i <= 31; i++) {
    let capacity = 8;
    let priceBooking = 30000;
    let label = '8 kishilik';
    let image = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80';
    
    if (i >= 16 && i <= 25) {
      capacity = 12;
      priceBooking = 40000;
      label = '12 kishilik';
      image = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80';
    } else if (i >= 26) {
      capacity = 20; // represents 15-20 kishilik
      priceBooking = 50000;
      label = '15-20 kishilik';
      image = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';
    }

    roomsList.push({
      id: `r${i}`,
      name: `VIP Shoxona Xona #${i} (${label})`,
      type: 'kabinka',
      capacity,
      priceBooking,
      description: `Hammasi uchun alohida konditsioner bilan jihozlangan tinch va shinam oilaviy xona. Televizor mavjud emas, oilaviy suhbat va osoyishtalik uchun ajoyib maskan.`,
      features: ["Kuchli Konditsioner", "Shinam yumshoq divanlar", "Fayzli o'zbekona dizayn", "Keng oilaviy stol", "Shovqin izolatsiyasi"],
      image,
      available: true
    });
  }

  return roomsList;
};

const DEFAULT_ROOMS: Room[] = generateRoomsAndTapchans();

interface DBState {
  menu: MenuItem[];
  rooms: Room[];
  orders: Order[];
  bookings: RoomBooking[];
  adminEmails: string[];
  adminPin: string;
  paymentSettings: PaymentSettings;
  telegramSettings: TelegramSettings;
  smsSettings: SmsSettings;
}

const DEFAULT_TELEGRAM_SETTINGS: TelegramSettings = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  chatId: process.env.TELEGRAM_CHAT_ID || '',
  enabled: false,
  notifyNewOrder: true,
  notifyNewBooking: true,
  notifyStatusChange: true,
};

const DEFAULT_SMS_SETTINGS: SmsSettings = {
  enabled: false,
  eskizToken: '',
  senderId: 'Jasmin',
  notifyNewOrder: true,
  notifyStatusChange: true,
};

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  cardNumber: '8600 1423 5894 7712',
  cardName: 'JASMIN BALIQ BARAKASI MCHJ',
  clickServiceId: '11584',
  paymeMerchantId: '64ef81b5ac302',
  instructionText: "To'lovni CLICK yoki Payme orqali amalga oshirgach, chek rasmini telegram ma'murimizga (@jasmin_admin) jo'natishingiz yoki xodimimiz qo'ng'irog'ini kutishingizni so'raymiz."
};

let dbState: DBState = {
  menu: DEFAULT_MENU,
  rooms: DEFAULT_ROOMS,
  orders: [],
  bookings: [],
  adminEmails: ['asadbekmurodilov7@gmail.com', 'admin@jasmin.uz', 'manager@jasmin.uz'],
  adminPin: '7777',
  paymentSettings: DEFAULT_PAYMENT_SETTINGS,
  telegramSettings: DEFAULT_TELEGRAM_SETTINGS,
  smsSettings: DEFAULT_SMS_SETTINGS,
};

// Ensure JSON database exists and load from it
function initDatabase() {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Fallback check in case fields are empty
      const shouldResetRooms = !parsed.rooms || parsed.rooms.length !== 41 || parsed.rooms.some((r: any) => r.name.includes("Anhor") || r.features.includes("Veb-chaqiriq tugmasi"));
      dbState = {
        menu: parsed.menu || DEFAULT_MENU,
        rooms: shouldResetRooms ? DEFAULT_ROOMS : parsed.rooms,
        orders: parsed.orders || [],
        bookings: parsed.bookings || [],
        adminEmails: parsed.adminEmails || ['asadbekmurodilov7@gmail.com', 'admin@jasmin.uz', 'manager@jasmin.uz'],
        adminPin: parsed.adminPin || '7777',
        paymentSettings: parsed.paymentSettings || DEFAULT_PAYMENT_SETTINGS,
        telegramSettings: parsed.telegramSettings || DEFAULT_TELEGRAM_SETTINGS,
        smsSettings: parsed.smsSettings || DEFAULT_SMS_SETTINGS,
      };
      
      // Save database if rooms were reset or migrated or adminEmails or adminPin or paymentSettings was missing
      if (shouldResetRooms || !parsed.adminEmails || !parsed.adminPin || !parsed.paymentSettings) {
        saveDatabase();
      }
      
      // Let's migrate ID in case they are missing or formatted weirdly
      dbState.menu.forEach((item, index) => {
        if (!item.id) item.id = 'm_' + Date.now() + '_' + index;
        if (item.available === undefined) item.available = true;
      });
      dbState.rooms.forEach((room, index) => {
        if (!room.id) room.id = 'r_' + Date.now() + '_' + index;
        if (room.available === undefined) room.available = true;
      });
      console.log('Database loaded successfully from ' + STORE_FILE);
    } else {
      saveDatabase();
      console.log('Database file created and seeded with default options.');
    }
  } catch (error) {
    console.error('Error loading database, resetting to defaults:', error);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

initDatabase();

// --- JWT Secret (auto-generated, persisted) ---
const JWT_SECRET_FILE = path.join(STORE_DIR, 'jwt_secret.txt');
let JWT_SECRET: string;
try {
  if (fs.existsSync(JWT_SECRET_FILE)) {
    JWT_SECRET = fs.readFileSync(JWT_SECRET_FILE, 'utf-8').trim();
  } else {
    JWT_SECRET = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(JWT_SECRET_FILE, JWT_SECRET, 'utf-8');
  }
} catch {
  JWT_SECRET = crypto.randomBytes(48).toString('hex');
}

function b64url(s: string) { return Buffer.from(s).toString('base64url'); }

function signToken(email: string): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ email, role: 'admin', exp: Date.now() + 86400000 }));
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

function verifyToken(token: string): { email: string } | null {
  try {
    const [header, payload, sig] = token.split('.');
    if (!header || !payload || !sig) return null;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    if (sig !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp < Date.now()) return null;
    return { email: data.email };
  } catch { return null; }
}

// --- Rate limiter (brute-force protection) ---
const loginAttempts: Record<string, { count: number; blockedUntil: number }> = {};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts[ip];
  if (!entry) return true;
  if (entry.blockedUntil > now) return false;
  if (entry.blockedUntil > 0 && now - entry.blockedUntil > 900000) delete loginAttempts[ip];
  return true;
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, blockedUntil: 0 };
  loginAttempts[ip].count++;
  if (loginAttempts[ip].count >= 5) {
    loginAttempts[ip].blockedUntil = now + 900000;
    loginAttempts[ip].count = 0;
  }
}

function clearAttempts(ip: string) { delete loginAttempts[ip]; }

// --- Admin auth middleware ---
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Ruxsat yo\'q. Admin tizimiga kiring.' });
    return;
  }
  const user = verifyToken(auth.slice(7));
  if (!user) {
    res.status(401).json({ error: 'Token muddati tugagan yoki noto\'g\'ri. Qayta kiring.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- SMS notification helper (Eskiz.uz) ---
  async function sendSms(phone: string, message: string) {
    const sms = dbState.smsSettings;
    if (!sms.enabled || !sms.eskizToken) return;
    const mobile = phone.replace(/\D/g, '');
    const normalized = mobile.startsWith('998') ? mobile : '998' + mobile.replace(/^0/, '');
    try {
      const res = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sms.eskizToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile_phone: normalized, message, from: sms.senderId || 'Jasmin' }),
      });
      const data = await res.json() as any;
      if (!res.ok) console.error('SMS error:', data);
    } catch (e) {
      console.error('SMS yuborishda xatolik:', e);
    }
  }

  // --- Telegram notification helper ---
  async function sendTelegram(text: string) {
    const tg = dbState.telegramSettings;
    if (!tg.enabled || !tg.botToken || !tg.chatId) return;
    try {
      const url = `https://api.telegram.org/bot${tg.botToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tg.chatId, text, parse_mode: 'HTML' })
      });
    } catch (e) {
      console.error('Telegram xabar yuborishda xatolik:', e);
    }
  }

  // --- SSE broadcast setup ---
  const sseClients = new Set<Response>();

  function broadcastUpdate(event: string, data: object) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of sseClients) {
      try { client.write(payload); } catch { sseClients.delete(client); }
    }
  }

  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    sseClients.add(res);
    res.write('event: connected\ndata: {}\n\n');
    const heartbeat = setInterval(() => {
      try { res.write(': ping\n\n'); } catch { /* ignore */ }
    }, 25000);
    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // --- API Endpoints ---

  // 1. Menu API
  app.get('/api/menu', (req: Request, res: Response) => {
    res.json(dbState.menu);
  });

  app.post('/api/menu', requireAdmin, (req: Request, res: Response) => {
    const newItem = req.body as Partial<MenuItem>;
    if (!newItem.name || !newItem.category || !newItem.price) {
      res.status(400).json({ error: "Sarlavha, kategoriya va narx majburiy!" });
      return;
    }
    const item: MenuItem = {
      id: 'm_' + Date.now(),
      name: newItem.name,
      category: newItem.category as any,
      price: Number(newItem.price),
      description: newItem.description || '',
      image: newItem.image || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
      available: newItem.available !== undefined ? newItem.available : true,
      size: newItem.size || '1 portsiya',
      isMultipleSizes: newItem.isMultipleSizes,
      sizeOptions: newItem.sizeOptions
    };
    dbState.menu.push(item);
    saveDatabase();
    broadcastUpdate('menu', {});
    res.status(201).json(item);
  });

  app.put('/api/menu/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body;
    const idx = dbState.menu.findIndex(x => String(x.id) === String(id));
    if (idx === -1) {
      res.status(404).json({ error: "Mahsulot topilmadi" });
      return;
    }
    dbState.menu[idx] = {
      ...dbState.menu[idx],
      ...body
    };
    saveDatabase();
    broadcastUpdate('menu', {});
    res.json(dbState.menu[idx]);
  });

  app.delete('/api/menu/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = dbState.menu.findIndex(x => String(x.id) === String(id));
    if (idx === -1) {
      res.status(404).json({ error: "Mahsulot topilmadi" });
      return;
    }
    dbState.menu.splice(idx, 1);
    saveDatabase();
    broadcastUpdate('menu', {});
    res.json({ success: true, message: "Mahsulot o'chirildi" });
  });

  // 2. Rooms API
  app.get('/api/rooms', (req: Request, res: Response) => {
    res.json(dbState.rooms);
  });

  app.post('/api/rooms', requireAdmin, (req: Request, res: Response) => {
    const newRoom = req.body as Partial<Room>;
    if (!newRoom.name || !newRoom.type || newRoom.capacity === undefined) {
      res.status(400).json({ error: "Xona nomi, shakli va sig'imi majburiy!" });
      return;
    }
    const room: Room = {
      id: 'r_' + Date.now(),
      name: newRoom.name,
      type: newRoom.type as any,
      capacity: Number(newRoom.capacity),
      priceBooking: Number(newRoom.priceBooking || 0),
      description: newRoom.description || '',
      features: Array.isArray(newRoom.features) ? newRoom.features : [],
      image: newRoom.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
      available: newRoom.available !== undefined ? newRoom.available : true
    };
    dbState.rooms.push(room);
    saveDatabase();
    broadcastUpdate('rooms', {});
    res.status(201).json(room);
  });

  app.put('/api/rooms/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body;
    const idx = dbState.rooms.findIndex(x => String(x.id) === String(id));
    if (idx === -1) {
      res.status(404).json({ error: "Xona topilmadi" });
      return;
    }
    dbState.rooms[idx] = {
      ...dbState.rooms[idx],
      ...body
    };
    saveDatabase();
    broadcastUpdate('rooms', {});
    res.json(dbState.rooms[idx]);
  });

  app.delete('/api/rooms/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = dbState.rooms.findIndex(x => String(x.id) === String(id));
    if (idx === -1) {
      res.status(404).json({ error: "Xona topilmadi" });
      return;
    }
    dbState.rooms.splice(idx, 1);
    saveDatabase();
    broadcastUpdate('rooms', {});
    res.json({ success: true, message: "Xona o'chirildi" });
  });

  // 3. Orders API
  app.get('/api/orders', (req: Request, res: Response) => {
    res.json(dbState.orders);
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const data = req.body;
    if (!data.customerName || !data.phone || !Array.isArray(data.items) || data.items.length === 0) {
      res.status(400).json({ error: "Mijoz ismi, telefon raqami va savat bo'sh bo'lmasligi kerak!" });
      return;
    }

    const order: Order = {
      id: 'o_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: data.customerName,
      phone: data.phone,
      items: data.items,
      deliveryType: data.deliveryType || 'pickup',
      deliveryAddress: data.deliveryAddress || '',
      deliveryDistanceKm: Number(data.deliveryDistanceKm || 0),
      deliveryFee: Number(data.deliveryFee || 0),
      totalAmount: Number(data.totalAmount),
      status: 'pending',
      paymentMethod: data.paymentMethod || 'naqd',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    dbState.orders.unshift(order);
    saveDatabase();
    broadcastUpdate('orders', {});

    if (dbState.smsSettings.notifyNewOrder) {
      sendSms(order.phone,
        `Buyurtmangiz qabul qilindi! #${order.id}\nJami: ${order.totalAmount.toLocaleString()} so'm\nJasmin Baliqxona: +998936421771`
      );
    }

    if (dbState.telegramSettings.notifyNewOrder) {
      const itemsList = order.items.map(i => `  • ${i.name} × ${i.quantity}`).join('\n');
      const deliveryInfo = order.deliveryType === 'delivery'
        ? `🚗 Yetkazish: ${order.deliveryAddress}`
        : '🏪 O\'zi olib ketadi';
      sendTelegram(
        `🐟 <b>YANGI BUYURTMA!</b>  #${order.id}\n\n` +
        `👤 Mijoz: <b>${order.customerName}</b>\n` +
        `📞 Tel: ${order.phone}\n` +
        `${deliveryInfo}\n` +
        `💳 To'lov: <b>${order.paymentMethod.toUpperCase()}</b>\n\n` +
        `📋 Taomlar:\n${itemsList}\n\n` +
        `💰 Jami: <b>${order.totalAmount.toLocaleString()} so'm</b>` +
        (order.notes ? `\n📝 Izoh: ${order.notes}` : '')
      );
    }

    setTimeout(() => {
      const liveIdx = dbState.orders.findIndex(x => x.id === order.id);
      if (liveIdx !== -1 && dbState.orders[liveIdx].status === 'pending') {
        dbState.orders[liveIdx].status = 'preparing';
        saveDatabase();
        broadcastUpdate('orders', {});
        console.log(`Order ${order.id} -> 'preparing'`);
      }
    }, 15000);

    res.status(201).json(order);
  });

  app.put('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const idx = dbState.orders.findIndex(x => x.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Buyurtma topilmadi" });
      return;
    }
    dbState.orders[idx].status = status;
    saveDatabase();
    broadcastUpdate('orders', {});

    if (dbState.smsSettings.notifyStatusChange) {
      const smsTexts: Record<string, string> = {
        preparing: `Buyurtmangiz tayyorlanmoqda. #${id} Jasmin Baliqxona`,
        delivering: `Buyurtmangiz yo'lda! Kuryer sizga yetib kelmoqda. #${id}`,
        completed: `Buyurtmangiz yetkazildi. Rahmat! Jasmin Baliqxona`,
        cancelled: `Buyurtmangiz bekor qilindi. #${id} Ma'lumot: +998936421771`,
      };
      if (smsTexts[status]) sendSms(dbState.orders[idx].phone, smsTexts[status]);
    }

    if (dbState.telegramSettings.notifyStatusChange) {
      const statusLabels: Record<string, string> = {
        pending: '⏳ Kutilmoqda',
        preparing: '🔥 Pishirilmoqda',
        delivering: '🚗 Kuryer yo\'lda',
        completed: '✅ Yetkazildi',
        cancelled: '❌ Bekor qilindi',
      };
      const order = dbState.orders[idx];
      sendTelegram(
        `📦 <b>Buyurtma holati o'zgardi</b>  #${order.id}\n` +
        `👤 ${order.customerName} | 📞 ${order.phone}\n` +
        `Yangi holat: <b>${statusLabels[status] || status}</b>`
      );
    }

    res.json(dbState.orders[idx]);
  });

  // 4. Bookings API
  app.get('/api/bookings', (req: Request, res: Response) => {
    res.json(dbState.bookings);
  });

  app.post('/api/bookings', (req: Request, res: Response) => {
    const data = req.body;
    if (!data.roomId || !data.customerName || !data.phone || !data.date || !data.timeSlot) {
      res.status(400).json({ error: "Sektor ID, mijoz ismi, telefon, sana va vaqt tugmasi majburiy!" });
      return;
    }

    // Check conflict (same roomId, same date, same timeSlot)
    const conflict = dbState.bookings.find(x => 
      x.roomId === data.roomId && 
      x.date === data.date && 
      x.timeSlot === data.timeSlot && 
      x.status !== 'cancelled'
    );

    if (conflict) {
      res.status(409).json({ error: "Kechirasiz, ushbu vaqtda bu xona/sektsiya allaqachon band qilingan!" });
      return;
    }

    const booking: RoomBooking = {
      id: 'b_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      roomId: data.roomId,
      roomName: data.roomName || 'Xona',
      customerName: data.customerName,
      phone: data.phone,
      date: data.date,
      timeSlot: data.timeSlot,
      guestCount: Number(data.guestCount || 2),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    dbState.bookings.unshift(booking);
    saveDatabase();
    broadcastUpdate('bookings', {});

    if (dbState.telegramSettings.notifyNewBooking) {
      sendTelegram(
        `🏡 <b>YANGI BAND QILISH!</b>  #${booking.id}\n\n` +
        `🛋 Joy: <b>${booking.roomName}</b>\n` +
        `👤 Mijoz: <b>${booking.customerName}</b>\n` +
        `📞 Tel: ${booking.phone}\n` +
        `📅 Sana: <b>${booking.date}</b>\n` +
        `🕐 Vaqt: <b>${booking.timeSlot}</b>\n` +
        `👥 Mehmonlar: ${booking.guestCount} kishi`
      );
    }
    res.status(201).json(booking);
  });

  app.put('/api/bookings/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const idx = dbState.bookings.findIndex(x => String(x.id) === String(id));
    if (idx === -1) {
      res.status(404).json({ error: "Sektor buyurtmasi topilmadi" });
      return;
    }
    dbState.bookings[idx].status = status;
    saveDatabase();
    broadcastUpdate('bookings', {});
    res.json(dbState.bookings[idx]);
  });

  // 5. Admin Emails API (only count returned — list kept private)
  app.get('/api/admin-emails', requireAdmin, (req: Request, res: Response) => {
    res.json({ count: (dbState.adminEmails || []).length });
  });

  app.post('/api/admin-emails', requireAdmin, (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: "Email manzili berilishi shart!" });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!dbState.adminEmails) {
      dbState.adminEmails = ['asadbekmurodilov7@gmail.com', 'admin@jasmin.uz', 'manager@jasmin.uz'];
    }
    if (dbState.adminEmails.includes(cleanEmail)) {
      res.status(409).json({ error: "Ushbu email allaqachon ro'yxatda mavjud!" });
      return;
    }
    dbState.adminEmails.push(cleanEmail);
    saveDatabase();
    res.status(201).json(dbState.adminEmails);
  });

  app.delete('/api/admin-emails', requireAdmin, (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: "Email manzili berilishi shart!" });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!dbState.adminEmails) {
      dbState.adminEmails = ['asadbekmurodilov7@gmail.com', 'admin@jasmin.uz', 'manager@jasmin.uz'];
    }
    if (cleanEmail === 'asadbekmurodilov7@gmail.com') {
      res.status(400).json({ error: "Asosiy master admin emailini o'chirib bo'lmaydi!" });
      return;
    }
    dbState.adminEmails = dbState.adminEmails.filter(e => e !== cleanEmail);
    saveDatabase();
    res.json(dbState.adminEmails);
  });

  // 6. Admin PIN & OTP API
  const activeOTPs: Record<string, { code: string; expiresAt: number }> = {};

  app.post('/api/admin-pin', requireAdmin, (req: Request, res: Response) => {
    const { pin } = req.body;
    if (!pin || typeof pin !== 'string') {
      res.status(400).json({ error: "PIN-kod bo'sh bo'lishi mumkin emas!" });
      return;
    }
    const cleanPin = pin.trim();
    if (cleanPin.length < 4) {
      res.status(400).json({ error: "PIN-kod kamida 4 ta belgidan iborat bo'lishi shart!" });
      return;
    }
    dbState.adminPin = cleanPin;
    saveDatabase();
    res.json({ pin: dbState.adminPin, message: "PIN-kod muvaffaqiyatli yangilandi!" });
  });

  app.post('/api/send-otp', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: "Email manzili kiritilmadi!" });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const isAuthorized = (dbState.adminEmails || []).some(e => e.trim().toLowerCase() === cleanEmail);
    if (!isAuthorized) {
      res.status(403).json({ error: "Kechirasiz, ushbu email manzili adminlar ro'yxatida mavjud emas!" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    activeOTPs[cleanEmail] = { code: otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    const isDev = process.env.NODE_ENV !== 'production';
    console.log(`\n🔐 ADMIN OTP [${cleanEmail}]: ${otp}  (5 daqiqa amal qiladi)\n`);

    res.json({
      success: true,
      message: isDev
        ? "Demo rejim: kod quyida ko'rsatildi."
        : "Tasdiqlash kodi emailingizga yuborildi.",
      email: cleanEmail,
      // Only expose in dev — never in production
      ...(isDev && { devCode: otp })
    });
  });

  app.post('/api/verify-login', (req: Request, res: Response) => {
    const ip = req.ip || '';
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: "Juda ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring." });
      return;
    }

    const { email, code, pin } = req.body;
    if (!email || !code || !pin) {
      res.status(400).json({ error: "Barcha maydonlar (email, kod, PIN) to'ldirilishi shart!" });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    const cleanPin = pin.trim();

    // 1. Verify email authority
    const isAuthorized = (dbState.adminEmails || []).some(e => e.trim().toLowerCase() === cleanEmail);
    if (!isAuthorized) {
      recordFailedAttempt(ip);
      res.status(403).json({ error: "Email ro'yxatda mavjud emas!" });
      return;
    }

    // 2. Verify Security PIN
    if (cleanPin !== (dbState.adminPin || '7777')) {
      recordFailedAttempt(ip);
      res.status(401).json({ error: "Xavfsizlik PIN-kodi yoki Parol noto'g'ri kiritildi!" });
      return;
    }

    // 3. Verify OTP code
    const otpEntry = activeOTPs[cleanEmail];
    if (!otpEntry || otpEntry.code !== cleanCode) {
      recordFailedAttempt(ip);
      res.status(400).json({ error: "Tasdiqlash kodi xato!" });
      return;
    }
    if (Date.now() > otpEntry.expiresAt) {
      delete activeOTPs[cleanEmail];
      recordFailedAttempt(ip);
      res.status(400).json({ error: "Tasdiqlash kodining muddati tugadi. Qayta kod oling!" });
      return;
    }

    delete activeOTPs[cleanEmail];
    clearAttempts(req.ip || '');
    const token = signToken(cleanEmail);
    res.json({ success: true, token, message: "Kirish muvaffaqiyatli yakunlandi!" });
  });

  // PIN-only login
  app.post('/api/pin-login', (req: Request, res: Response) => {
    const ip = req.ip || '';
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: "Juda ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring." });
      return;
    }
    const { pin } = req.body;
    if (!pin) { res.status(400).json({ error: "PIN kiritilmadi!" }); return; }
    if (pin.trim() !== (dbState.adminPin || '7777')) {
      recordFailedAttempt(ip);
      res.status(401).json({ error: "PIN noto'g'ri!" });
      return;
    }
    clearAttempts(ip);
    const adminEmail = (dbState.adminEmails || [])[0] || 'admin@jasmin.uz';
    const token = signToken(adminEmail);
    res.json({ success: true, token });
  });

  // 5b. Phone-based order/booking lookup (public)
  app.get('/api/orders/by-phone/:phone', (req: Request, res: Response) => {
    const phone = req.params.phone.replace(/\D/g, '');
    if (phone.length < 7) { res.status(400).json({ error: 'Telefon raqam noto\'g\'ri' }); return; }
    const found = dbState.orders.filter(o => o.phone.replace(/\D/g, '').includes(phone));
    res.json(found);
  });

  app.get('/api/bookings/by-phone/:phone', (req: Request, res: Response) => {
    const phone = req.params.phone.replace(/\D/g, '');
    if (phone.length < 7) { res.status(400).json({ error: 'Telefon raqam noto\'g\'ri' }); return; }
    const found = dbState.bookings.filter(b => b.phone.replace(/\D/g, '').includes(phone));
    res.json(found);
  });

  // 9. SMS Settings API
  app.get('/api/sms-settings', requireAdmin, (req: Request, res: Response) => {
    const { eskizToken, ...safe } = dbState.smsSettings;
    res.json({ ...safe, tokenMasked: eskizToken ? '***' + eskizToken.slice(-6) : '' });
  });

  app.post('/api/sms-settings', requireAdmin, async (req: Request, res: Response) => {
    const data = req.body;
    const prev = dbState.smsSettings;
    dbState.smsSettings = {
      enabled: data.enabled ?? prev.enabled,
      eskizToken: data.eskizToken?.trim() || prev.eskizToken,
      senderId: data.senderId?.trim() || prev.senderId || 'Jasmin',
      notifyNewOrder: data.notifyNewOrder ?? prev.notifyNewOrder,
      notifyStatusChange: data.notifyStatusChange ?? prev.notifyStatusChange,
    };
    saveDatabase();
    res.json({ success: true, message: 'SMS sozlamalari saqlandi!' });
  });

  app.post('/api/sms-test', requireAdmin, async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) { res.status(400).json({ error: 'Telefon raqami kiritilmadi' }); return; }
    await sendSms(phone, 'Jasmin Baliqxona SMS tizimi muvaffaqiyatli ulandi!');
    res.json({ success: true, message: 'Test SMS yuborildi' });
  });

  // 7. Payment Settings API
  app.get('/api/payment-settings', (req: Request, res: Response) => {
    res.json(dbState.paymentSettings || DEFAULT_PAYMENT_SETTINGS);
  });

  app.post('/api/payment-settings', requireAdmin, (req: Request, res: Response) => {
    const data = req.body;
    if (!data.cardNumber) {
      res.status(400).json({ error: "Karta raqami kiritilishi shart!" });
      return;
    }
    dbState.paymentSettings = {
      cardNumber: data.cardNumber.trim(),
      cardName: (data.cardName || '').trim(),
      clickServiceId: (data.clickServiceId || '').trim(),
      paymeMerchantId: (data.paymeMerchantId || '').trim(),
      instructionText: (data.instructionText || '').trim()
    };
    saveDatabase();
    res.json({ paymentSettings: dbState.paymentSettings, message: "To'lov sozlamalari muvaffaqiyatli yangilandi!" });
  });

  // 8. Telegram Settings API
  app.get('/api/telegram-settings', requireAdmin, (req: Request, res: Response) => {
    const { botToken, ...safe } = dbState.telegramSettings;
    // Mask token for display: show only last 6 chars
    res.json({ ...safe, botTokenMasked: botToken ? '***' + botToken.slice(-6) : '' });
  });

  app.post('/api/telegram-settings', requireAdmin, (req: Request, res: Response) => {
    const data = req.body as Partial<TelegramSettings>;
    dbState.telegramSettings = {
      botToken: (data.botToken ?? dbState.telegramSettings.botToken).trim(),
      chatId: (data.chatId ?? dbState.telegramSettings.chatId).trim(),
      enabled: data.enabled ?? dbState.telegramSettings.enabled,
      notifyNewOrder: data.notifyNewOrder ?? dbState.telegramSettings.notifyNewOrder,
      notifyNewBooking: data.notifyNewBooking ?? dbState.telegramSettings.notifyNewBooking,
      notifyStatusChange: data.notifyStatusChange ?? dbState.telegramSettings.notifyStatusChange,
    };
    saveDatabase();
    res.json({ success: true, message: 'Telegram sozlamalari saqlandi!' });
  });

  // Test telegram endpoint
  app.post('/api/telegram-test', requireAdmin, async (req: Request, res: Response) => {
    const tg = dbState.telegramSettings;
    if (!tg.botToken || !tg.chatId) {
      res.status(400).json({ error: 'Bot token yoki Chat ID kiritilmagan!' });
      return;
    }
    try {
      const url = `https://api.telegram.org/bot${tg.botToken}/sendMessage`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tg.chatId,
          text: '✅ <b>Jasmin Baliqxona</b> — Telegram bot muvaffaqiyatli ulandi! Buyurtmalar haqida xabarlar shu yerga keladi.',
          parse_mode: 'HTML'
        })
      });
      const result = await r.json();
      if (result.ok) {
        res.json({ success: true, message: 'Test xabari yuborildi!' });
      } else {
        res.status(400).json({ error: result.description || 'Telegram API xatoligi' });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Serve static assets in production, otherwise Vite middleware handles dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jasmin Baliqxona Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
