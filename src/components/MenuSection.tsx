import React, { useState } from 'react';
import { MenuItem, OrderItem, PaymentSettings } from '../types';
import { Search, ShoppingCart, Plus, Minus, Info, AlertTriangle, Check, MapPin, Sparkles, Send, X, Copy, ExternalLink, CreditCard } from 'lucide-react';
import { useT } from '../i18n';
import { useSettings } from '../context/Settings';
import { useTd } from '../dataI18n';

interface MenuSectionProps {
  menuItems: MenuItem[];
  cart: OrderItem[];
  onAddToCart: (item: MenuItem, selectedSize?: string, selectedPrice?: number) => void;
  onUpdateCartQty: (menuItemId: string, change: number) => void;
  onClearCart: () => void;
  onSubmitOrder: (orderData: {
    customerName: string;
    phone: string;
    deliveryType: 'delivery' | 'pickup';
    deliveryAddress: string;
    deliveryDistanceKm: number;
    deliveryFee: number;
    paymentMethod: 'naqd' | 'click' | 'payme';
    notes: string;
  }) => Promise<any>;
  paymentSettings?: PaymentSettings;
}

export default function MenuSection({
  menuItems,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onClearCart,
  onSubmitOrder,
  paymentSettings,
}: MenuSectionProps) {
  const t = useT();
  const { lang } = useSettings();
  const td = useTd();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Checkout Form States
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState(5); // distance slider 1-30km
  const [paymentMethod, setPaymentMethod] = useState<'naqd' | 'click' | 'payme'>('naqd');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCard, setCopiedCard] = useState(false);

  // Categories helper
  const categories = [
    { key: 'all' },
    { key: 'baliq' },
    { key: 'salatlar' },
    { key: 'yonlar' },
    { key: 'non' },
    { key: 'ichimliklar' }
  ] as const;

  // Filters
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // UZS currency formatting helper
  const formatPrice = (val: number) => {
    return val.toLocaleString('uz-UZ') + ' ' + t('common.price');
  };

  // Cart helper calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceFee = Math.round(cartSubtotal * 0.10);
  
  // Delivery Fee structure:
  // Base delivery in Fergana city = 10,000 UZS
  // Plus 2,500 UZS per km
  const deliveryFee = deliveryType === 'delivery' ? (10000 + (deliveryDistanceKm * 2500)) : 0;
  const cartTotal = cartSubtotal + serviceFee + deliveryFee;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ';
    }
    setPhone(val);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (cart.length === 0) {
      setErrorMessage("Savat bo'sh! Iltimos, taom qo'shing.");
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage(t('co.errName'));
      return;
    }
    if (phone.trim().length < 13) {
      setErrorMessage(t('co.errPhone'));
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMessage(t('co.errAddress'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmitOrder({
        customerName,
        phone,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : "Baliqxonadan olib ketish",
        deliveryDistanceKm: deliveryType === 'delivery' ? deliveryDistanceKm : 0,
        deliveryFee,
        paymentMethod,
        notes
      });
      setOrderSuccess(res);
      onClearCart();
      // Reset form
      setCustomerName('');
      setPhone('+998 ');
      setDeliveryAddress('');
      setNotes('');
    } catch (err: any) {
      setErrorMessage(err.message || t('co.errGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Banner / Instagram info header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-950 via-red-950 to-zinc-950 rounded-3xl p-6 md:p-10 mb-10 text-white shadow-2xl border border-red-500/20">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12 scale-125">
          <ShoppingCart className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-yellow-300" /> {t('hero.tag')}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 text-white">
            {t('hero.title')}
          </h2>
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6">
            {t('hero.subtitle')}{' '}
            <a href="https://www.instagram.com/jasmin_baliqxona_uz?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-red-500 font-extrabold ml-1 hover:underline">
              @jasmin_baliqxona_uz
            </a>
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-red-200">
            <div className="flex items-center bg-zinc-900/80 px-3.5 py-1.5 rounded-xl border border-white/5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-ping"></span>
              {t('hero.badge1')}
            </div>
            <div className="flex items-center bg-zinc-900/80 px-3.5 py-1.5 rounded-xl border border-white/5">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
              {t('hero.badge2')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side is Menu, Right Side is Cart/Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Menu Left Section (8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Controls: Search and Categories */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-5 text-zinc-900 dark:text-zinc-100">
            
            {/* Search Input Box with Label */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="menu-search-input" className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                  {t('search.label')}
                </label>
                {searchQuery && (
                  <span className="text-[10px] text-zinc-500">
                    {t('menu.matched')}: {filteredItems.length} {t('cart.count')}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-450">
                  <Search className="h-5 w-5 text-red-500" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full pl-12 pr-10 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-650/40 focus:border-red-600 transition-all font-medium placeholder-zinc-500 text-zinc-900 dark:text-zinc-100"
                  id="menu-search-input"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 h-6 w-6 rounded-full flex items-center justify-center font-bold"
                    title="Tozalash"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Category horizontal scroller */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{t('cat.label')}</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key === selectedCategory && cat.key !== 'all' ? 'all' : cat.key)}
                    className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                      selectedCategory === cat.key
                        ? 'bg-red-600 text-white shadow-sm shadow-red-500/20 ring-1 ring-red-500/50'
                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                    }`}
                    id={`cat-btn-${cat.key}`}
                    type="button"
                  >
                    {t(`cat.${cat.key}` as any)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid display items */}
          {filteredItems.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl py-12 px-4 shadow-xl border border-zinc-200 dark:border-zinc-800 text-center text-zinc-400">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-3" />
              <p className="font-semibold text-lg">{t('menu.notFound')}</p>
              <p className="text-sm mt-1">{t('menu.notFoundHint')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const sizeChosen = selectedSizes[item.id] || (item.isMultipleSizes && item.sizeOptions && item.sizeOptions.length > 0 ? item.sizeOptions[0].size : item.size);
                const priceChosen = (item.isMultipleSizes && item.sizeOptions && item.sizeOptions.length > 0)
                  ? (item.sizeOptions.find(opt => opt.size === sizeChosen)?.price || item.price)
                  : item.price;

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border flex flex-col justify-between ${
                      item.available ? 'border-zinc-800' : 'border-zinc-800 opacity-75'
                    }`}
                    id={`menu-item-card-${item.id}`}
                  >
                    {/* Food Image */}
                    <div className="relative h-44 w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80'; }}
                        className="w-full h-full object-cover font-sans hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-zinc-200/50 dark:border-zinc-850/50">
                        {td(sizeChosen)}
                      </div>
                      
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center">
                          <span className="bg-red-650 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border border-red-400">
                            {t('menu.soldOut')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Food Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors line-clamp-1">
                          {td(item.name)}
                        </h3>
                        <p className="text-zinc-400 text-xs mt-1.5 line-clamp-3 leading-relaxed">
                          {td(item.description)}
                        </p>

                        {/* Multi-size/liter choice controls */}
                        {item.isMultipleSizes && item.sizeOptions && item.sizeOptions.length > 0 && (
                          <div className="mt-3 flex flex-col gap-1.5 bg-zinc-50/50 dark:bg-zinc-950/50 p-2 rounded-xl border border-zinc-200/40 dark:border-zinc-850/40">
                            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wide">{t('menu.sizeLabel')}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.sizeOptions.map((opt) => (
                                <button
                                  key={opt.size}
                                  type="button"
                                  onClick={() => setSelectedSizes(prev => ({ ...prev, [item.id]: opt.size }))}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                                    sizeChosen === opt.size
                                      ? 'bg-red-600 text-zinc-900 dark:text-white border-red-500 shadow-sm shadow-red-500/20'
                                      : 'bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 border-zinc-200/60 dark:border-zinc-800/60 hover:text-zinc-350'
                                  }`}
                                >
                                  {opt.size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                        <div className="text-red-500 font-extrabold text-sm md:text-base">
                          {formatPrice(priceChosen)}
                        </div>

                        {item.available ? (
                          <button
                            onClick={() => onAddToCart(item, sizeChosen, priceChosen)}
                            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                            id={`add-cart-btn-${item.id}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>{t('cart.add')}</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed px-3.5 py-2 rounded-xl text-xs font-bold"
                          >
                            {t('menu.unavailable')}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Side: Cart / Checkout (4 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto max-h-[85vh] text-zinc-900 dark:text-zinc-100">
            
            {/* Header */}
            <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white px-5 py-4.5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-850">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider">{t('cart.title')}</h3>
              </div>
              <span className="bg-red-600 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {cart.reduce((s, x) => s + x.quantity, 0)} {t('cart.count')}
              </span>
            </div>

            {/* Success Booking Message */}
            {orderSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="h-14 w-14 bg-red-950 text-red-400 rounded-full flex items-center justify-center mx-auto shadow-inner border border-red-900/40 animate-bounce">
                  <Check className="h-8 w-8 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-zinc-900 dark:text-white text-lg">Buyurtma Qabul Qilindi!</h4>
                  <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
                    ID: <strong className="text-red-400 font-mono">{orderSuccess.id}</strong>.
                    Buyurtmangiz tizimga muvaffaqiyatli qo'shildi va hozirda oshpazlarimiz tomonidan tayyorlanish jarayoni boshlandi.
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4.5 rounded-xl text-left text-xs space-y-1.5 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span>Mijoz:</span>
                    <strong className="text-zinc-900 dark:text-white">{orderSuccess.customerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Telefon:</span>
                    <strong className="text-zinc-900 dark:text-white">{orderSuccess.phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Turi:</span>
                    <strong className="text-red-400 font-bold">
                      {orderSuccess.deliveryType === 'delivery' ? 'Yetkazib berish' : 'Olib ketish'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>To'lov usuli:</span>
                    <strong className="text-zinc-900 dark:text-zinc-100 uppercase bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">
                      {orderSuccess.paymentMethod}
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800">
                    <span>Jami summa:</span>
                    <strong className="text-red-500 font-bold">{formatPrice(orderSuccess.totalAmount)}</strong>
                  </div>
                </div>

                {/* DYNAMIC Uzbek Payment flow guidelines */}
                {(orderSuccess.paymentMethod === 'click' || orderSuccess.paymentMethod === 'payme') && (
                  <div className="bg-white/70 dark:bg-zinc-900/70 border border-red-950/40 p-4 rounded-xl text-left space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-red-500" />
                        {orderSuccess.paymentMethod === 'click' ? 'CLICK' : 'Payme'} To'lov Yo'riqnomasi
                      </span>
                      <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded-sm font-bold">
                        P2P / O'tkazma
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-normal">
                        Mablag'ni quyidagi tasdiqlangan tashkilot bank kartasiga o'tkazishingiz so'raladi:
                      </p>

                      <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-850 flex items-center justify-between gap-2.5">
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black block">Karta egasi:</span>
                          <strong className="text-xs text-zinc-900 dark:text-white uppercase font-sans tracking-wider block">
                            {paymentSettings?.cardName || "JASMIN BALIQ BARAKASI MCHJ"}
                          </strong>
                          
                          <div className="mt-1">
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">Karta raqami (Nusxa olish):</span>
                            <span className="font-mono text-xs font-bold text-red-400 tracking-wider">
                              {paymentSettings?.cardNumber || "8600 1423 5894 7712"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const num = paymentSettings?.cardNumber || "8600 1423 5894 7712";
                            navigator.clipboard.writeText(num.replace(/\s+/g, ''));
                            setCopiedCard(true);
                            setTimeout(() => setCopiedCard(false), 2000);
                          }}
                          className={`p-2 rounded-xl border transition-colors shrink-0 ${
                            copiedCard 
                              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' 
                              : 'bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-800'
                          }`}
                          title="Nusxalash"
                        >
                          {copiedCard ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      {paymentSettings?.instructionText && (
                        <div className="p-3 bg-zinc-50/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] text-zinc-400 leading-relaxed italic">
                          "{paymentSettings.instructionText}"
                        </div>
                      )}

                      {/* Deep link tugmalar — har doim ko'rinadi */}
                      <div className="pt-2 space-y-2">
                        {orderSuccess.paymentMethod === 'click' && (
                          <a
                            href={`https://my.click.uz`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl border border-blue-500/40 bg-blue-950/30 hover:bg-blue-900/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#00AAFF] flex items-center justify-center shrink-0">
                                <span className="text-white font-black text-[10px] tracking-tight">CL</span>
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-bold text-blue-300">CLICK ilovasini ochish</div>
                                <div className="text-[10px] text-zinc-500">Karta raqamiga o'tkazma qiling</div>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-blue-400 shrink-0" />
                          </a>
                        )}

                        {orderSuccess.paymentMethod === 'payme' && (
                          <a
                            href={`https://payme.uz`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#00CCAA] flex items-center justify-center shrink-0">
                                <span className="text-white font-black text-[10px] tracking-tight">PM</span>
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-bold text-emerald-300">Payme ilovasini ochish</div>
                                <div className="text-[10px] text-zinc-500">Karta raqamiga o'tkazma qiling</div>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-emerald-400 shrink-0" />
                          </a>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                <button
                  onClick={() => setOrderSuccess(null)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all uppercase tracking-wide cursor-pointer"
                >
                  {t('co.orderAgain')}
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 space-y-2">
                <ShoppingCart className="h-10 w-10 mx-auto text-zinc-650 stroke-1" />
                <p className="text-xs font-medium text-zinc-400">{t('cart.empty')}</p>
                <p className="text-[11px] text-zinc-550 text-zinc-500">{t('co.emptyHint')}</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                
                {/* Cart list items */}
                <div className="p-4 max-h-56 overflow-y-auto space-y-3">
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-zinc-900 dark:text-white">{td(item.name)}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{formatPrice(item.price)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2.5 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <button
                          onClick={() => onUpdateCartQty(item.menuItemId, -1)}
                          className="h-5 w-5 bg-zinc-200 dark:bg-zinc-805 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white rounded flex items-center justify-center font-bold"
                          type="button"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-extrabold w-4 text-center text-zinc-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateCartQty(item.menuItemId, 1)}
                          className="h-5 w-5 bg-zinc-200 dark:bg-zinc-805 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white rounded flex items-center justify-center font-bold"
                          type="button"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="w-18 text-right font-extrabold text-red-500 ml-3">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout & Delivery configuration */}
                <form onSubmit={handlePlaceOrder} className="p-4 space-y-4">
                  
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-800 pb-1">
                      {t('co.deliveryTitle')}
                    </h4>
                    
                    {/* Delivery type selectors */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('delivery')}
                        className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                          deliveryType === 'delivery'
                            ? 'bg-red-650 bg-red-600 border-red-600 text-white shadow-sm shadow-red-500/25'
                            : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                        }`}
                        id="delivery-type-delivery"
                      >
                        {t('co.delivery')}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setDeliveryType('pickup')}
                        className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                          deliveryType === 'pickup'
                            ? 'bg-red-650 bg-red-600 border-red-600 text-white shadow-sm shadow-red-500/25'
                            : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                        }`}
                        id="delivery-type-pickup"
                      >
                        {t('co.pickup')}
                      </button>
                    </div>

                    {deliveryType === 'delivery' && (
                      <div className="space-y-2 text-xs bg-red-950/20 p-3 rounded-xl border border-red-900/30 animate-fade-in text-zinc-300">
                        
                        {/* Map Selection Simulation (Distance Slider representing city limits) */}
                        <div className="flex justify-between items-center text-[11px] text-red-200">
                          <span className="flex items-center font-semibold text-red-400">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-red-500 animate-bounce" />
                            {t('co.chooseDistance')}
                          </span>
                          <span className="bg-red-600 text-white font-extrabold rounded px-1.5">{deliveryDistanceKm} km</span>
                        </div>

                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={deliveryDistanceKm}
                          onChange={(e) => setDeliveryDistanceKm(Number(e.target.value))}
                          className="w-full accent-red-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                        />

                        {/* Location explanation */}
                        <div className="text-[10px] text-zinc-400 leading-tight">
                          * <strong>Farg'ona shahri bo'ylab</strong>: bazaviy yetkazish 10,000 so'm (har bir km uchun +2,500 so'm). Masalan: Marg'ilon, Aeroport yoki Kirgili hududlari uchun oson hisob-kitob.
                        </div>

                        {/* Address Textbox */}
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">{t('co.addressLabel')}</label>
                          <input
                            type="text"
                            required={deliveryType === 'delivery'}
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder={t('co.addressPh')}
                            className="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:ring-1 focus:ring-red-500 text-zinc-900 dark:text-white focus:outline-none"
                            id="checkout-delivery-address"
                          />
                        </div>

                      </div>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    <h4 className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wide border-b border-zinc-200 dark:border-zinc-850 pb-1">
                      {t('co.contactTitle')}
                    </h4>

                    {/* Customer Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">{t('co.nameLabel')}</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={t('co.namePh')}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:ring-1 focus:ring-red-500 text-zinc-800 dark:text-zinc-200 font-sans focus:outline-none"
                        id="checkout-customer-name"
                      />
                    </div>

                    {/* Phone input */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">{t('co.phoneLabel')}</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="+998 90 123 45 67"
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:ring-1 focus:ring-red-500 font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none"
                        id="checkout-customer-phone"
                      />
                    </div>

                    {/* Payment choice */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">{t('co.payLabel')}</label>
                      <div className="grid grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('naqd')}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                            paymentMethod === 'naqd'
                              ? 'bg-red-950 border-red-500 text-red-200 font-black'
                              : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                          }`}
                        >
                          {t('co.payCash')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('click')}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                            paymentMethod === 'click'
                              ? 'bg-blue-950 border-blue-500 text-blue-350 font-black'
                              : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                          }`}
                        >
                          CLICK
                        </button>
                         <button
                          type="button"
                          onClick={() => setPaymentMethod('payme')}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                            paymentMethod === 'payme'
                              ? 'bg-teal-950/80 border-teal-500 text-teal-300 font-extrabold'
                              : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                          }`}
                        >
                          Payme
                        </button>
                      </div>
                    </div>

                    {/* Comments */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">{t('co.notesLabel')}</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('co.notesPh')}
                        rows={1.5}
                        className="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-350 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-550"
                      />
                    </div>
                  </div>

                  {/* Pricing Breakdown Summary */}
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl space-y-1.5 text-xs text-zinc-400 border border-zinc-200 dark:border-zinc-800 font-sans">
                    <div className="flex justify-between">
                      <span>{t('co.sumItems')}</span>
                      <strong className="text-zinc-900 dark:text-white">{formatPrice(cartSubtotal)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('co.sumService')}</span>
                      <strong className="text-zinc-900 dark:text-white">{formatPrice(serviceFee)}</strong>
                    </div>
                    {deliveryType === 'delivery' && (
                      <div className="flex justify-between">
                        <span>{t('co.sumDelivery')}</span>
                        <strong className="text-zinc-900 dark:text-white">{formatPrice(deliveryFee)}</strong>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2.5 border-t border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-black">
                      <span>{t('co.sumTotal')}</span>
                      <span className="text-red-500 text-sm md:text-base font-extrabold">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-red-950/40 text-red-400 border border-red-900/45 p-3 rounded-xl text-xs font-semibold flex items-start">
                      <span className="mr-1.5">⚠️</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submission triggers */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-750 text-white py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    id="submit-order-button"
                  >
                    {isSubmitting ? (
                      <span>{t('co.submitting')}</span>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>{t('co.submit')}</span>
                      </>
                    )}
                  </button>

                </form>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
