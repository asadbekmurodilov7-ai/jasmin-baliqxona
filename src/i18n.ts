import { useSettings, Lang } from './context/Settings';

// Tarjima lug'ati — barcha UI matnlari shu yerda (uz / ru)
export const translations = {
  // ===== Navbar =====
  'nav.menu': { uz: 'Taomlar Menyusi', ru: 'Меню блюд' },
  'nav.booking': { uz: 'Joy Band Qilish', ru: 'Бронь столиков' },
  'nav.orders': { uz: 'Buyurtmalarim', ru: 'Мои заказы' },
  'nav.admin': { uz: 'Admin Panel', ru: 'Админ-панель' },
  'nav.cart': { uz: 'Savatni ochish', ru: 'Открыть корзину' },
  'nav.adminLogout': { uz: 'Admindan chiqish', ru: 'Выйти из админки' },
  'nav.logout': { uz: 'Chiqish', ru: 'Выход' },

  // ===== Banner =====
  'banner.protected': {
    uz: 'Jasmin baliqxona tizimi admin paneli faol va faqat tasdiqlangan maxsus email manzillari orqali himoyalangan!',
    ru: 'Система Jasmin: админ-панель активна и защищена только подтверждёнными email-адресами!',
  },

  // ===== Hero (Menu) =====
  'hero.tag': { uz: "FARG'ONANING MASHHUR BALIQXONASI", ru: 'ИЗВЕСТНАЯ РЫБНАЯ ФЕРГАНЫ' },
  'hero.title': { uz: 'Jasmin Baliqxonasi Menyusi', ru: 'Меню рыбного дома Jasmin' },
  'hero.subtitle': {
    uz: "Jasmin Baliqxonasida pishirilgan betakror forel, daryo sazan va som baliqlari. Ma'lumotofiy go'zalliklar va jonli jarayonlarni Instagram sahifamizdan kuzatib boring:",
    ru: 'Неповторимая форель, речной сазан и сом, приготовленные в Jasmin. Следите за нами в Instagram:',
  },
  'hero.badge1': { uz: 'Yangi Tutilgan va Tirik baliqlar', ru: 'Свежепойманная и живая рыба' },
  'hero.badge2': { uz: "Farg'ona bo'ylab tezkor yetkazish", ru: 'Быстрая доставка по Фергане' },

  // ===== Search / categories =====
  'search.label': { uz: "TAOM YOKI BALIQNI NOMI BO'YICHA QIDIRISH", ru: 'ПОИСК БЛЮДА ИЛИ РЫБЫ ПО НАЗВАНИЮ' },
  'search.placeholder': {
    uz: "Sevimli balig'ingiz yoki taomingiz nomini yozing… (masalan: Som, Salat)",
    ru: 'Введите название блюда или рыбы… (например: Сом, Салат)',
  },
  'cat.label': { uz: 'KATEGORIYALAR:', ru: 'КАТЕГОРИИ:' },
  'cat.all': { uz: 'Barchasi', ru: 'Все' },
  'cat.baliq': { uz: 'Mazzali Baliqlar', ru: 'Вкусная рыба' },
  'cat.salatlar': { uz: 'Xilma-Xil Salatlar', ru: 'Салаты' },
  'cat.yonlar': { uz: 'Garnir & Qaylalar', ru: 'Гарниры и соусы' },
  'cat.non': { uz: 'Tandir Non', ru: 'Тандырный хлеб' },
  'cat.ichimliklar': { uz: 'Ichimliklar', ru: 'Напитки' },

  // ===== Cart =====
  'cart.title': { uz: 'SIZNING SAVATINGIZ', ru: 'ВАША КОРЗИНА' },
  'cart.empty': { uz: "Savat hozircha bo'sh", ru: 'Корзина пока пуста' },
  'cart.emptyHint': {
    uz: "Taomlarni ro'yxatdan tanlang va uning ustiga bosing",
    ru: 'Выберите блюда из списка и нажмите на них',
  },
  'cart.count': { uz: 'ta', ru: 'шт' },
  'cart.add': { uz: "Qo'shish", ru: 'Добавить' },
  'cart.checkout': { uz: 'Buyurtma berish', ru: 'Оформить заказ' },
  'cart.total': { uz: 'Jami', ru: 'Итого' },
  'cart.clear': { uz: 'Tozalash', ru: 'Очистить' },

  // ===== Menu cards =====
  'menu.notFound': { uz: 'Hech qanday taom topilmadi', ru: 'Блюда не найдены' },
  'menu.notFoundHint': {
    uz: "Iltimos, so'rovni o'zgartiring yoki boshqa ruknni tanlang",
    ru: 'Измените запрос или выберите другую категорию',
  },
  'menu.soldOut': { uz: 'Tugagan', ru: 'Закончилось' },
  'menu.unavailable': { uz: 'Mavjud emas', ru: 'Нет в наличии' },
  'menu.matched': { uz: 'Mos keldi', ru: 'Найдено' },
  'menu.sizeLabel': { uz: "Litir / Hajmni tanlang:", ru: 'Выберите литр / объём:' },

  // ===== Checkout form =====
  'co.emptyHint': {
    uz: "Taomlarni ro'yxatdan tanlang va uning ustiga bosing",
    ru: 'Выберите блюда из списка и нажмите на них',
  },
  'co.deliveryTitle': { uz: 'Yetkazib berish (Mijoz uchun qulay tizim)', ru: 'Доставка (удобная для клиента система)' },
  'co.delivery': { uz: 'Yetkazib berish', ru: 'Доставка' },
  'co.pickup': { uz: 'Olib ketish', ru: 'Самовывоз' },
  'co.chooseDistance': { uz: 'Masofani tanlang (Xaritadan):', ru: 'Выберите расстояние (по карте):' },
  'co.distanceNote': {
    uz: "* Farg'ona shahri bo'ylab: bazaviy yetkazish 10,000 so'm (har bir km uchun +2,500 so'm).",
    ru: '* По Фергане: базовая доставка 10 000 сум (+2 500 сум за каждый км).',
  },
  'co.addressLabel': { uz: "Aniq manzil (Ko'cha, uy/kvartira raqami):", ru: 'Точный адрес (улица, дом/квартира):' },
  'co.addressPh': { uz: "Masalan: Farg'ona sh., Mustaqillik ko'chasi, 24-uy", ru: 'Напр.: г. Фергана, ул. Мустакиллик, дом 24' },
  'co.contactTitle': { uz: "Aloqa Ma'lumotlari", ru: 'Контактные данные' },
  'co.nameLabel': { uz: 'Ismingiz:', ru: 'Ваше имя:' },
  'co.namePh': { uz: 'Ismingizni kiriting', ru: 'Введите ваше имя' },
  'co.phoneLabel': { uz: 'Telefon raqam:', ru: 'Номер телефона:' },
  'co.payLabel': { uz: "To'lov usuli:", ru: 'Способ оплаты:' },
  'co.payCash': { uz: 'Naqd (Eshikda)', ru: 'Наличные (у двери)' },
  'co.notesLabel': { uz: "Qo'shimcha izoh:", ru: 'Дополнительный комментарий:' },
  'co.notesPh': { uz: 'Oshpazlarimizga eslatma yozishingiz mumkin...', ru: 'Можете оставить заметку нашим поварам...' },
  'co.sumItems': { uz: 'Taomlar summasi:', ru: 'Сумма блюд:' },
  'co.sumService': { uz: 'Xizmat haqi (10%):', ru: 'Сервисный сбор (10%):' },
  'co.sumDelivery': { uz: 'Yetkazib berish haqi:', ru: 'Стоимость доставки:' },
  'co.sumTotal': { uz: "Jami To'lov:", ru: 'Итого к оплате:' },
  'co.submit': { uz: 'Onlayn Buyurtma Berish', ru: 'Оформить онлайн-заказ' },
  'co.submitting': { uz: 'Tayyorlanmoqda...', ru: 'Обработка...' },
  'co.orderAgain': { uz: 'Yana buyurtma berish', ru: 'Заказать снова' },
  'co.errName': { uz: 'Ismingizni kiriting.', ru: 'Введите ваше имя.' },
  'co.errPhone': { uz: "Telefon raqamingiz to'liq emas. Masalan: +998 90 123 45 67", ru: 'Неполный номер телефона. Напр.: +998 90 123 45 67' },
  'co.errAddress': { uz: 'Yetkazib berish manzilini kiriting.', ru: 'Введите адрес доставки.' },
  'co.errGeneric': { uz: "Buyurtma berishda xatolik yuz berdi. Qayta urinib ko'ring.", ru: 'Ошибка при оформлении заказа. Попробуйте снова.' },

  // ===== Common =====
  'common.price': { uz: "so'm", ru: 'сум' },
  'common.save': { uz: 'Saqlash', ru: 'Сохранить' },
  'common.cancel': { uz: 'Bekor qilish', ru: 'Отмена' },
  'common.back': { uz: 'Orqaga', ru: 'Назад' },
  'common.loading': { uz: 'Yuklanmoqda...', ru: 'Загрузка...' },
  'common.search': { uz: 'Qidirish', ru: 'Поиск' },

  // ===== Booking =====
  'booking.title': { uz: 'Joy Band Qilish', ru: 'Бронирование стола' },
  'booking.available': { uz: 'Bo‘sh', ru: 'Свободно' },
  'booking.busy': { uz: 'Band', ru: 'Занято' },
  'bk.tag': { uz: 'Xona & Tapchan Bron Qilish', ru: 'Бронь кабинок и тапчанов' },
  'bk.heading': { uz: "Farg'onadagi Eng Shinam Joylar", ru: 'Самые уютные места в Фергане' },
  'bk.intro': {
    uz: "Jasmin Baliqxonasi oilaviy tadbirlar, to'ylar, do'stona uchrashuvlar uchun ajoyib VIP xonalar, anhor bo'yi daryo tapchanlar va chiroyli stollarga ega. O'zingizga ma'qul joyni hoziroq onlayn band qiling.",
    ru: 'В Jasmin есть VIP-кабинки, тапчаны у реки и красивые столы для семейных торжеств, свадеб и встреч с друзьями. Забронируйте удобное место онлайн прямо сейчас.',
  },
  'bk.listTitle': { uz: "Joylar va Kabinkalar Ro'yxati", ru: 'Список мест и кабинок' },
  'bk.tapchan': { uz: 'Tapchan', ru: 'Тапчан' },
  'bk.kabinka': { uz: 'Kabinka', ru: 'Кабинка' },
  'bk.zal': { uz: 'Zal stoli', ru: 'Стол в зале' },
  'bk.maxGuests': { uz: 'Maks.', ru: 'Макс.' },
  'bk.persons': { uz: 'kishi', ru: 'чел.' },
  'bk.bookedNow': { uz: 'Ushbu Vaqtda Band!', ru: 'Занято в это время!' },
  'bk.serviceFee': { uz: '10% xizmat haqi', ru: 'Сервис 10%' },
  'bk.selected': { uz: 'Tanlandi ✓', ru: 'Выбрано ✓' },
  'bk.select': { uz: 'Tanlash', ru: 'Выбрать' },
  'bk.formTitle': { uz: 'Bron Qilish Shakli', ru: 'Форма бронирования' },
  'bk.successTitle': { uz: 'Joy Band Qilindi!', ru: 'Место забронировано!' },
  'bk.successDear': { uz: 'Hurmatli', ru: 'Уважаемый(ая)' },
  'bk.successTail': { uz: "sizga muvaffaqiyatli band qilindi. Jasmin ma'muriyati sizni kutadi!", ru: 'успешно забронировано для вас. Администрация Jasmin ждёт вас!' },
  'bk.bookId': { uz: 'Bron ID:', ru: 'ID брони:' },
  'bk.sectorName': { uz: 'Sektor nomi:', ru: 'Название места:' },
  'bk.date': { uz: 'Sana:', ru: 'Дата:' },
  'bk.timeRange': { uz: "Vaqt oralig'i:", ru: 'Время:' },
  'bk.guestPerson': { uz: 'Mehmondost kishi:', ru: 'Гостей:' },
  'bk.statusLabel': { uz: 'Holat:', ru: 'Статус:' },
  'bk.pending': { uz: 'Kutilmoqda', ru: 'Ожидает' },
  'bk.bookAnother': { uz: 'Boshqa joyni bron qilish', ru: 'Забронировать другое место' },
  'bk.selectRoom': { uz: 'Xonani tanlang', ru: 'Выберите место' },
  'bk.selectRoomHint': {
    uz: 'Oldindan joy tanlab band qilish uchun chap tarafdagi kartalardan birining ustiga bosing.',
    ru: 'Чтобы забронировать заранее, нажмите на одну из карточек слева.',
  },
  'bk.chosenPlace': { uz: 'Tanlangan Joy:', ru: 'Выбранное место:' },
  'bk.capacityNote': { uz: "Maksimal sig'imi:", ru: 'Макс. вместимость:' },
  'bk.feeNote': { uz: '10% xizmat haqi olinadi', ru: 'взимается сервисный сбор 10%' },
  'bk.dateLabel': { uz: 'Sana:', ru: 'Дата:' },
  'bk.timeLabel': { uz: "Qulay vaqt oralig'i:", ru: 'Удобное время:' },
  'bk.slotBooked': { uz: 'Band qilingan', ru: 'Занято' },
  'bk.guestCountLabel': { uz: 'Mehmondostlar soni (Kishi):', ru: 'Количество гостей:' },
  'bk.nameLabel': { uz: 'Ismingiz (Sizga murojaat qilish uchun):', ru: 'Ваше имя (для обращения):' },
  'bk.namePh': { uz: 'Ismingizni yozing', ru: 'Введите ваше имя' },
  'bk.phoneLabel': { uz: 'Aloqa telefoni:', ru: 'Контактный телефон:' },
  'bk.submitting': { uz: 'Saqlanmoqda...', ru: 'Сохранение...' },
  'bk.submit': { uz: 'Joyni band etish (Bron qilish)', ru: 'Забронировать место' },
  'bk.errGeneric': { uz: "Band qilishda xatolik yuz berdi. Ushbu vaqt band bo'lishi mumkin.", ru: 'Ошибка при бронировании. Возможно, это время уже занято.' },

  // ===== Orders tracking =====
  'orders.title': { uz: 'Mening Buyurtmalarim', ru: 'Мои заказы' },
  'orders.empty': { uz: "Sizda hali buyurtmalar yo'q", ru: 'У вас пока нет заказов' },
  'orders.status.pending': { uz: 'Kutilmoqda', ru: 'Ожидает' },
  'orders.status.preparing': { uz: 'Tayyorlanmoqda', ru: 'Готовится' },
  'orders.status.delivering': { uz: 'Yetkazilmoqda', ru: 'Доставляется' },
  'orders.status.completed': { uz: 'Yakunlandi', ru: 'Завершён' },
  'orders.status.cancelled': { uz: 'Bekor qilindi', ru: 'Отменён' },

  // ===== Orders tracking tab =====
  'ot.tag': { uz: 'Mening Buyurtmalarim', ru: 'Мои заказы' },
  'ot.heading': { uz: 'Buyurtmalar va Joylar Monitoringi', ru: 'Мониторинг заказов и мест' },
  'ot.intro': {
    uz: 'Savat orqali berilgan onlayn baliq buyurtmalari hamda yuborilgan vip tapchan buyurtmalaringizning pishirilish va tayyorlanish jarayonini shu sahifada jonli kuzating.',
    ru: 'Следите в реальном времени за приготовлением ваших онлайн-заказов рыбы и бронирований VIP-мест на этой странице.',
  },
  'ot.foodOrders': { uz: 'Taom Buyurtmalari', ru: 'Заказы блюд' },
  'ot.liveMode': { uz: 'Jonli rejim (Avto-yangilanish)', ru: 'Живой режим (автообновление)' },
  'ot.noOrders': {
    uz: 'Sizda hozircha faol baliq buyurtmalari mavjud emas. Buyurtma berish uchun menyudan foydalaning!',
    ru: 'У вас пока нет активных заказов. Используйте меню, чтобы сделать заказ!',
  },
  'ot.id': { uz: 'ID:', ru: 'ID:' },
  'ot.statusLabel': { uz: 'Holati:', ru: 'Статус:' },
  'ot.st.pending': { uz: 'Kutilmoqda', ru: 'Ожидает' },
  'ot.st.preparing': { uz: 'Grilda pishirilmoqda...', ru: 'Готовится на гриле...' },
  'ot.st.delivering': { uz: 'Kuryer yo‘lda', ru: 'Курьер в пути' },
  'ot.st.completed': { uz: 'Yetkazildi (Yakunlandi)', ru: 'Доставлено (Завершено)' },
  'ot.st.cancelled': { uz: 'Bekor qilindi', ru: 'Отменено' },
  'ot.orderedItems': { uz: 'Buyurtma qilingan taomlar:', ru: 'Заказанные блюда:' },
  'ot.pcs': { uz: 'dona', ru: 'шт' },
  'ot.payType': { uz: "To'lov turi:", ru: 'Способ оплаты:' },
  'ot.address': { uz: 'Manzil:', ru: 'Адрес:' },
  'ot.totalSum': { uz: 'Jami summa:', ru: 'Итого:' },
  'ot.bookingQueue': { uz: 'Tapchan & Kabinka Bron Navbatlari', ru: 'Очередь броней тапчанов и кабинок' },
  'ot.noBookings': {
    uz: 'Sizda hozircha faol stol yoki xona band qilish buyurtmalari mavjud emas.',
    ru: 'У вас пока нет активных бронирований столов или кабинок.',
  },
  'ot.bk.pending': { uz: 'Kutilmoqda', ru: 'Ожидает' },
  'ot.bk.confirmed': { uz: 'Tasdiqlangan', ru: 'Подтверждено' },
  'ot.bk.cancelled': { uz: 'Bekor bo‘lgan', ru: 'Отменено' },
  'ot.bDate': { uz: 'Sana:', ru: 'Дата:' },
  'ot.bTime': { uz: 'Vaqt bandi:', ru: 'Время:' },
  'ot.guestsFor': { uz: 'Mehmonlar:', ru: 'Гостей:' },
  'ot.clientContact': { uz: 'Mijoz kontakti:', ru: 'Контакт клиента:' },

  // ===== Footer =====
  'ft.about': {
    uz: "Farg'ona shahridagi eng mazzali, sara va yangi daryo baliqlari tayyorlanadigan maskan. Siz uchun salqin tapchanlar, yopiq konditsionerli VIP kabinkalar va shinam zallar muntazam muntazir.",
    ru: 'Лучшее место в Фергане, где готовят свежую речную рыбу. Для вас — прохладные тапчаны, VIP-кабинки с кондиционером и уютные залы.',
  },
  'ft.contactTitle': { uz: "Bog'lanish va Manzil", ru: 'Контакты и адрес' },
  'ft.address': { uz: "Farg'ona sh., Zavod yo'nalishi", ru: 'г. Фергана, заводское направление' },
  'ft.hours': { uz: 'Har kuni: 09:00 dan 22:00 gacha', ru: 'Ежедневно: с 09:00 до 22:00' },
  'ft.social': { uz: 'Ijtimoiy Tarmoqlar', ru: 'Социальные сети' },
  'ft.socialText': {
    uz: 'Yangi retseptlar, aksiyalar va tirik baliqlar tutilishi jarayonini Instagram orqali kuzatib boring:',
    ru: 'Следите за новыми рецептами, акциями и ловлей живой рыбы в Instagram:',
  },
  'ft.rights': { uz: 'Barcha huquqlar himoyalangan.', ru: 'Все права защищены.' },
  'ft.location': { uz: "Farg'ona, O'zbekiston", ru: 'Фергана, Узбекистан' },
} as const;

export type TranslationKey = keyof typeof translations;

export function translate(key: TranslationKey, lang: Lang): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] ?? entry.uz;
}

// React hook: const t = useT(); t('nav.menu')
export function useT() {
  const { lang } = useSettings();
  return (key: TranslationKey) => translate(key, lang);
}
