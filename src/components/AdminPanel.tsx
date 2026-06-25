import React, { useState, useEffect } from 'react';
import { MenuItem, Room, Order, RoomBooking, PaymentSettings } from '../types';
import { adminFetch } from '../lib/adminFetch';
import MultiImageInput from './MultiImageInput';
import {
  Plus, Trash2, CheckCircle2, XCircle, RotateCcw, ToggleLeft, ToggleRight,
  DollarSign, ShoppingBag, Calendar, ListFilter, Image, Layers, FileText, Check, Award,
  Upload, X, Edit2, AlertTriangle, Users, Shield, Mail, Lock, CreditCard, Wallet, QrCode,
  Send, Bell, BellOff, Eye, EyeOff, Bot, MessageSquare, Phone
} from 'lucide-react';

interface AdminPanelProps {
  menuItems: MenuItem[];
  rooms: Room[];
  orders: Order[];
  bookings: RoomBooking[];
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<any>;
  onUpdateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<any>;
  onDeleteMenuItem: (id: string) => Promise<any>;
  onAddRoom: (room: Omit<Room, 'id'>) => Promise<any>;
  onUpdateRoom: (id: string, updates: Partial<Room>) => Promise<any>;
  onDeleteRoom: (id: string) => Promise<any>;
  onUpdateOrderStatus: (id: string, status: Order['status']) => Promise<any>;
  onUpdateBookingStatus: (id: string, status: RoomBooking['status']) => Promise<any>;
  paymentSettings?: PaymentSettings;
  onUpdatePaymentSettings?: (updates: PaymentSettings) => Promise<any>;
}

export default function AdminPanel({
  menuItems,
  rooms,
  orders,
  bookings,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onUpdateOrderStatus,
  onUpdateBookingStatus,
  paymentSettings,
  onUpdatePaymentSettings,
}: AdminPanelProps) {
  
  const [adminTab, setAdminTab] = useState<'items' | 'orders' | 'bookings' | 'rooms' | 'emails' | 'payments' | 'telegram'>('items');

  // Telegram settings state
  const [tgBotToken, setTgBotToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');
  const [tgEnabled, setTgEnabled] = useState(false);
  const [tgNotifyOrder, setTgNotifyOrder] = useState(true);
  const [tgNotifyBooking, setTgNotifyBooking] = useState(true);
  const [tgNotifyStatus, setTgNotifyStatus] = useState(true);
  const [tgTokenMasked, setTgTokenMasked] = useState('');
  const [tgShowToken, setTgShowToken] = useState(false);
  const [tgSaving, setTgSaving] = useState(false);
  const [tgTesting, setTgTesting] = useState(false);
  const [tgMsg, setTgMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // SMS Settings state
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsToken, setSmsToken] = useState('');
  const [smsTokenMasked, setSmsTokenMasked] = useState('');
  const [smsSenderId, setSmsSenderId] = useState('Jasmin');
  const [smsNotifyOrder, setSmsNotifyOrder] = useState(true);
  const [smsNotifyStatus, setSmsNotifyStatus] = useState(true);
  const [smsTestPhone, setSmsTestPhone] = useState('');
  const [smsSaving, setSmsSaving] = useState(false);
  const [smsTesting, setSmsTesting] = useState(false);
  const [smsMsg, setSmsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    adminFetch('/api/telegram-settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setTgEnabled(data.enabled);
        setTgChatId(data.chatId);
        setTgNotifyOrder(data.notifyNewOrder);
        setTgNotifyBooking(data.notifyNewBooking);
        setTgNotifyStatus(data.notifyStatusChange);
        setTgTokenMasked(data.botTokenMasked || '');
      })
      .catch(() => {});
  }, []);

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setTgSaving(true);
    setTgMsg(null);
    try {
      const payload: any = {
        enabled: tgEnabled,
        chatId: tgChatId,
        notifyNewOrder: tgNotifyOrder,
        notifyNewBooking: tgNotifyBooking,
        notifyStatusChange: tgNotifyStatus,
      };
      if (tgBotToken.trim()) payload.botToken = tgBotToken.trim();
      const res = await adminFetch('/api/telegram-settings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setTgMsg({ type: 'success', text: data.message });
        setTgBotToken('');
        if (tgBotToken.trim()) setTgTokenMasked('***' + tgBotToken.trim().slice(-6));
      } else {
        setTgMsg({ type: 'error', text: data.error || 'Xatolik!' });
      }
    } catch {
      setTgMsg({ type: 'error', text: 'Server bilan ulanishda xatolik!' });
    } finally {
      setTgSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setTgTesting(true);
    setTgMsg(null);
    try {
      const res = await adminFetch('/api/telegram-test', { method: 'POST' });
      const data = await res.json();
      setTgMsg({ type: res.ok ? 'success' : 'error', text: res.ok ? data.message : data.error });
    } catch {
      setTgMsg({ type: 'error', text: 'Server bilan ulanishda xatolik!' });
    } finally {
      setTgTesting(false);
    }
  };

  useEffect(() => {
    adminFetch('/api/sms-settings').then(r => r.ok ? r.json() : null).then(data => {
      if (!data) return;
      setSmsEnabled(data.enabled);
      setSmsSenderId(data.senderId || 'Jasmin');
      setSmsNotifyOrder(data.notifyNewOrder);
      setSmsNotifyStatus(data.notifyStatusChange);
      setSmsTokenMasked(data.tokenMasked || '');
    }).catch(() => {});
  }, []);

  const handleSaveSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsSaving(true); setSmsMsg(null);
    try {
      const payload: any = { enabled: smsEnabled, senderId: smsSenderId, notifyNewOrder: smsNotifyOrder, notifyStatusChange: smsNotifyStatus };
      if (smsToken.trim()) payload.eskizToken = smsToken.trim();
      const res = await adminFetch('/api/sms-settings', { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        setSmsMsg({ type: 'success', text: data.message });
        setSmsToken('');
        if (smsToken.trim()) setSmsTokenMasked('***' + smsToken.trim().slice(-6));
      } else setSmsMsg({ type: 'error', text: data.error || 'Xatolik!' });
    } catch { setSmsMsg({ type: 'error', text: 'Server bilan ulanishda xatolik!' }); }
    finally { setSmsSaving(false); }
  };

  const handleTestSms = async () => {
    if (!smsTestPhone.trim()) { setSmsMsg({ type: 'error', text: 'Test uchun telefon raqam kiriting!' }); return; }
    setSmsTesting(true); setSmsMsg(null);
    try {
      const res = await adminFetch('/api/sms-test', { method: 'POST', body: JSON.stringify({ phone: smsTestPhone }) });
      const data = await res.json();
      setSmsMsg({ type: res.ok ? 'success' : 'error', text: res.ok ? data.message : data.error });
    } catch { setSmsMsg({ type: 'error', text: 'Server bilan ulanishda xatolik!' }); }
    finally { setSmsTesting(false); }
  };
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isMultipleSizes, setIsMultipleSizes] = useState(false);
  const [sizeOptions, setSizeOptions] = useState<{ size: string; price: number }[]>([]);

  // Payment configuration form states
  const [cardNumber, setCardNumber] = useState(paymentSettings?.cardNumber || '');
  const [cardName, setCardName] = useState(paymentSettings?.cardName || '');
  const [clickServiceId, setClickServiceId] = useState(paymentSettings?.clickServiceId || '');
  const [paymeMerchantId, setPaymeMerchantId] = useState(paymentSettings?.paymeMerchantId || '');
  const [instructionText, setInstructionText] = useState(paymentSettings?.instructionText || '');

  // Synchronize payment config states once loaded from parent
  React.useEffect(() => {
    if (paymentSettings) {
      setCardNumber(paymentSettings.cardNumber);
      setCardName(paymentSettings.cardName);
      setClickServiceId(paymentSettings.clickServiceId);
      setPaymeMerchantId(paymentSettings.paymeMerchantId);
      setInstructionText(paymentSettings.instructionText);
    }
  }, [paymentSettings]);

  // Admin emails management state
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isEmailsLoading, setIsEmailsLoading] = useState(false);
  const [adminPinCode, setAdminPinCode] = useState('');

  const fetchPin = async () => {
    try {
      const res = await adminFetch('/api/admin-pin');
      if (res.ok) {
        const data = await res.json();
        if (data && data.pin) {
          setAdminPinCode(data.pin);
        }
      }
    } catch (e) {
      console.warn("Xavfsizlik parolini yuklashda xatolik:", e);
    }
  };

  const fetchEmails = async () => {
    try {
      setIsEmailsLoading(true);
      const res = await adminFetch('/api/admin-emails');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEmails(data);
        }
      }
      await fetchPin();
    } catch (e) {
      console.error("Xatolik yuklashda:", e);
    } finally {
      setIsEmailsLoading(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = adminPinCode.trim();
    if (!cleanPin) {
      showNotification("PIN-kod bo'sh bo'lishi mumkin emas!", "error");
      return;
    }
    if (cleanPin.length < 4) {
      showNotification("PIN-kod kamida 4 ta belgidan iborat bo'lishi shart!", "error");
      return;
    }

    try {
      const res = await adminFetch('/api/admin-pin', {
        method: 'POST',
        body: JSON.stringify({ pin: cleanPin })
      });
      if (res.ok) {
        const data = await res.json();
        setAdminPinCode(data.pin);
        showNotification("Xavfsizlik PIN-kodi (Kalit parol) muvaffaqiyatli yangilandi!");
      } else {
        const err = await res.json();
        showNotification(err.error || "Xatolik yuz berdi", "error");
      }
    } catch (err) {
      showNotification("Server bilan bog'lanishda xatolik yuz berdi!", "error");
    }
  };

  React.useEffect(() => {
    fetchEmails();
  }, []);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMail = newEmail.trim().toLowerCase();
    if (!cleanMail) return;
    
    // basic match email format
    if (!cleanMail.includes('@') || !cleanMail.includes('.')) {
      showNotification("Iltimos, to'g'ri email manzilini kiriting!", "error");
      return;
    }

    try {
      const res = await adminFetch('/api/admin-emails', {
        method: 'POST',
        body: JSON.stringify({ email: cleanMail })
      });
      if (res.ok) {
        const updated = await res.json();
        setEmails(updated);
        setNewEmail('');
        showNotification("Yangi administrator muvaffaqiyatli qo'shildi!");
      } else {
        const err = await res.json();
        showNotification(err.error || "Xatolik yuz berdi", "error");
      }
    } catch (err) {
      showNotification("Server bilan aloqa bog'lashda xatolik!", "error");
    }
  };

  const handleDeleteEmail = async (emailToDelete: string) => {
    if (emailToDelete === 'asadbekmurodilov7@gmail.com') {
      showNotification("Asosiy master admin emailini o'chirib bo'lmaydi!", "error");
      return;
    }
    try {
      const res = await adminFetch('/api/admin-emails', {
        method: 'DELETE',
        body: JSON.stringify({ email: emailToDelete })
      });
      if (res.ok) {
        const updated = await res.json();
        setEmails(updated);
        showNotification("Admin email ro'yxatdan o'chirildi!");
      } else {
        const err = await res.json();
        showNotification(err.error || "O'chirishda xatolik!", "error");
      }
    } catch (err) {
      showNotification("O'chirishda xatolik yuz berdi!", "error");
    }
  };

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber.trim()) {
      showNotification("Bank karta raqami kiritilishi shart!", "error");
      return;
    }
    if (onUpdatePaymentSettings) {
      try {
        await onUpdatePaymentSettings({
          cardNumber: cardNumber.trim(),
          cardName: cardName.trim(),
          clickServiceId: clickServiceId.trim(),
          paymeMerchantId: paymeMerchantId.trim(),
          instructionText: instructionText.trim()
        });
        showNotification("To'lov sozlamalari muvaffaqiyatli saqlandi!");
      } catch (err: any) {
        showNotification(err.message || "Saqlashda xatolik yuz berdi", "error");
      }
    } else {
      showNotification("Xatolik: Tizim sozlanmalari bog'lanmagan!", "error");
    }
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category as any);
    setItemPrice(String(item.price));
    setItemSize(item.size);
    setItemDesc(item.description || '');
    setItemImages(item.images && item.images.length > 0 ? item.images : [item.image || '']);
    setIsMultipleSizes(!!item.isMultipleSizes);
    setSizeOptions(item.sizeOptions || []);
    const element = document.getElementById('new-item-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const cancelEditItem = () => {
    setEditingItem(null);
    setItemName('');
    setItemCategory('baliq');
    setItemPrice('');
    setItemSize('1 kg');
    setItemDesc('');
    setItemImages(['']);
    setIsMultipleSizes(false);
    setSizeOptions([]);
  };
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'item' | 'room'; name: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleDeleteMenuItem = async (id: string) => {
    const item = menuItems.find(x => String(x.id) === String(id));
    if (item) {
      setDeleteTarget({ id, type: 'item', name: item.name });
    }
  };

  const handleDeleteRoom = async (id: string) => {
    const room = rooms.find(x => String(x.id) === String(id));
    if (room) {
      setDeleteTarget({ id, type: 'room', name: room.name });
    }
  };

  // New Menu Item form states
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<'baliq' | 'salatlar' | 'yonlar' | 'ichimliklar' | 'non'>('baliq');
  const [itemPrice, setItemPrice] = useState('');
  const [itemSize, setItemSize] = useState('1 kg');
  const [itemDesc, setItemDesc] = useState('');
  const [itemImages, setItemImages] = useState<string[]>(['']);

  // New Room form states
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState<'tapchan' | 'kabinka' | 'zal'>('tapchan');
  const [roomCapacity, setRoomCapacity] = useState('8');
  const [roomBookingFee, setRoomBookingFee] = useState('20000');
  const [roomDesc, setRoomDesc] = useState('');
  const [roomImages, setRoomImages] = useState<string[]>(['']);

  // Status lists
  const orderStatuses: { key: Order['status']; label: string; color: string }[] = [
    { key: 'pending', label: 'Kutilmoqda', color: 'bg-yellow-50 text-yellow-800 border-yellow-250 border' },
    { key: 'preparing', label: 'Tayyorlanmoqda', color: 'bg-blue-50 text-blue-800 border-blue-250 border' },
    { key: 'delivering', label: 'Yo’lda', color: 'bg-indigo-50 text-indigo-800 border-indigo-250 border' },
    { key: 'completed', label: 'Yetkazildi', color: 'bg-emerald-50 text-emerald-800 border-emerald-250 border animate-pulse' },
    { key: 'cancelled', label: 'Bekor qilindi', color: 'bg-rose-50 text-rose-800 border-rose-250 border' }
  ];

  const bookingStatuses: { key: RoomBooking['status']; label: string; color: string }[] = [
    { key: 'pending', label: 'Kutilmoqda', color: 'bg-yellow-50 text-yellow-800 border-yellow-250 border' },
    { key: 'confirmed', label: 'Tasdiqlandi', color: 'bg-emerald-50 text-emerald-800 border-emerald-250 border' },
    { key: 'cancelled', label: 'Bekor qilindi', color: 'bg-rose-50 text-rose-800 border-rose-250 border' }
  ];

  // Calculated Stats
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeReservations = bookings.filter(b => b.status === 'confirmed').length;

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || (!isMultipleSizes && (!itemPrice || !itemSize))) {
      showNotification("Iltimos, nomi, narxi va uning o'lchamini to'ldiring!", "error");
      return;
    }

    if (isMultipleSizes && sizeOptions.length === 0) {
      showNotification("Iltimos, kamida bitta hajm/litr variantini va uning narxini qo'shing!", "error");
      return;
    }

    try {
      const finalPrice = isMultipleSizes && sizeOptions.length > 0 ? sizeOptions[0].price : Number(itemPrice);
      const finalSize = isMultipleSizes && sizeOptions.length > 0 ? sizeOptions[0].size : itemSize;

      const cleanItemImages = itemImages.filter(u => u.trim());
      const mainItemImage = cleanItemImages[0] || 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80';
      if (editingItem) {
        await onUpdateMenuItem(editingItem.id, {
          name: itemName,
          category: itemCategory,
          price: finalPrice,
          size: finalSize,
          description: itemDesc,
          image: mainItemImage,
          images: cleanItemImages.length > 0 ? cleanItemImages : undefined,
          isMultipleSizes,
          sizeOptions: isMultipleSizes ? sizeOptions : undefined
        });
        showNotification("Mahsulot muvaffaqiyatli tahrirlandi!");
        setEditingItem(null);
      } else {
        await onAddMenuItem({
          name: itemName,
          category: itemCategory,
          price: finalPrice,
          size: finalSize,
          description: itemDesc,
          image: mainItemImage,
          images: cleanItemImages.length > 0 ? cleanItemImages : undefined,
          available: true,
          isMultipleSizes,
          sizeOptions: isMultipleSizes ? sizeOptions : undefined
        });
        showNotification("Yangi mahsulot menyuga muvaffaqiyatli qo'shildi!");
      }
      // reset states
      setItemName('');
      setItemPrice('');
      setItemSize('1 kg');
      setItemImages(['']);
      setItemDesc('');
      setItemImage('');
      setIsMultipleSizes(false);
      setSizeOptions([]);
    } catch (err: any) {
      showNotification("Xatolik: " + err.message, "error");
    }
  };

  const startEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomName(room.name);
    setRoomType(room.type as any);
    setRoomCapacity(String(room.capacity));
    setRoomBookingFee(String(room.priceBooking));
    setRoomDesc(room.description || '');
    setRoomImages(room.images && room.images.length > 0 ? room.images : [room.image || '']);
  };

  const cancelEditRoom = () => {
    setEditingRoom(null);
    setRoomName('');
    setRoomType('tapchan');
    setRoomCapacity('8');
    setRoomBookingFee('20000');
    setRoomDesc('');
    setRoomImages(['']);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !roomCapacity) {
      showNotification("Joy nomi va sig'imini to'ldiring!", "error");
      return;
    }

    try {
      const cleanRoomImages = roomImages.filter(u => u.trim());
      const mainRoomImage = cleanRoomImages[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80';
      if (editingRoom) {
        await onUpdateRoom(editingRoom.id, {
          name: roomName,
          type: roomType,
          capacity: Number(roomCapacity),
          priceBooking: Number(roomBookingFee || 0),
          description: roomDesc,
          image: mainRoomImage,
          images: cleanRoomImages.length > 0 ? cleanRoomImages : undefined,
        });
        showNotification("Xona muvaffaqiyatli tahrirlandi!");
        setEditingRoom(null);
      } else {
        await onAddRoom({
          name: roomName,
          type: roomType,
          capacity: Number(roomCapacity),
          priceBooking: Number(roomBookingFee || 0),
          description: roomDesc,
          features: ["Konditsioner", "Yumshoq ko'rpachalar", "VIP Xizmat"],
          image: mainRoomImage,
          images: cleanRoomImages.length > 0 ? cleanRoomImages : undefined,
          available: true
        });
        showNotification("Yangi vip xona/tapchan muvaffaqiyatli qo'shildi!");
      }
      setRoomName('');
      setRoomCapacity('8');
      setRoomBookingFee('20000');
      setRoomDesc('');
      setRoomImages(['']);
    } catch (err: any) {
      showNotification("Xatolik: " + err.message, "error");
    }
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString('uz-UZ') + " so'm";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Title / Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-black text-zinc-950 dark:text-white flex items-center">
            <Layers className="h-6 w-6 mr-2 text-amber-500" />
            Jasmin Baliqxona Ma'muriyat Tizimi
          </h2>
          <p className="text-zinc-500 text-xs mt-1">
            Ushbu panelda yangi taom qo'shish, mahsulot bor/yo'qligini belgilash, buyurtmalarni monitoring qilish va xonalar bandini boshqarish imkoniyatlari mavjud.
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex flex-wrap gap-1 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setAdminTab('items')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === 'items' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Mahsulotlar Oqimi
          </button>
          <button
            onClick={() => setAdminTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === 'orders' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Buyurtmalar ({orders.length})
          </button>
          <button
            onClick={() => setAdminTab('bookings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === 'bookings' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Joylar Bandi ({bookings.length})
          </button>
          <button
            onClick={() => setAdminTab('rooms')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === 'rooms' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Xonalar Sozlanmasi
          </button>
          <button
            onClick={() => {
              setAdminTab('emails');
              fetchEmails();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === 'emails' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Adminlar Sozlanmasi
          </button>
          <button
            onClick={() => setAdminTab('payments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adminTab === 'payments' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            To'lov Sozlamalari
          </button>
          <button
            onClick={() => setAdminTab('telegram')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              adminTab === 'telegram' ? 'bg-blue-600 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            Telegram Bot
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
            : 'bg-rose-50 border-rose-250 text-rose-800'
        }`}>
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-80 text-base font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Overview Analytics row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-xs border border-zinc-150 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Kassa aylanmasi (Yetkazildi):</span>
            <strong className="text-xl md:text-2xl font-black text-emerald-900">{formatPrice(totalRevenue)}</strong>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign className="w-6 h-6 stroke-[2.5]" id="stat-revenue-icon" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-xs border border-zinc-150 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Jami Onlayn Buyurtmalar:</span>
            <strong className="text-xl md:text-2xl font-black text-zinc-905 text-zinc-900 dark:text-white">{orders.length} ta</strong>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-xs border border-zinc-150 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Tasdiqlangan Joylar Bandi:</span>
            <strong className="text-xl md:text-2xl font-black text-zinc-950 dark:text-white">{activeReservations} ta</strong>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tab Contents: 1. ITEMS MANAGER */}
      {adminTab === 'items' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Form Create (5 Cols) */}
          <div id="new-item-form" className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-150 space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-zinc-800 dark:text-zinc-100 border-b pb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                {editingItem ? <Edit2 className="h-4 w-4 mr-1 text-amber-500" /> : <Plus className="h-4 w-4 mr-1 text-amber-500" />}
                {editingItem ? `Tahrirlash: ${editingItem.name}` : "Yangi Taom/Garnir Qo'shish"}
              </span>
              {editingItem && (
                <button 
                  type="button" 
                  onClick={cancelEditItem}
                  className="text-xs bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md font-bold transition-colors"
                >
                  Bekor qilish
                </button>
              )}
            </h3>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs select-none">
              
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 label-small uppercase mb-1">Nomi:</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Lola-baliq pechda, Maxsus qovurdoq"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-350 rounded-lg text-xs text-zinc-900 dark:text-white font-medium placeholder-zinc-400"
                />
              </div>

              {/* Toggle multiple sizes */}
              <div className="bg-[#fcfbf9] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100 uppercase block text-[10px]">Bir nechta hajm / litrli o'lchamlar</span>
                  <span className="text-[9px] text-zinc-500 block leading-tight">Suvlar va ichimliklar uchun har xil litr va farqli narxlar kiritish imkoniyati</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isMultipleSizes;
                    setIsMultipleSizes(nextVal);
                    if (nextVal && sizeOptions.length === 0) {
                      setSizeOptions([
                        { size: '0.5 litr', price: 8000 },
                        { size: '1 litr', price: 12000 }
                      ]);
                    }
                  }}
                  className="focus:outline-none cursor-pointer"
                >
                  {isMultipleSizes ? (
                    <ToggleRight className="h-7 w-7 text-amber-500 hover:text-amber-600 transition-colors" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-zinc-300 hover:text-zinc-400 transition-colors" />
                  )}
                </button>
              </div>

              {/* Layout depending on multiple size toggles */}
              {!isMultipleSizes ? (
                <>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Rukn (Kategoriya):</label>
                      <select
                        value={itemCategory}
                        onChange={(e: any) => {
                          const selectedVal = e.target.value;
                          setItemCategory(selectedVal);
                          if (selectedVal === 'ichimliklar') {
                            setItemSize('1 litr');
                          } else if (itemSize.includes('litr') || itemSize.includes('choynak')) {
                            setItemSize('1 kg');
                          }
                        }}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-350 rounded-lg text-xs text-zinc-900 dark:text-white font-medium"
                      >
                        <option value="baliq">Mazzali Baliqlar</option>
                        <option value="salatlar">Xarxil Salatlar</option>
                        <option value="yonlar">Garnir & Qaylalar</option>
                        <option value="non">Tandir Non</option>
                        <option value="ichimliklar">Choy & Sharbati</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                        {itemCategory === 'ichimliklar' ? "Hajmi (Litr):" : "O'lchovi (Portsiya / KG):"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={itemCategory === 'ichimliklar' ? "Masalan: 1 litr, 0.5 litr" : "Masalan: 1 kg, 1 portsiya, 1 dona"}
                        value={itemSize}
                        onChange={(e) => setItemSize(e.target.value)}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-35 rounded-lg text-xs text-zinc-900 dark:text-white font-medium placeholder-zinc-400"
                      />
                      
                      {/* Selectable Liters / Measurement options */}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {itemCategory === 'ichimliklar' ? (
                          ['0.5 litr', '1 litr', '1.5 litr', '2 litr', '1 choynak'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setItemSize(preset)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                itemSize === preset
                                  ? 'bg-amber-500 text-zinc-950 dark:text-white border-amber-600'
                                  : 'bg-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300'
                              }`}
                            >
                              {preset}
                            </button>
                          ))
                        ) : (
                          ['1 kg', '0.5 kg', '1 portsiya', '1 dona'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setItemSize(preset)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                itemSize === preset
                                  ? 'bg-amber-500 text-zinc-950 dark:text-white border-amber-600'
                                  : 'bg-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300'
                              }`}
                            >
                              {preset}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                      Narxi (So'mda {itemSize ? `- ${itemSize} uchun` : ''}):
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Masalan: 95000"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-350 rounded-lg text-xs font-mono font-bold text-zinc-900 dark:text-white placeholder-zinc-400"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Rukn (Kategoriya):</label>
                    <select
                      value={itemCategory}
                      onChange={(e: any) => setItemCategory(e.target.value)}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-350 rounded-lg text-xs text-zinc-900 dark:text-white font-medium"
                    >
                      <option value="baliq">Mazzali Baliqlar</option>
                      <option value="salatlar">Xarxil Salatlar</option>
                      <option value="yonlar">Garnir & Qaylalar</option>
                      <option value="non">Tandir Non</option>
                      <option value="ichimliklar">Choy & Sharbati</option>
                    </select>
                  </div>

                  <div className="bg-[#fcfbf9] p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-2">
                      <span className="font-bold text-[10px] text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Variantlar va Narxlar ro'yxati:</span>
                      <button
                        type="button"
                        onClick={() => setSizeOptions(prev => [...prev, { size: '1.5 litr', price: 15000 }])}
                        className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Variant qo'shish
                      </button>
                    </div>

                    {sizeOptions.map((opt, oIdx) => (
                      <div key={oIdx} className="flex gap-2.5 items-end">
                        <div className="flex-1">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-0.5">Hajmi (litri / kilogramm...):</label>
                          <input
                            type="text"
                            required
                            value={opt.size}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSizeOptions(prev => prev.map((x, i) => i === oIdx ? { ...x, size: val } : x));
                            }}
                            placeholder="Masalan: 0.5 litr"
                            className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 rounded text-xs text-zinc-900 dark:text-white font-bold"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-0.5">Narxi (so'mda):</label>
                          <input
                            type="number"
                            required
                            value={opt.price}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setSizeOptions(prev => prev.map((x, i) => i === oIdx ? { ...x, price: val } : x));
                            }}
                            placeholder="Masalan: 8000"
                            className="w-full p-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 rounded text-xs text-zinc-900 dark:text-white font-mono font-bold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setSizeOptions(prev => prev.filter((_, i) => i !== oIdx))}
                          disabled={sizeOptions.length <= 1}
                          className="p-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded border border-zinc-200 dark:border-zinc-800 hover:border-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Taom ta'rifi (Kalloriyasi, tayyorlanish uslubi):</label>
                <textarea
                  placeholder="Zirvorlar bilan boyitilishi yoki pishirilish ko'nikmalari..."
                  value={itemDesc}
                  rows={2}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-350 rounded-lg text-xs text-zinc-900 dark:text-white font-medium placeholder-zinc-400"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5">Rasmlar (birinchisi asosiy):</label>
                <MultiImageInput
                  images={itemImages.filter(u => u.trim())}
                  onChange={setItemImages}
                  onError={(msg) => showNotification(msg, 'error')}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-amber-600 text-white hover:text-black py-2.5 rounded-xl font-bold uppercase tracking-wider transition-colors"
              >
                {editingItem ? "O'zgarishlarni Saqlash" : "Menyuga Qo'shish"}
              </button>

            </form>
          </div>

          {/* List display with availability Toggle ("mahsulotlarni borini qoshb tugab qolganini minus qilib turadigan") (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-150 space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-zinc-100 text-zinc-800 dark:text-zinc-100 border-b pb-1.5 flex items-center justify-between">
              <span>Menyu Elementlari ({menuItems.length})</span>
              <span className="text-[11px] font-normal text-zinc-500">* Borligini yoqish/o'chirish tugmachasi</span>
            </h3>

            <div className="divide-y divide-zinc-100 max-h-120 overflow-y-auto pr-2 space-y-2">
              {menuItems.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2.5 text-xs text-zinc-800 dark:text-zinc-100" id={`admin-menu-row-${item.id}`}>
                  
                  <div className="flex items-center space-x-3 pr-2">
                    <img
                      src={(item.images && item.images[0]) || item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80'; }}
                      className="w-10 h-10 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800"
                    />
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-650 px-1 py-0.5 rounded capitalize mr-1">{item.category}</span>
                        <span>{item.size} • </span>
                        <strong className="text-amber-800">{formatPrice(item.price)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Toggle Button for "mahsulotlarni borini qoshb tugab qolganini minus qilib turadigan" */}
                    <button
                      onClick={() => onUpdateMenuItem(item.id, { available: !item.available })}
                      title={item.available ? "Tugagan bo'lsa bosing" : "Bor bo'lsa bosing"}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all ${
                        item.available
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                      }`}
                      id={`toggle-available-btn-${item.id}`}
                    >
                      {item.available ? (
                        <>
                          <Check className="h-3 w-3 stroke-[2.5]" />
                          <span>Bor (Mavjud)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>Minus (Tugagan)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => startEditItem(item)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        editingItem?.id === item.id
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-350'
                          : 'bg-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 border-zinc-200'
                      }`}
                      title="Mavjud taomni tahrirlash"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className="p-1.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-red-50 text-zinc-400 hover:text-red-650 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-red-300"
                      title="O'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* Tab Contents: 2. ORDERS LIST MANAGER */}
      {adminTab === 'orders' && (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-150 space-y-4 animate-fade-in text-xs">
          <h3 className="font-extrabold text-sm uppercase tracking-wide text-zinc-800 dark:text-zinc-100 border-b pb-1.5">
            Mijozlar buyurtmalari navbati ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <FileText className="h-10 w-10 mx-auto text-zinc-300 mb-2 stroke-1" />
              Hozircha onlayn buyurtmalar kelib tushmadi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap divide-y divide-zinc-200">
                <thead className="bg-[#fcfbf9] font-bold text-zinc-650">
                  <tr>
                    <th className="py-3 px-4">Buyurtma ID</th>
                    <th className="py-3 px-4">Mijoz / Tel</th>
                    <th className="py-3 px-4">Yetkazish Ma’lumoti</th>
                    <th className="py-3 px-4">Buyurtma tarkibi</th>
                    <th className="py-3 px-4">Jami summa</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">O'zgartirish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 table-cell-text text-zinc-800 dark:text-zinc-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/50">
                      
                      <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-zinc-600 dark:text-zinc-400">
                        {order.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <strong className="text-zinc-950 dark:text-white font-bold block">{order.customerName}</strong>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-wider">{order.phone}</span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wide mb-1 ${
                          order.deliveryType === 'delivery' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-800'
                        }`}>
                          {order.deliveryType === 'delivery' ? `Delivery (${order.deliveryDistanceKm} km)` : 'Pickup'}
                        </span>
                        <div className="max-w-44 text-wrap line-clamp-1 truncate text-zinc-650" title={order.deliveryAddress}>
                          {order.deliveryAddress}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[10px]">
                        <ul className="list-disc pl-3">
                          {order.items.map((it, idx) => (
                            <li key={idx}>
                              <strong>{it.name}</strong> x{it.quantity}
                            </li>
                          ))}
                        </ul>
                        {order.notes && (
                          <div className="text-[9px] text-zinc-500 italic mt-1 bg-zinc-50 dark:bg-zinc-950 p-1 rounded max-w-40 truncate" title={order.notes}>
                            * {order.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-amber-900 font-sans">
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {/* Status Label mapping */}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                          orderStatuses.find(o => o.key === order.status)?.color || 'bg-zinc-100 text-zinc-800'
                        }`}>
                          {orderStatuses.find(o => o.key === order.status)?.label || 'Yuklanmoqda...'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          
                          {order.status === 'pending' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                              className="px-2 py-1 bg-blue-100 text-blue-900 border border-blue-200 rounded text-[10px] font-extrabold hover:bg-blue-200"
                            >
                              Tayyorlashga yuborish
                            </button>
                          )}

                          {order.status === 'preparing' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'delivering')}
                              className="px-2 py-1 bg-indigo-100 text-indigo-900 border border-indigo-250 rounded text-[10px] font-extrabold hover:bg-indigo-200"
                            >
                              Yo'lga chiqarish
                            </button>
                          )}

                          {order.status === 'delivering' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                              className="px-2 py-1 bg-emerald-150 bg-emerald-100 text-emerald-900 border border-emerald-350 rounded text-[10px] font-extrabold hover:bg-emerald-200 flex items-center space-x-0.5"
                            >
                              <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                              <span>Yakunlash</span>
                            </button>
                          )}

                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-750 border border-red-200 rounded text-[10px] font-extrabold"
                            >
                              Bekor qilish
                            </button>
                          )}

                          {(order.status === 'completed' || order.status === 'cancelled') && (
                            <div className="text-[10px] text-zinc-400 italic">Arxivlangan</div>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: 3. BOOKINGS (XONALARNI BAND ETILISHI FEED) */}
      {adminTab === 'bookings' && (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-150 space-y-4 animate-fade-in text-xs">
          <h3 className="font-extrabold text-sm uppercase tracking-wide text-zinc-800 dark:text-zinc-100 border-b pb-1.5 flex items-center justify-between">
            <span>Tapchan & Kabinka Bron qilinishi ({bookings.length})</span>
            <span className="text-[10px] text-zinc-500 font-normal">* Mijozlar ovqatlanish jadvali</span>
          </h3>

          {bookings.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <Calendar className="h-10 w-10 mx-auto text-zinc-300 mb-2 stroke-1" />
              Hozircha xonalarni band etish so'rovlari kelmadi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap divide-y divide-zinc-200">
                <thead className="bg-[#fcfbf9] font-bold text-zinc-650">
                  <tr>
                    <th className="py-3 px-4">Bron ID</th>
                    <th className="py-3 px-4">Xona / Tapchan nomi</th>
                    <th className="py-3 px-4">Mijoz / Aloqasi</th>
                    <th className="py-3 px-4 text-center">Mehmondost kishi</th>
                    <th className="py-3 px-4">Sana va Vaqt</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Harakat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 text-zinc-805 text-zinc-800 dark:text-zinc-100">
                  {bookings.map(book => (
                    <tr key={book.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/50">
                      
                      <td className="py-3 px-4 font-mono font-bold text-[10px] text-zinc-500">
                        {book.id}
                      </td>

                      <td className="py-3 px-4">
                        <strong className="text-zinc-950 dark:text-white font-bold">{book.roomName}</strong>
                      </td>

                      <td className="py-3 px-4">
                        <strong className="text-zinc-900 dark:text-white block font-bold">{book.customerName}</strong>
                        <span className="text-[10px] font-mono text-zinc-400">{book.phone}</span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold font-sans">
                        {book.guestCount} kishi
                      </td>

                      <td className="py-3 px-4 font-black">
                        <div className="text-amber-800">{book.date}</div>
                        <div className="text-[10px] text-zinc-500">{book.timeSlot}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-block ${
                          bookingStatuses.find(o => o.key === book.status)?.color || 'bg-zinc-150 text-zinc-800'
                        }`}>
                          {bookingStatuses.find(o => o.key === book.status)?.label || 'Pending'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          
                          {book.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onUpdateBookingStatus(book.id, 'confirmed')}
                                className="px-2 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-[10px] font-black hover:bg-emerald-200"
                              >
                                Tasdiqlash
                              </button>
                              
                              <button
                                onClick={() => onUpdateBookingStatus(book.id, 'cancelled')}
                                className="px-2 py-1 bg-rose-50 border border-rose-300 text-rose-800 rounded text-[10px] font-black hover:bg-rose-100"
                              >
                                Bekor qilish
                              </button>
                            </>
                          )}

                          {book.status === 'confirmed' && (
                            <button
                              onClick={() => onUpdateBookingStatus(book.id, 'cancelled')}
                              className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 hover:bg-rose-50 text-zinc-400 hover:text-rose-800 rounded text-[10px]"
                            >
                              O'chirish (Bekor)
                            </button>
                          )}

                          {book.status === 'cancelled' && (
                            <div className="text-[10px] text-zinc-400 italic">Arxiv (Bekor etilgan)</div>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Tab Contents: 4. ROOMS SCHEDULER/CONFIG */}
      {adminTab === 'rooms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-xs">
          
          {/* Create room (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-5 rounded-2xl border shadow-sm border-zinc-150 space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-zinc-850 border-b pb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                {editingRoom ? <Edit2 className="h-4 w-4 mr-1 text-amber-500" /> : <Plus className="h-4 w-4 mr-1 text-amber-500" />}
                {editingRoom ? `Tahrirlash: ${editingRoom.name}` : "Yangi Joy/Sektor Qo'shish"}
              </span>
              {editingRoom && (
                <button type="button" onClick={cancelEditRoom} className="text-xs text-zinc-400 hover:text-red-500 font-bold">✕ Bekor</button>
              )}
            </h3>

            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Joy Sektor Nomi:</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: VIP Anhor 3, Sharshara VIP"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-350 rounded-lg text-xs text-zinc-900 dark:text-white font-medium placeholder-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Joy Shakli:</label>
                  <select
                    value={roomType}
                    onChange={(e: any) => setRoomType(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-350 rounded-lg text-xs text-zinc-900 dark:text-white font-medium"
                  >
                    <option value="tapchan">Sharqona Tapchan</option>
                    <option value="kabinka">VIP Kabinka</option>
                    <option value="zal">Umumiy Zal stoli</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Maks Sig'imi (Mehmondost kishi):</label>
                  <input
                    type="number"
                    required
                    placeholder="Masalan: 10"
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-350 rounded-lg text-xs text-zinc-900 dark:text-white font-medium placeholder-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Band qilish xizmat haqi (So'mda, bepul bo'lsa 0):</label>
                <input
                  type="number"
                  required
                  placeholder="Nol qilsangiz bepul hisoblanadi"
                  value={roomBookingFee}
                  onChange={(e) => setRoomBookingFee(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-350 rounded-lg text-xs font-mono text-zinc-900 dark:text-white font-bold placeholder-zinc-400"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Tavsif (Mavjud qulayliklar):</label>
                <textarea
                  placeholder="Televideniya kanallari, milliy bezaklar o'rnatilgan..."
                  rows={2}
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-350 rounded-lg text-xs text-zinc-900 dark:text-white font-medium placeholder-zinc-400"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5">Rasmlar (birinchisi asosiy):</label>
                <MultiImageInput
                  images={roomImages.filter(u => u.trim())}
                  onChange={setRoomImages}
                  onError={(msg) => showNotification(msg, 'error')}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-amber-600 text-white hover:text-black py-2.5 rounded-xl font-bold uppercase transition-colors"
              >
                {editingRoom ? "Saqlash" : "Joy Sektorini Qo'shish"}
              </button>

            </form>
          </div>

          {/* List display (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-5 rounded-2xl border shadow-sm border-zinc-150 space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-zinc-800 dark:text-zinc-100 border-b pb-1.5 flex justify-between">
              <span>Hozirgi Joylar Ro'yxati ({rooms.length})</span>
            </h3>

            <div className="divide-y divide-zinc-100 max-h-120 overflow-y-auto pr-1 space-y-2">
              {rooms.map(room => (
                <div key={room.id} className="flex items-center justify-between py-2.5 text-xs text-zinc-850">
                  <div className="flex items-center space-x-3 pr-2">
                    <img
                      src={(room.images && room.images[0]) || room.image}
                      alt={room.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80'; }}
                      className="w-10 h-10 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800"
                    />
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white leading-tight">{room.name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        <span className="bg-amber-50 text-amber-800 px-1 py-0.5 rounded mr-1 capitalize">{room.type}</span>
                        <span>Maks {room.capacity} kishi • </span>
                        <strong>{room.priceBooking > 0 ? `${room.priceBooking.toLocaleString()} so'm` : 'Bepul'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateRoom(room.id, { available: !room.available })}
                      className={`flex items-center space-x-1 px-2 py-1 rounded border font-bold ${
                        room.available
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                      }`}
                    >
                      {room.available ? "Faol" : "Yopiq"}
                    </button>

                    <button
                      onClick={() => startEditRoom(room)}
                      className="p-1.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-amber-50 text-zinc-400 hover:text-amber-600 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-amber-300"
                      title="Tahrirlash"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-1.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-rose-50 text-zinc-400 hover:text-red-650 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-red-300"
                      title="O'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* Tab Contents: 5. ADMIN EMAILS CONFIGURATION (DYNAMICAL GROUNDWORK) */}
      {adminTab === 'emails' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-xs text-zinc-900 dark:text-white">
          
          {/* Left Column containing Forms (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Add email card */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm border-zinc-150 space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-zinc-850 border-b pb-1.5 flex items-center">
                <Plus className="h-4 w-4 mr-1 text-amber-500" />
                Yangi Admin Qo'shish
              </h3>
              
              <p className="text-zinc-500 leading-normal text-[11px]">
                Tizimga kirishi mumkin bo'lgan yordamchi administratorlar yoki filial menejerlarining email manzillarini kiriting.
              </p>

              <form onSubmit={handleAddEmail} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Email Manzili:</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      placeholder="Masalan: manager@jasmin.uz"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 rounded-xl text-xs text-zinc-900 dark:text-white font-medium placeholder-zinc-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-zinc-900 hover:bg-amber-500 text-white hover:text-black py-2.5 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Menejer Qo'shish</span>
                </button>
              </form>

              <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-1.5">
                <span className="font-bold text-amber-850 uppercase text-[9px] tracking-wider block">Xavfsizlik yo'riqnomasi:</span>
                <p className="text-[10px] text-amber-900/80 leading-relaxed">
                  Yangi admin qo'shilgach, u o'zining emailini kiritib tizimning barcha boshqaruv funksiyalariga (taomlar, buyurtmalar, xonalar) ruxsatga ega bo'ladi. Hech qachon shubhali yoki begona shaxslar emailini qo'shmang!
                </p>
              </div>
            </div>

            {/* Custom Admin Security PIN Sifr Settings card */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm border-zinc-150 space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-zinc-850 border-b pb-1.5 flex items-center">
                <Shield className="h-4 w-4 mr-1 text-red-500" />
                Xavfsizlik PIN Sifri
              </h3>
              
              <p className="text-zinc-500 leading-normal text-[11px]">
                Email yozganda begona shaxslar sizning profilingizga kirib ketmasligi uchun maxfiy kirish PIN-kodini (Kalit parol) o'rnating. Kundalik kirishda ushbu parol so'raladi.
              </p>

              <form onSubmit={handleUpdatePin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Xavfsizlik PIN-Kodi / Parol:</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="PIN parol (Masalan: 7777)"
                      value={adminPinCode}
                      onChange={(e) => setAdminPinCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 rounded-xl font-mono text-xs text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400 mt-1 block">Boshlang'ich default parol: <strong className="font-mono">7777</strong></span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-zinc-900 hover:bg-red-550 text-white hover:text-white py-2.5 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  style={{ backgroundColor: '#18181b' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#18181b'}
                >
                  <span>PAROLNI YANGILASH</span>
                </button>
              </form>
            </div>

          </div>

          {/* List display (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm border-zinc-150 space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-zinc-800 dark:text-zinc-100 border-b pb-1.5 flex justify-between">
              <span>Ruxsat etilgan ma'murlar ({emails.length})</span>
            </h3>

            {isEmailsLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-zinc-500 font-medium">Ma'lumotlar yuklanmoqda...</span>
              </div>
            ) : (
              <div className="divide-y divide-zinc-150 max-h-120 overflow-y-auto space-y-2">
                {emails.map((emailItem) => {
                  const isMainAdmin = emailItem.toLowerCase().trim() === 'asadbekmurodilov7@gmail.com';
                  return (
                    <div key={emailItem} className="flex items-center justify-between py-3 text-xs text-zinc-850">
                      <div className="flex items-center space-x-3 pr-2">
                        <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-white">{emailItem}</div>
                          <p className="text-[9px] text-zinc-500 mt-0.5 flex items-center gap-1">
                            {isMainAdmin ? (
                              <span className="bg-rose-50 text-rose-800 border border-rose-250/50 px-1.5 py-0.5 rounded font-black uppercase text-[8px]">
                                Tizim Asoschisi (O'chirib bo'lmaydi)
                              </span>
                            ) : (
                              <span className="bg-zinc-150 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase text-[8px]">
                                Administrator
                              </span>
                            )}
                            <span className="bg-emerald-50 text-emerald-850 px-1 rounded font-medium text-[8px]">Faol status</span>
                          </p>
                        </div>
                      </div>

                      {!isMainAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteEmail(emailItem)}
                          className="p-2 bg-zinc-50 dark:bg-zinc-950 hover:bg-rose-50 text-zinc-400 hover:text-red-650 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-red-300 transition-colors shrink-0 cursor-pointer"
                          title="Ruxsatni bekor qilish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab Contents: 6. PAYMENT CHANNELS & SYSTEMS (CLICK / PAYME) SETTINGS */}
      {adminTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-xs text-zinc-900 dark:text-white">
          
          {/* Left Column containing P2P & Instructions Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-2xl border shadow-sm border-zinc-150 space-y-6">
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-zinc-855 text-zinc-800 dark:text-zinc-100 border-b pb-1.5 flex items-center gap-1.5">
                <CreditCard className="h-5 w-5 text-red-500" />
                Karta va To'lov Qabul Qilish Sozlamalari (P2P va O'tkazmalar)
              </h3>
              <p className="text-zinc-500 mt-2 leading-relaxed text-[11px]">
                Mijozlar buyurtma yakunida CLICK yoki Payme usulini tanlaganlarida ularga ko'rsatiladigan bank kartasi va maxsus yo'riqnomalarni boshqaring. To'langan pullar to'g'ridan-to'g'ri ushbu kartaga tushadi.
              </p>
            </div>

            <form onSubmit={handleSavePaymentConfig} className="space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Qabul qiluvchi Karta Raqami:</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="8600 0000 0000 0000 (Uzcard / Humo)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 rounded-xl text-xs text-zinc-900 dark:text-white font-mono font-bold placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Karta Egasi Ism-Sharifi:</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Users className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Masalan: Murodilov Asadbek yoki JASMIN BALIQ LLC"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 rounded-xl text-xs text-zinc-900 dark:text-white font-bold placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Mijozlar uchun ko'rsatiladigan to'lov yo'riqnomasi:</label>
                <textarea
                  required
                  placeholder="Mijoz to'lov qilgandan keyin nima qilishi kerakligini yozing..."
                  value={instructionText}
                  onChange={(e) => setInstructionText(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 rounded-xl text-xs text-zinc-900 dark:text-white font-medium placeholder-zinc-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="pt-4 border-t border-zinc-150">
                <h4 className="font-extrabold text-[11px] text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-zinc-500" />
                  Yuridik Shaxslar uchun Rasmiy API Billing Sozlamalari (Ixtiyoriy)
                </h4>
                <p className="text-[10px] text-zinc-400 leading-normal mb-4">
                  Agar siz CLICK va Payme billing tizimini kompaniya hisob raqamiga to'g'ridan-to'g'ri integratsiya qilmoqchi bo'lsangiz, hamkorlik shartnomasini imzolaganingizdan so'ng berilgan Merchant ID va Servis kodlarini shu yerda kiriting.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-500 uppercase mb-1">CLICK Service ID (Xizmat kodi):</label>
                    <input
                      type="text"
                      placeholder="Masalan: 11584"
                      value={clickServiceId}
                      onChange={(e) => setClickServiceId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 rounded-xl text-xs text-zinc-800 dark:text-zinc-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-500 uppercase mb-1">Payme Merchant ID (Kassa ID):</label>
                    <input
                      type="text"
                      placeholder="Masalan: 64ef81b5ac302"
                      value={paymeMerchantId}
                      onChange={(e) => setPaymeMerchantId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 rounded-xl text-xs text-zinc-800 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-rose-600 text-white hover:text-white py-3 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                style={{ backgroundColor: '#18181b' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#18181b'}
              >
                <span>SOZLAMALARNI SAQLASH</span>
              </button>

            </form>
          </div>

          {/* Right Column with visual explanation & simulation diagram (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-zinc-900 text-white p-6 rounded-2xl border border-zinc-805 border-zinc-800 space-y-4 shadow-xl">
              <span className="bg-red-600 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                TO'LOV QABUL QILISH TUSHUNCHASI
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-red-500" />
                Mijoz To'lagan Mablag' Qayoqqa Boradi?
              </h3>

              <div className="space-y-3.5 text-zinc-300 leading-relaxed text-[11px]">
                <p>
                  Siz tanlagan sozlamaga qarab, to'lovlar ikki xil ko'rinishda amalga oshiriladi:
                </p>

                <div className="space-y-3">
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                    <strong className="text-white text-xs font-bold block flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      1. Karta orqali (Oddiy va Tez o'tkazma - P2P):
                    </strong>
                    <span className="text-[10px] text-zinc-400 block">
                      Siz xususiy shaxs sifatida karta raqamingizni kiritasiz. Mijoz buyurtmani CLICK/Payme tanlab berganida, unga sizning karta raqamingiz va nima qilish kerakligi ko'rsatiladi. Mijoz to'lovni o'zining CLICK yoki Payme ilovasidan sizning kartaga o'tkazadi. Pul to'g'ridan-to'g'ri sizning shaxsiy kartangizga tushadi!
                    </span>
                  </div>

                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                    <strong className="text-white text-xs font-bold block flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                      2. Rasmiy billing tizimi (Yuridik shaxs billing):
                    </strong>
                    <span className="text-[10px] text-zinc-400 block">
                      Agar siz yuridik shaxs (MCHJ) bo'lsangiz va Click/Payme bilan to'g'ridan-to'g'ri shartnoma qilgan bo'lsangiz, Merchant kassa xizmatlari tushadi. Mijoz CLICK/Payme tugmasini bosganida unga to'g'ridan-to'g'ri hisob (billing invoice) yuboriladi va u ilovada tasdiqlashi bilan pul to'g'ridan-to'g'ri sizning bankdagi korporativ hisob raqamingizga tushadi.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl">
                  <span className="font-extrabold text-red-500 block uppercase text-[8px] mb-1">Xavfsizlik eslatmasi:</span>
                  <p className="text-[10px] text-red-200/80 leading-normal">
                    Hech qachon bank kartangizning amal qilish muddati (muddat yili/oyi) yoki telefonga kelgan 5 xonali sms-kodlarni begona shaxslarga yoki tizimdagi formalarga yozmang! To'lovlarni qabul qilish uchun faqat va faqat 16 honali karta raqami yetarli bo'ladi.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TELEGRAM BOT TAB */}
      {adminTab === 'telegram' && (
        <div className="max-w-xl mx-auto animate-fade-in space-y-6">

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 shadow-sm p-6 space-y-5 text-zinc-900 dark:text-white text-xs">
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100">Telegram Bot Xabarnomasi</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Yangi buyurtma va band qilishlar haqida darhol xabar oling</p>
              </div>
            </div>

            {/* Setup instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2 text-[11px] text-blue-800">
              <p className="font-bold text-blue-700">Bot qanday sozlanadi?</p>
              <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                <li>Telegramda <strong>@BotFather</strong> ga yozing va <code className="bg-blue-100 px-1 rounded">/newbot</code> buyrug'ini yuboring</li>
                <li>Bot nomini kiriting, keyin <strong>Bot Token</strong> ni nusxalab oling</li>
                <li>Botga yoki kanalingizga <code className="bg-blue-100 px-1 rounded">/start</code> yuboring</li>
                <li><strong>Chat ID</strong> olish uchun: <code className="bg-blue-100 px-1 rounded">@userinfobot</code> ga /start yuboring yoki <code className="bg-blue-100 px-1 rounded">@getmyid_bot</code></li>
                <li>Quyidagi maydonlarni to'ldiring va "Saqlash" bosing</li>
              </ol>
            </div>

            <form onSubmit={handleSaveTelegram} className="space-y-4">
              {/* Enable toggle */}
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-100">Telegram xabarnomasini yoqish</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Faol bo'lganda buyurtmalar haqida bot xabar yuboradi</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTgEnabled(p => !p)}
                  className="cursor-pointer transition-colors"
                >
                  {tgEnabled
                    ? <ToggleRight className="h-8 w-8 text-blue-600" />
                    : <ToggleLeft className="h-8 w-8 text-zinc-400" />}
                </button>
              </div>

              {/* Bot Token */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Bot Token:</label>
                <div className="relative">
                  <input
                    type={tgShowToken ? 'text' : 'password'}
                    placeholder={tgTokenMasked || "1234567890:AAF..."}
                    value={tgBotToken}
                    onChange={e => setTgBotToken(e.target.value)}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 pr-10 font-mono text-xs focus:outline-none focus:border-blue-400 bg-white dark:bg-zinc-900"
                  />
                  <button type="button" onClick={() => setTgShowToken(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-400 cursor-pointer">
                    {tgShowToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {tgTokenMasked && (
                  <p className="text-[10px] text-zinc-400 mt-1">Hozirgi token: <span className="font-mono">{tgTokenMasked}</span> — yangilash uchun yangi token kiriting</p>
                )}
              </div>

              {/* Chat ID */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Chat ID:</label>
                <input
                  type="text"
                  placeholder="-1001234567890 yoki 123456789"
                  value={tgChatId}
                  onChange={e => setTgChatId(e.target.value)}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 font-mono text-xs focus:outline-none focus:border-blue-400 bg-white dark:bg-zinc-900"
                />
              </div>

              {/* Notification toggles */}
              <div className="space-y-2">
                <p className="font-bold text-zinc-700 dark:text-zinc-300 uppercase">Qaysi hodisalar uchun xabar:</p>
                {[
                  { label: 'Yangi buyurtma', val: tgNotifyOrder, set: setTgNotifyOrder, icon: <ShoppingBag className="h-3.5 w-3.5" /> },
                  { label: 'Yangi band qilish (xona/tapchan)', val: tgNotifyBooking, set: setTgNotifyBooking, icon: <Calendar className="h-3.5 w-3.5" /> },
                  { label: 'Buyurtma holati o\'zgarganda', val: tgNotifyStatus, set: setTgNotifyStatus, icon: <Bell className="h-3.5 w-3.5" /> },
                ].map(({ label, val, set, icon }) => (
                  <div key={label} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium">{icon}{label}</span>
                    <button type="button" onClick={() => set((p: boolean) => !p)} className="cursor-pointer">
                      {val
                        ? <Bell className="h-4 w-4 text-blue-500" />
                        : <BellOff className="h-4 w-4 text-zinc-400" />}
                    </button>
                  </div>
                ))}
              </div>

              {tgMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  tgMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {tgMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {tgMsg.text}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={tgTesting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 font-bold border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  {tgTesting ? 'Yuborilmoqda...' : 'Test xabar yuborish'}
                </button>
                <button
                  type="submit"
                  disabled={tgSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  {tgSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>

          {/* SMS Settings */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100">SMS Xabarnomasi (Eskiz.uz)</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Mijozga buyurtma holati haqida avtomatik SMS</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1.5 text-[11px] text-emerald-800">
              <p className="font-bold">Eskiz.uz API token qanday olinadi?</p>
              <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                <li><strong>notify.eskiz.uz</strong> saytiga kiring va ro'yxatdan o'ting</li>
                <li>Dashboard → <strong>Profile</strong> → <strong>API Token</strong> bo'limidan tokenni nusxalang</li>
                <li>Sender ID uchun Eskiz dashboard da "Senders" bo'limiga murojaat qiling</li>
              </ol>
            </div>

            <form onSubmit={handleSaveSms} className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
                <div>
                  <p className="font-bold text-zinc-800 dark:text-zinc-100">SMS xabarnomasini yoqish</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Faol bo'lganda mijozlarga avtomatik SMS ketadi</p>
                </div>
                <button type="button" onClick={() => setSmsEnabled(p => !p)} className="cursor-pointer transition-colors">
                  {smsEnabled ? <ToggleRight className="h-8 w-8 text-emerald-600" /> : <ToggleLeft className="h-8 w-8 text-zinc-400" />}
                </button>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1 text-[11px]">Eskiz API Token:</label>
                <input
                  type="password"
                  placeholder={smsTokenMasked || "Eskiz Bearer tokenini kiriting"}
                  value={smsToken}
                  onChange={e => setSmsToken(e.target.value)}
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2.5 font-mono text-xs focus:outline-none focus:border-emerald-400 bg-white dark:bg-zinc-900"
                />
                {smsTokenMasked && <p className="text-[10px] text-zinc-400 mt-1">Hozirgi token: <span className="font-mono">{smsTokenMasked}</span></p>}
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1 text-[11px]">Sender ID (jo'natuvchi nomi):</label>
                <input
                  type="text"
                  maxLength={11}
                  placeholder="Jasmin"
                  value={smsSenderId}
                  onChange={e => setSmsSenderId(e.target.value)}
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-400 bg-white dark:bg-zinc-900"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Eskiz dashboard da tasdiqlangan sender nomi (maks 11 belgi)</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-zinc-700 dark:text-zinc-300 uppercase text-[11px]">Qaysi hodisalar uchun SMS:</p>
                {[
                  { label: 'Yangi buyurtma tasdiqlandi', val: smsNotifyOrder, set: setSmsNotifyOrder },
                  { label: 'Buyurtma holati o\'zgarganda', val: smsNotifyStatus, set: setSmsNotifyStatus },
                ].map(({ label, val, set }) => (
                  <div key={label} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium text-xs">{label}</span>
                    <button type="button" onClick={() => set((p: boolean) => !p)} className="cursor-pointer">
                      {val ? <Bell className="h-4 w-4 text-emerald-500" /> : <BellOff className="h-4 w-4 text-zinc-400" />}
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1 text-[11px]">Test SMS uchun telefon:</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={smsTestPhone}
                    onChange={e => setSmsTestPhone(e.target.value)}
                    className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-400 bg-white dark:bg-zinc-900"
                  />
                  <button type="button" onClick={handleTestSms} disabled={smsTesting}
                    className="px-4 py-2.5 font-bold border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 text-xs whitespace-nowrap">
                    <Phone className="h-3.5 w-3.5" />
                    {smsTesting ? 'Yuborilmoqda...' : 'Test SMS'}
                  </button>
                </div>
              </div>

              {smsMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  smsMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {smsMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {smsMsg.text}
                </div>
              )}

              <button type="submit" disabled={smsSaving}
                className="w-full flex items-center justify-center gap-2 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all disabled:opacity-50 cursor-pointer">
                <Check className="h-4 w-4" />
                {smsSaving ? 'Saqlanmoqda...' : 'SMS Sozlamalarini Saqlash'}
              </button>
            </form>
          </div>

          {/* Example message preview */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 shadow-sm p-5 text-xs text-zinc-900 dark:text-white space-y-3">
            <h4 className="font-extrabold text-zinc-800 dark:text-zinc-100 uppercase text-[11px] tracking-wider">Namuna xabar ko'rinishi:</h4>
            <div className="bg-[#effdde] rounded-xl p-3.5 font-sans text-[12px] leading-relaxed text-zinc-800 dark:text-zinc-100 border border-[#b0e88a] shadow-inner">
              <p>🐟 <strong>YANGI BUYURTMA!</strong> #o_K3F9A</p>
              <p className="mt-1">👤 Mijoz: <strong>Jasur Toshmatov</strong></p>
              <p>📞 Tel: +998 90 123 45 67</p>
              <p>🚗 Yetkazish: Farg'ona, Mustaqillik ko'chasi 12</p>
              <p>💳 To'lov: <strong>CLICK</strong></p>
              <p className="mt-1">📋 Taomlar:</p>
              <p>&nbsp;&nbsp;• Kamalak Foreli (Grill) × 2</p>
              <p>&nbsp;&nbsp;• Limonli Ko'k Choy × 3</p>
              <p className="mt-1">💰 Jami: <strong>358 000 so'm</strong></p>
            </div>
          </div>

        </div>
      )}

      {/* CUSTOM SAFE MODAL FOR DELETIONS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs select-none animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-zinc-250 transform transition-all duration-200 animate-scale-up text-zinc-900 dark:text-white">
            <h4 className="text-sm font-black uppercase tracking-wider text-red-650 flex items-center gap-1.5 mb-2.5">
              <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
              Ob'ektni o'chirishni tasdiqlang
            </h4>
            <p className="text-xs text-zinc-650 font-medium mb-6 leading-relaxed">
              Haqiqatan ham <strong className="text-zinc-900 dark:text-white font-extrabold">"{deleteTarget.name}"</strong> nomli {deleteTarget.type === 'item' ? 'taomni' : 'joy sozlamasini'} butunlay o'chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex items-center justify-end gap-3.5 text-xs">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Yo'q, bekor qilish
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { id, type } = deleteTarget;
                  setDeleteTarget(null);
                  try {
                    if (type === 'item') {
                      await onDeleteMenuItem(id);
                      showNotification("Mahsulot muvaffaqiyatli o'chirildi.");
                    } else {
                      await onDeleteRoom(id);
                      showNotification("Joy sozlamasi muvaffaqiyatli o'chirildi.");
                    }
                  } catch (err: any) {
                    showNotification(err.message || "O'chirishda xatolik yuz berdi", 'error');
                  }
                }}
                className="px-4 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Ha, o'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
