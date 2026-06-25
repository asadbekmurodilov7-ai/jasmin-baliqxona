export interface MenuItem {
  id: string;
  name: string;
  category: 'baliq' | 'salatlar' | 'yonlar' | 'ichimliklar' | 'non';
  price: number; // in UZS (sum)
  description: string;
  image: string;
  images?: string[];
  available: boolean;
  size: string; // e.g. "1 kg", "1 dona", "1 portsiya"
  isMultipleSizes?: boolean;
  sizeOptions?: { size: string; price: number }[];
}

export interface Room {
  id: string;
  name: string;
  type: 'tapchan' | 'kabinka' | 'zal';
  capacity: number; // max guests
  priceBooking: number; // in UZS (0 if free)
  description: string;
  features: string[]; // e.g. ["Televizor", "Konditsiyoner", "Daryo bo'yi", "Yumshoq yostiqlar"]
  image: string;
  images?: string[];
  available: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress: string;
  deliveryDistanceKm: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  paymentMethod: 'naqd' | 'click' | 'payme';
  notes?: string;
  createdAt: string;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  roomName: string;
  customerName: string;
  phone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "18:00 - 20:00"
  guestCount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface PaymentSettings {
  cardNumber: string;
  cardName: string;
  clickServiceId: string;
  paymeMerchantId: string;
  instructionText: string;
}

export interface SmsSettings {
  enabled: boolean;
  eskizToken: string;
  senderId: string;
  notifyNewOrder: boolean;
  notifyStatusChange: boolean;
}

export interface TelegramSettings {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifyNewOrder: boolean;
  notifyNewBooking: boolean;
  notifyStatusChange: boolean;
}

