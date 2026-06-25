import React, { useState } from 'react';
import { Room, RoomBooking } from '../types';
import { Users, Info, Tv, Snowflake, Wind, Coffee, Calendar, Clock, Check, AlertCircle, Sparkles } from 'lucide-react';
import ImageSlider from './ImageSlider';
import { useT } from '../i18n';
import { useTd } from '../dataI18n';

interface BookingSectionProps {
  rooms: Room[];
  bookings: RoomBooking[];
  onBookRoom: (bookingData: {
    roomId: string;
    roomName: string;
    customerName: string;
    phone: string;
    date: string;
    timeSlot: string;
    guestCount: number;
  }) => Promise<any>;
}

export default function BookingSection({
  rooms,
  bookings,
  onBookRoom,
}: BookingSectionProps) {
  
  const t = useT();
  const td = useTd();
  // Selection states
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0] // Default today's date
  );
  const [timeSlot, setTimeSlot] = useState<string>('18:00 - 21:00'); // Standard dinner slot
  const [guestCount, setGuestCount] = useState<number>(4);
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('+998 ');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<RoomBooking | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const timeSlots = [
    '09:00 - 12:00', // Ertabki / Morning
    '12:00 - 15:00', // Tushlik / Lunch
    '15:00 - 18:00', // Peshin / Afternoon
    '18:00 - 21:00', // Shom / Dinner Prime
    '21:00 - 22:00'  // Kechki / Closing
  ];

  const formatPrice = (val: number) => {
    return t('bk.serviceFee');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ';
    }
    setPhone(val);
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setSuccessBooking(null);
    setErrorMessage('');
    // adjust guest count based on capacity if current is higher
    if (guestCount > room.capacity) {
      setGuestCount(room.capacity);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessBooking(null);

    if (!selectedRoom) {
      setErrorMessage("Iltimos, avval bitta xona yoki tapchanni tanlang!");
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage("Ismingizni kiriting.");
      return;
    }
    if (phone.length < 13) {
      setErrorMessage("Telefon raqamingiz to'liq emas. Masalan: +998 90 123 45 67");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onBookRoom({
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        customerName,
        phone,
        date,
        timeSlot,
        guestCount
      });
      setSuccessBooking(res);
      // Clean up inputs on success
      setCustomerName('');
      setPhone('+998 ');
    } catch (err: any) {
      setErrorMessage(err.message || t('bk.errGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper: check if a specific room is already booked for selected date & slot
  const isSlotBooked = (roomId: string, checkDate: string, checkSlot: string) => {
    return bookings.some(b => 
      b.roomId === roomId && 
      b.date === checkDate && 
      b.timeSlot === checkSlot && 
      b.status !== 'cancelled'
    );
  };

  // Helper: map string features to standard icons
  const renderFeatureIcon = (feature: string) => {
    const f = feature.toLowerCase();
    if (f.includes('konditsioner') || f.includes('salqin')) return <Snowflake className="h-3.5 w-3.5 mr-1 text-sky-500" />;
    if (f.includes('televizor') || f.includes('tv')) return <Tv className="h-3.5 w-3.5 mr-1 text-indigo-500" />;
    if (f.includes('suv') || f.includes('anhor') || f.includes('sharshara')) return <Wind className="h-3.5 w-3.5 mr-1 text-teal-500" />;
    return <Coffee className="h-3.5 w-3.5 mr-1 text-amber-600" />;
  };

  // Prevent back-dating
  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Intro info heading */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <span className="text-amber-600 font-extrabold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          {t('bk.tag')}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {t('bk.heading')}
        </h2>
        <p className="text-zinc-500 text-sm md:text-base leading-relaxed">
          {t('bk.intro')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Rooms Browser (7 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white border-b pb-2 flex items-center">
            <Sparkles className="h-5 w-5 mr-1.5 text-amber-500" />
            {t('bk.listTitle')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map(room => {
              const bookedNow = isSlotBooked(room.id, date, timeSlot);
              const isSelected = selectedRoom?.id === room.id;

              return (
                <div
                  key={room.id}
                  onClick={() => room.available && handleSelectRoom(room)}
                  className={`bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border flex flex-col justify-between cursor-pointer ${
                    !room.available 
                      ? 'opacity-60 border-zinc-200 dark:border-zinc-800 pointer-events-none' 
                      : isSelected
                      ? 'ring-2 ring-amber-500 border-transparent bg-amber-50/10'
                      : 'border-zinc-150 hover:border-amber-300'
                  }`}
                  id={`room-card-${room.id}`}
                >
                  <div className="relative h-44 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                    <ImageSlider
                      images={(room.images && room.images.length > 0) ? room.images : [room.image]}
                      alt={room.name}
                      className="w-full h-full object-cover"
                      fallback="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80"
                    />
                    
                    {/* Tags */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {room.type === 'tapchan' ? t('bk.tapchan') : room.type === 'kabinka' ? t('bk.kabinka') : t('bk.zal')}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 bg-zinc-900/85 backdrop-blur-md text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {t('bk.maxGuests')} {room.capacity} {t('bk.persons')}
                    </div>

                    {bookedNow && (
                      <div className="absolute inset-0 bg-red-950/75 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-red-650 bg-red-600 text-white text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-lg border border-red-400 shadow-sm animate-pulse">
                          {t('bk.bookedNow')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3.5">
                    <div>
                      <h4 className="font-extrabold text-sm. sm:text-base text-zinc-900 dark:text-white flex items-center justify-between">
                        <span>{td(room.name)}</span>
                        {isSelected && <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>}
                      </h4>
                      <p className="text-zinc-500 text-xs mt-1.5 line-clamp-2">
                        {td(room.description)}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="flex flex-wrap gap-1.5">
                      {room.features.map((feat, i) => (
                        <span key={i} className="inline-flex items-center text-[10px] bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-md font-medium">
                          {renderFeatureIcon(feat)}
                          {td(feat)}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                        {formatPrice(room.priceBooking)}
                      </span>
                      
                      <button
                        type="button"
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-zinc-950 dark:text-white shadow-sm'
                            : 'bg-zinc-100 hover:bg-zinc-250 text-zinc-700'
                        }`}
                      >
                        {isSelected ? t('bk.selected') : t('bk.select')}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Booking Booking Form Panel (5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
          
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-amber-900/10 overflow-hidden">
            
            <div className="bg-zinc-900 text-white px-5 py-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-amber-400" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">{t('bk.formTitle')}</h3>
            </div>

            {successBooking ? (
              <div className="p-6 text-center space-y-4 animate-fade-in">
                <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="h-8 w-8 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-zinc-950 dark:text-white text-lg">{t('bk.successTitle')}</h4>
                  <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">
                    {t('bk.successDear')} <strong className="text-zinc-800 dark:text-zinc-100">{successBooking.customerName}</strong>,
                    <strong> {successBooking.roomName}</strong> {t('bk.successTail')}
                  </p>
                </div>
                
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl text-left text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span>{t('bk.bookId')}</span>
                    <strong className="text-zinc-900 dark:text-white font-mono text-[11px]">{successBooking.id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('bk.sectorName')}</span>
                    <strong className="text-zinc-900 dark:text-white">{successBooking.roomName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('bk.date')}</span>
                    <strong className="text-amber-700 font-bold">{successBooking.date}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('bk.timeRange')}</span>
                    <strong className="text-zinc-900 dark:text-white font-bold">{successBooking.timeSlot}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('bk.guestPerson')}</span>
                    <strong className="text-zinc-950 dark:text-white">{successBooking.guestCount} {t('bk.persons')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('bk.statusLabel')}</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                      {t('bk.pending')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSuccessBooking(null)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold py-2.5 rounded-xl shadow-md transition-all"
                >
                  {t('bk.bookAnother')}
                </button>
              </div>
            ) : !selectedRoom ? (
              <div className="p-8 text-center text-zinc-400 space-y-2">
                <Info className="h-10 w-10 mx-auto text-zinc-350 stroke-1" />
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t('bk.selectRoom')}</p>
                <p className="text-[11px]">
                  {t('bk.selectRoomHint')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="p-5 space-y-4">
                
                {/* Visual Chosen Feed */}
                <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">{t('bk.chosenPlace')}</p>
                  <p className="text-sm font-extrabold text-zinc-900 dark:text-white">{td(selectedRoom.name)}</p>
                  <p className="text-xs text-zinc-650 font-sans mt-0.5">
                    {t('bk.capacityNote')} {selectedRoom.capacity} {t('bk.persons')} • {t('bk.feeNote')}
                  </p>
                </div>

                {/* Form fields */}
                <div className="space-y-3.5">
                  
                  {/* Select Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">{t('bk.dateLabel')}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <input
                        type="date"
                        required
                        min={todayString}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white font-medium placeholder-zinc-400 focus:ring-1 focus:ring-amber-500"
                        id="booking-date-input"
                      />
                    </div>
                  </div>

                  {/* Select Time slot */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">{t('bk.timeLabel')}</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {timeSlots.map(slot => {
                        const isThisSlotBooked = isSlotBooked(selectedRoom.id, date, slot);
                        const isChosenSlot = timeSlot === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isThisSlotBooked}
                            onClick={() => setTimeSlot(slot)}
                            className={`py-2 text-[10px] font-bold rounded-lg transition-all border flex flex-col items-center justify-center ${
                              isThisSlotBooked
                                ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed line-through'
                                : isChosenSlot
                                ? 'bg-amber-500 border-amber-500 text-zinc-950 dark:text-white font-black'
                                : 'bg-zinc-50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                            }`}
                          >
                            <span>{slot}</span>
                            {isThisSlotBooked && <span className="text-[8px] font-bold">{t('bk.slotBooked')}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Guest count */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1 flex justify-between">
                      <span>{t('bk.guestCountLabel')}</span>
                      <strong className="text-zinc-900 dark:text-white">{guestCount} {t('bk.persons')}</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={selectedRoom.capacity}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                      <span>1 {t('bk.persons')}</span>
                      <span>{t('bk.maxGuests')} {selectedRoom.capacity} {t('bk.persons')}</span>
                    </div>
                  </div>

                  {/* Customer parameters */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">{t('bk.nameLabel')}</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t('bk.namePh')}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white font-medium placeholder-zinc-400"
                      id="booking-customer-name"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">{t('bk.phoneLabel')}</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+998 90 123 45 67"
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-zinc-900 dark:text-white font-medium placeholder-zinc-400"
                      id="booking-customer-phone"
                    />
                  </div>

                </div>

                {errorMessage && (
                  <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs font-bold flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isSlotBooked(selectedRoom.id, date, timeSlot)}
                  className="w-full bg-zinc-900 hover:bg-amber-600 text-white hover:text-black py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                  id="booking-submit-btn"
                >
                  {isSubmitting ? t('bk.submitting') : t('bk.submit')}
                </button>

              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
