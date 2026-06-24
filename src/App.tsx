import React, { useState, useEffect } from 'react';
import { MenuItem, Room, Order, RoomBooking, OrderItem, PaymentSettings } from './types';
import { adminFetch, setAdminToken, clearAdminToken, getAdminToken } from './lib/adminFetch';
import Navbar from './components/Navbar';
import MenuSection from './components/MenuSection';
import BookingSection from './components/BookingSection';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { Fish, Shield, ArrowRight, Eye, Phone, MapPin, Instagram, CheckCircle, Clock, Key, Search } from 'lucide-react';
import { useT } from './i18n';

export default function App() {
  const t = useT();
  // Navigation & roles
  const [currentTab, setCurrentTab] = useState<'menu' | 'booking' | 'orders' | 'admin'>('menu');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Loaded database items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  // Cart State (Client side)
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Local Order IDs to track client's own orders (stored in client localStorage)
  const [myOrderIds, setMyOrderIds] = useState<string[]>([]);
  // Local Booking IDs to track client's own room bookings
  const [myBookingIds, setMyBookingIds] = useState<string[]>([]);

  // Fetch all payment settings
  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch('/api/payment-settings');
      if (res.ok) {
        const data = await res.json();
        setPaymentSettings(data);
      }
    } catch (e) {
      console.warn("To'lov sozlamalarini yuklab bo'lmadi:", e);
    }
  };

  // Fetch all database states from Express REST backend
  const fetchAllData = async () => {
    try {
      const [menuRes, roomsRes, ordersRes, bookingsRes] = await Promise.all([
        fetch('/api/menu').then(r => { if (!r.ok) throw new Error(); return r.json(); }),
        fetch('/api/rooms').then(r => { if (!r.ok) throw new Error(); return r.json(); }),
        fetch('/api/orders').then(r => { if (!r.ok) throw new Error(); return r.json(); }),
        fetch('/api/bookings').then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      ]);

      setMenuItems(menuRes);
      setRooms(roomsRes);
      setOrders(ordersRes);
      setBookings(bookingsRes);
    } catch (err) {
      console.error("Xatolik: Ma'lumotlarni serverdan yuklab bo'lmadi.", err);
    }
  };

  // On mount: fetch all data, payment settings and recover localStorage IDs
  useEffect(() => {
    fetchAllData();
    fetchPaymentSettings();

    // Recovers ordered IDs from localStorage
    try {
      const savedOrders = localStorage.getItem('jasmin_my_orders');
      if (savedOrders) setMyOrderIds(JSON.parse(savedOrders));

      const savedBookings = localStorage.getItem('jasmin_my_bookings');
      if (savedBookings) setMyBookingIds(JSON.parse(savedBookings));

      const savedAdminEmail = localStorage.getItem('jasmin_admin_email');
      const savedToken = getAdminToken();
      if (savedAdminEmail && savedToken) {
        const cleanSavedEmail = savedAdminEmail.trim().toLowerCase();
        setAdminEmail(cleanSavedEmail);
        setIsAdmin(true);
        setCurrentTab('admin');
      }
    } catch (e) {
      console.warn("localStorage recovered error:", e);
    }

    // Real-time updates via Server-Sent Events
    const sse = new EventSource('/api/events');
    sse.addEventListener('menu', () => fetchAllData());
    sse.addEventListener('rooms', () => fetchAllData());
    sse.addEventListener('orders', () => fetchAllData());
    sse.addEventListener('bookings', () => fetchAllData());
    sse.onerror = () => {
      // SSE reconnects automatically; no action needed
    };
    return () => sse.close();
  }, []);

  // Sync state to local storage when IDs change
  useEffect(() => {
    try {
      localStorage.setItem('jasmin_my_orders', JSON.stringify(myOrderIds));
    } catch (e) {}
  }, [myOrderIds]);

  useEffect(() => {
    try {
      localStorage.setItem('jasmin_my_bookings', JSON.stringify(myBookingIds));
    } catch (e) {}
  }, [myBookingIds]);

  // Cart Handlers
  const handleAddToCart = (item: MenuItem, selectedSize?: string, selectedPrice?: number) => {
    const finalSize = selectedSize || item.size;
    const finalPrice = selectedPrice !== undefined ? selectedPrice : item.price;
    const cartItemId = selectedSize ? `${item.id}-${selectedSize}` : item.id;
    const displayName = selectedSize ? `${item.name} (${selectedSize})` : item.name;

    setCart(prev => {
      const existing = prev.find(x => x.menuItemId === cartItemId);
      if (existing) {
        return prev.map(x => x.menuItemId === cartItemId ? { ...x, quantity: x.quantity + 1 } : x);
      }
      return [...prev, { menuItemId: cartItemId, name: displayName, quantity: 1, price: finalPrice, selectedSize: finalSize }];
    });
  };

  const handleUpdateCartQty = (menuItemId: string, change: number) => {
    setCart(prev => {
      return prev.map(x => {
        if (x.menuItemId === menuItemId) {
          const newQty = x.quantity + change;
          return newQty > 0 ? { ...x, quantity: newQty } : null;
        }
        return x;
      }).filter((x): x is OrderItem => x !== null);
    });
  };

  const handleClearCart = () => setCart([]);

  // API Callbacks (Client triggers)
  const handleCreateOrder = async (orderData: {
    customerName: string;
    phone: string;
    deliveryType: 'delivery' | 'pickup';
    deliveryAddress: string;
    deliveryDistanceKm: number;
    deliveryFee: number;
    paymentMethod: 'naqd' | 'click' | 'payme';
    notes: string;
  }) => {
    const subtotal = cart.reduce((s, item) => s + (item.price * item.quantity), 0);
    const serviceFee = Math.round(subtotal * 0.10);
    const totalAmount = subtotal + serviceFee + orderData.deliveryFee;

    const payload = {
      ...orderData,
      items: cart,
      totalAmount
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Buyurtma berish muvaffaqiyatsiz bo'ldi.");
    }

    const orderObj: Order = await res.json();
    
    // Add to personal local list
    setMyOrderIds(prev => [orderObj.id, ...prev]);
    
    // refresh internal state
    fetchAllData();
    
    return orderObj;
  };

  const handleBookRoom = async (bookingData: {
    roomId: string;
    roomName: string;
    customerName: string;
    phone: string;
    date: string;
    timeSlot: string;
    guestCount: number;
  }) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    if (res.status === 409) {
      throw new Error("Kechirasiz, ushbu xona ko'rsatilgan vaqtda allaqachon band qilingan!");
    }
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Band qilish muvaffaqiyatsiz bo'ldi.");
    }

    const bookingObj: RoomBooking = await res.json();
    setMyBookingIds(prev => [bookingObj.id, ...prev]);
    fetchAllData();
    return bookingObj;
  };

  const handleUpdatePaymentSettings = async (updates: PaymentSettings) => {
    const res = await adminFetch('/api/payment-settings', {
      method: 'POST',
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "To'lov sozlamalarini saqlab bo'lmadi.");
    }
    const data = await res.json();
    setPaymentSettings(data.paymentSettings);
    return data.paymentSettings;
  };

  // API Admin controllers
  const handleAddMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    const res = await adminFetch('/api/menu', {
      method: 'POST',
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error("Mahsulot qo'shib bo'lmadi");
    fetchAllData();
  };

  const handleUpdateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    const res = await adminFetch(`/api/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("Mahsulotni yangilab bo'lmadi");
    fetchAllData();
  };

  const handleDeleteMenuItem = async (id: string) => {
    const res = await adminFetch(`/api/menu/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Mahsulotni o'chirib bo'lmadi");
    fetchAllData();
  };

  const handleAddRoom = async (room: Omit<Room, 'id'>) => {
    const res = await adminFetch('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(room)
    });
    if (!res.ok) throw new Error("Xona qo'shib bo'lmadi");
    fetchAllData();
  };

  const handleUpdateRoom = async (id: string, updates: Partial<Room>) => {
    const res = await adminFetch(`/api/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("Xonani yangilab bo'lmadi");
    fetchAllData();
  };

  const handleDeleteRoom = async (id: string) => {
    const res = await adminFetch(`/api/rooms/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Xonani o'chirib bo'lmadi");
    fetchAllData();
  };

  const handleUpdateOrderStatus = async (id: string, status: Order['status']) => {
    const res = await adminFetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error("Buyurtma holatini yangilab bo'lmadi");
    fetchAllData();
  };

  const handleUpdateBookingStatus = async (id: string, status: RoomBooking['status']) => {
    const res = await adminFetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error("Bandlik holatini yangilab bo'lmadi");
    fetchAllData();
  };

  // Get Client Filtered Tracking Orders & Bookings
  const clientOrders = orders.filter(o => myOrderIds.includes(o.id));
  const clientBookings = bookings.filter(b => myBookingIds.includes(b.id));

  // Phone-based order lookup
  const [phoneSearch, setPhoneSearch] = useState('');
  const [phoneOrders, setPhoneOrders] = useState<Order[]>([]);
  const [phoneBookings, setPhoneBookings] = useState<RoomBooking[]>([]);
  const [phoneSearchLoading, setPhoneSearchLoading] = useState(false);
  const [phoneSearchDone, setPhoneSearchDone] = useState(false);

  const handlePhoneSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = phoneSearch.replace(/\D/g, '');
    if (phone.length < 7) return;
    setPhoneSearchLoading(true);
    setPhoneSearchDone(false);
    try {
      const [oRes, bRes] = await Promise.all([
        fetch(`/api/orders/by-phone/${phone}`),
        fetch(`/api/bookings/by-phone/${phone}`),
      ]);
      setPhoneOrders(oRes.ok ? await oRes.json() : []);
      setPhoneBookings(bRes.ok ? await bRes.json() : []);
    } catch { setPhoneOrders([]); setPhoneBookings([]); }
    finally { setPhoneSearchLoading(false); setPhoneSearchDone(true); }
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString('uz-UZ') + " " + t('common.price');
  };

  return (
    <div className="min-h-screen bg-stone-100 text-zinc-900 dark:bg-zinc-950 dark:text-stone-100 flex flex-col justify-between transition-colors">


      {/* Main Responsive Header */}
      <Navbar
        currentTab={currentTab}
        onChangeTab={(tab) => {
          if (tab === 'admin') {
            if (isAdmin) {
              setCurrentTab('admin');
            } else {
              setShowAdminLogin(true);
            }
          } else {
            setCurrentTab(tab);
          }
        }}
        isAdmin={isAdmin}
        onToggleAdmin={() => {
          if (isAdmin) {
            // Sign out from admin mode immediately
            setIsAdmin(false);
            setAdminEmail(null);
            clearAdminToken();
            localStorage.removeItem('jasmin_admin_email');
            setCurrentTab('menu');
          } else {
            setShowAdminLogin(true);
          }
        }}
        cartCount={cart.reduce((s, x) => s + x.quantity, 0)}
        activeOrderCount={clientOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}
      />

      {/* Content Router */}
      <main className="flex-1">
        
        {/* TAB 1: MENU AND CART CHECKOUT */}
        {currentTab === 'menu' && (
          <MenuSection
            menuItems={menuItems}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onClearCart={handleClearCart}
            onSubmitOrder={handleCreateOrder}
            paymentSettings={paymentSettings || undefined}
          />
        )}

        {/* TAB 2: ROOM RESERVATIONS */}
        {currentTab === 'booking' && (
          <BookingSection
            rooms={rooms}
            bookings={bookings}
            onBookRoom={handleBookRoom}
          />
        )}

        {/* TAB 3: PERSONAL HISTORY TRACKER */}
        {currentTab === 'orders' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-xs md:text-sm">
            
            <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
              <span className="text-red-400 bg-red-950/50 border border-red-800 uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {t('ot.tag')}
              </span>
              <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white">{t('ot.heading')}</h3>
              <p className="text-zinc-400 text-xs">
                {t('ot.intro')}
              </p>
            </div>

            {/* Phone search */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-500" />
                Telefon raqam bilan qidirish
              </h4>
              <p className="text-[11px] text-zinc-500 -mt-2">Boshqa qurilmadan yoki yangi brauzerdan buyurtmangizni toping</p>
              <form onSubmit={handlePhoneSearch} className="flex gap-2">
                <input
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phoneSearch}
                  onChange={e => { setPhoneSearch(e.target.value); setPhoneSearchDone(false); }}
                  className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-400"
                />
                <button type="submit" disabled={phoneSearchLoading}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 whitespace-nowrap">
                  {phoneSearchLoading ? 'Qidirilmoqda...' : 'Qidirish'}
                </button>
              </form>
              {phoneSearchDone && (
                <div className="space-y-2">
                  {phoneOrders.length === 0 && phoneBookings.length === 0 ? (
                    <p className="text-center text-zinc-500 text-xs py-2">Bu raqam bilan buyurtma yoki bron topilmadi</p>
                  ) : (
                    <div className="space-y-2">
                      {phoneOrders.map(o => (
                        <div key={o.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                          <div>
                            <span className="font-mono font-bold text-zinc-900 dark:text-white">{o.id}</span>
                            <span className="ml-2 text-zinc-500">{o.customerName}</span>
                            <span className="ml-2 font-bold text-red-500">{formatPrice(o.totalAmount)}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            o.status === 'completed' ? 'bg-emerald-950/80 text-emerald-400' :
                            o.status === 'cancelled' ? 'bg-zinc-800 text-zinc-400' :
                            'bg-red-950/80 text-red-400 animate-pulse'
                          }`}>
                            {o.status === 'pending' ? 'Kutilmoqda' : o.status === 'preparing' ? 'Pishirilmoqda' :
                             o.status === 'delivering' ? "Yo'lda" : o.status === 'completed' ? 'Yetkazildi' : 'Bekor'}
                          </span>
                        </div>
                      ))}
                      {phoneBookings.map(b => (
                        <div key={b.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white">{b.roomName}</span>
                            <span className="ml-2 text-zinc-500">{b.date} {b.timeSlot}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            b.status === 'confirmed' ? 'bg-emerald-950/80 text-emerald-400' :
                            b.status === 'cancelled' ? 'bg-zinc-800 text-zinc-400' :
                            'bg-yellow-950/80 text-yellow-400'
                          }`}>
                            {b.status === 'pending' ? 'Kutilmoqda' : b.status === 'confirmed' ? 'Tasdiqlandi' : 'Bekor'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Part A: Client's active ordered meals list */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="font-extrabold text-base text-zinc-900 dark:text-white border-b border-zinc-805 border-zinc-200 dark:border-zinc-800 pb-1.5 flex items-center justify-between">
                <span className="text-red-500">🐟 {t('ot.foodOrders')}</span>
                <span className="text-xs font-normal text-zinc-500">{t('ot.liveMode')}</span>
              </h4>

              {clientOrders.length === 0 ? (
                <p className="text-center py-6 text-zinc-500 font-sans text-xs">
                  {t('ot.noOrders')}
                </p>
              ) : (
                <div className="space-y-4">
                  {clientOrders.map(order => (
                    <div key={order.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3.5 animate-scale-in" id={`client-order-card-${order.id}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-500 mr-2">{t('ot.id')}</span>
                          <strong className="font-mono text-zinc-900 dark:text-white font-bold">{order.id}</strong>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[11px] font-bold text-zinc-400">{t('ot.statusLabel')}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            order.status === 'pending' ? 'bg-yellow-950/80 text-yellow-550 text-yellow-450 text-yellow-300' :
                            order.status === 'preparing' ? 'bg-red-950/80 text-red-400 animate-pulse border border-red-900/50' :
                            order.status === 'delivering' ? 'bg-blue-950/80 text-blue-400' :
                            order.status === 'completed' ? 'bg-emerald-950/80 text-emerald-400' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {order.status === 'pending' ? t('ot.st.pending') :
                             order.status === 'preparing' ? t('ot.st.preparing') :
                             order.status === 'delivering' ? t('ot.st.delivering') :
                             order.status === 'completed' ? t('ot.st.completed') :
                             t('ot.st.cancelled')}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-bold text-zinc-600 dark:text-zinc-300 mb-1">{t('ot.orderedItems')}</p>
                          <ul className="list-disc pl-4 text-zinc-400 space-y-0.5">
                            {order.items.map((it, i) => (
                              <li key={i}>
                                <strong className="text-zinc-800 dark:text-zinc-200">{it.name}</strong> • {it.quantity} {t('ot.pcs')} ({formatPrice(it.price)})
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <p className="text-zinc-400">
                            <strong>{t('ot.payType')}</strong> <span className="uppercase text-red-400 font-extrabold">{order.paymentMethod}</span>
                          </p>
                          <p className="text-zinc-400">
                            <strong>{t('ot.address')}</strong> <span className="text-zinc-600 dark:text-zinc-300">{order.deliveryAddress}</span>
                          </p>
                          <p className="text-zinc-400 pt-1">
                            <strong>{t('ot.totalSum')}</strong> <strong className="text-red-500 font-black text-sm">{formatPrice(order.totalAmount)}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Part B: Client's active room bookings list */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="font-extrabold text-base text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-1.5 text-red-500">
                🏡 {t('ot.bookingQueue')}
              </h4>

              {clientBookings.length === 0 ? (
                <p className="text-center py-6 text-zinc-500 text-xs">
                  {t('ot.noBookings')}
                </p>
              ) : (
                <div className="space-y-4">
                  {clientBookings.map(book => (
                    <div key={book.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 animate-scale-in" id={`client-booking-row-${book.id}`}>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-extrabold text-sm text-zinc-900 dark:text-white">{book.roomName}</h5>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            book.status === 'pending' ? 'bg-yellow-950/80 text-yellow-305 text-yellow-400' :
                            book.status === 'confirmed' ? 'bg-emerald-950/80 text-emerald-400' :
                            'bg-red-950/80 text-red-400'
                          }`}>
                            {book.status === 'pending' ? t('ot.bk.pending') : book.status === 'confirmed' ? t('ot.bk.confirmed') : t('ot.bk.cancelled')}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs mt-1.5">
                          {t('ot.bDate')} <strong className="text-zinc-800 dark:text-zinc-200">{book.date}</strong> | {t('ot.bTime')} <strong className="text-zinc-800 dark:text-zinc-200">{book.timeSlot}</strong>
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">{t('ot.guestsFor')} {book.guestCount}</p>
                      </div>

                      <div className="text-left md:text-right border-t border-zinc-200 dark:border-zinc-800 md:border-t-0 pt-2 md:pt-0">
                        <span className="text-[11px] text-zinc-500 block">{t('ot.clientContact')}</span>
                        <strong className="text-zinc-800 dark:text-zinc-200 block text-xs">{book.customerName}</strong>
                        <span className="font-mono text-[10px] text-zinc-400">{book.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: INTEGRATED REAL ACTIONS ADMIN PANEL */}
        {currentTab === 'admin' && (
          <AdminPanel
            menuItems={menuItems}
            rooms={rooms}
            orders={orders}
            bookings={bookings}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onAddRoom={handleAddRoom}
            onUpdateRoom={handleUpdateRoom}
            onDeleteRoom={handleDeleteRoom}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            paymentSettings={paymentSettings || undefined}
            onUpdatePaymentSettings={handleUpdatePaymentSettings}
          />
        )}

      </main>

      {/* Modern High-contrast Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white border-t border-red-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* About us */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-red-600 text-white p-2 rounded-full">
                  <Fish className="h-5 w-5" />
                </div>
                <h4 className="font-black text-red-500 text-md tracking-tight uppercase">Jasmin Baliq</h4>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                {t('ft.about')}
              </p>
            </div>

            {/* Quick Contacts */}
            <div className="space-y-3 text-xs text-zinc-400">
              <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">{t('ft.contactTitle')}</h4>
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                {t('ft.address')}
              </p>
              <p className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-red-500" />
                +998 (93) 642-17-71 • +998 (97) 418-48-84
              </p>
              <p className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-red-500" />
                {t('ft.hours')}
              </p>
            </div>

            {/* Insta / Socials */}
            <div className="space-y-3 text-xs text-zinc-400">
              <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">{t('ft.social')}</h4>
              <p className="text-zinc-400 leading-relaxed text-xs">
                {t('ft.socialText')}
              </p>
              <a
                href="https://www.instagram.com/jasmin_baliqxona_uz?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-red-500 hover:bg-red-600 hover:text-white text-red-500 px-4 py-2 rounded-xl font-bold transition-all"
              >
                <Instagram className="h-4 w-4 mr-2" />
                @jasmin_baliqxona_uz
              </a>
            </div>

          </div>

          <div className="border-t border-zinc-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500">
            <p className="flex items-center gap-1.5">
              <span>© 2026 Jasmin Baliqxona. {t('ft.rights')}</span>
              <button 
                onClick={() => setShowAdminLogin(true)} 
                type="button"
                className="opacity-15 hover:opacity-100 text-zinc-600 hover:text-amber-500 transition-all p-1 hover:bg-white dark:hover:bg-zinc-900 rounded-lg cursor-pointer"
                title="Boshqaruv Tizimi"
              >
                <Key className="h-3 w-3" />
              </button>
            </p>
            <p className="mt-2 sm:mt-0 font-mono">{t('ft.location')}</p>
          </div>
        </div>
      </footer>

      {showAdminLogin && (
        <AdminLogin
          onLoginSuccess={(email, token) => {
            setAdminEmail(email);
            setIsAdmin(true);
            setShowAdminLogin(false);
            setCurrentTab('admin');
            localStorage.setItem('jasmin_admin_email', email);
            setAdminToken(token);
          }}
          onCancel={() => {
            setShowAdminLogin(false);
          }}
        />
      )}

    </div>
  );
}
