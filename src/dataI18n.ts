import { useSettings, Lang } from './context/Settings';

// Ma'lumotlar bazasidagi (store.json) o'zbekcha qiymatlarni ruschaga tarjima qilish.
// Yangi taom/xona qo'shilganda, ruscha ko'rsatilishi uchun shu yerga qo'shing.
const DATA_RU: Record<string, string> = {
  // ---- Menu nomlari ----
  'Kamalak Foreli': 'Радужная форель',
  "Sazan Baliq (Qovurilgan Farg'ona uslubi)": 'Сазан (жареный по-фергански)',
  'Daryo Som (Pechda dumlangan)': 'Речной сом (томлёный в печи)',
  'Sudak Kabob (Shashlik)': 'Судак кебаб (шашлык)',
  'Haqiqiy Achichuk': 'Настоящий ачичук',
  'Voha Salati (Oasis)': 'Салат «Оазис»',
  'Kartoshka Fri': 'Картофель фри',
  'Sarimsoqli Baliq Sousi': 'Чесночный соус к рыбе',
  "O'choq Issiq Non": 'Горячий тандырный хлеб',
  "Limonli Ko'k Choy": 'Зелёный чай с лимоном',
  'Jasmin Maxsus Lemonadi': 'Фирменный лимонад Jasmin',

  // ---- Menu tavsiflari ----
  "Jasmin baliqxonasining eng mashhur taomlaridan biri. Kamalak foreli o'choq olovida, maxsus zirvorlar va limon marinadi bilan butunligicha grilda pishiriladi.":
    'Одно из самых популярных блюд рыбного дома Jasmin. Радужная форель целиком готовится на гриле на открытом огне с особыми специями и лимонным маринадом.',
  "Daryodan yangi tutilgan Sazan balig'i suyaklaridan ajratilib, maxsus sariyog' va un kombinatsiyasida o'ta qarsildoq qilib qovuriladi. Sarimsoqli qayla bilan beriladi.":
    'Свежевыловленный сазан очищается от костей и обжаривается до хруста в особой смеси сливочного масла и муки. Подаётся с чесночным соусом.',
  "Yumshoq va yog'li som balig'ining dumi piyoz, pomidor va maxsus ko'katlar hamrohligida pechda dimlanadi. Labingizda eriydi.":
    'Нежный и жирный хвост сома томится в печи с луком, помидорами и особыми травами. Тает во рту.',
  "Sershira sudak balig'i go'shti kubik qilib kesilib, to'g'ralgan limonga marinadlanadi va cho'g'da ohista pishiriladi. Kam yog'li, parhezbop.":
    'Сочное мясо судака нарезается кубиками, маринуется с лимоном и аккуратно готовится на углях. Нежирное, диетическое.',
  "Yangi shirin Farg'ona pomidorlari, yupqa to'g'ralgan piyoz va achchiq qalampir murchi bilan birga tayyorlangan an'anaviy baliqbozlik salati.":
    'Традиционный салат к рыбе из свежих сладких ферганских помидоров, тонко нарезанного лука и острого перца.',
  "Bodring, ko'k no'xat, makkajo'xori, sarxil ko'katlar va maxsus zaytun moyli sous solingan tetiklashtiruvchi salat.":
    'Освежающий салат из огурцов, зелёного горошка, кукурузы, отборной зелени и заправки на оливковом масле.',
  "Ushbu oltin qarsildoq kartoshkalar baliq go'shtiga eng ajoyib garnir hisoblanadi. Tomat-chesnok sousi tekin qo'shib beriladi.":
    'Золотистый хрустящий картофель — лучший гарнир к рыбе. Томатно-чесночный соус добавляется бесплатно.',
  "Jasmin uy sharoitida tayyorlangan maxsus sarimsoq, yashil kashnich, kislotali limon va sariyog'li sous.":
    'Домашний фирменный соус Jasmin из чеснока, зелёной кинзы, кислого лимона и сливочного масла.',
  "Baliqxonamiz tandirida tayyorlangan qarsildoq, kunjut sepilgan issiq Uzbek noni.":
    'Хрустящий горячий узбекский хлеб с кунжутом, испечённый в тандыре нашего рыбного дома.',
  "Chinni choynakda damlangan yangi limon tilimlari va asal bilan boyitilgan, baliqdan keyin hazm qilishga eng yaxshi ko'k choy.":
    'Зелёный чай, заваренный в фарфоровом чайнике, с дольками свежего лимона и мёдом — лучший для пищеварения после рыбы.',
  "Yalpiz barglari, yangi siqilgan limon va apelsin sharbatidan tayyorlanadigan tetiklashtiruvchi sovuq ichimlik.":
    'Освежающий холодный напиток из листьев мяты, свежевыжатого лимона и апельсинового сока.',

  // ---- Xona tavsiflari ----
  "Shinam va go'zal an'anaviy o'zbekona tapchan. Atrof yashillik bilan o'ralgan va shinam ko'rpachalar bor. Maks. 10 kishi uchun.":
    'Уютный и красивый традиционный узбекский тапчан. Окружён зеленью, есть мягкие курпачи. Макс. до 10 человек.',
  "Hammasi uchun alohida konditsioner bilan jihozlangan tinch va shinam oilaviy xona. Televizor mavjud emas, oilaviy suhbat va osoyishtalik uchun ajoyib maskan.":
    'Тихая и уютная семейная комната с отдельным кондиционером. Телевизора нет — отличное место для семейной беседы и спокойствия.',

  // ---- Xususiyatlar (features) ----
  'Shinam muhit': 'Уютная атмосфера',
  'Yumshoq yostiqlar': 'Мягкие подушки',
  'Telefon zaryadlash moslamasi': 'Зарядка для телефона',
  'Kuchli Konditsioner': 'Мощный кондиционер',
  'Shinam yumshoq divanlar': 'Уютные мягкие диваны',
  "Fayzli o'zbekona dizayn": 'Уютный узбекский дизайн',
  'Keng oilaviy stol': 'Большой семейный стол',
  'Shovqin izolatsiyasi': 'Шумоизоляция',

  // ---- O'lchamlar (size) ----
  '1 kg': '1 кг',
  '0.5 kg': '0.5 кг',
  '1 portsiya': '1 порция',
  '1 dona': '1 шт',
  '1 choynak': '1 чайник',
  '1 idish': '1 порция',
  '1 litr': '1 литр',
};

export function translateData(text: string, lang: Lang): string {
  if (lang !== 'ru' || !text) return text;
  const trimmed = text.trim();
  if (DATA_RU[trimmed]) return DATA_RU[trimmed];

  // Nom shablonlari
  let out = trimmed;
  out = out.replace(/^Tapchan #(\d+)/, 'Тапчан №$1');
  out = out.replace(/^VIP Shoxona Xona #(\d+)/, 'VIP Кабинка №$1');
  out = out.replace(/\((\d+)\s*kishilik\)/, '($1 чел.)');
  out = out.replace(/\((\d+)-(\d+)\s*kishilik\)/, '($1-$2 чел.)');
  return out;
}

// Hook: const td = useTd(); td(item.name)
export function useTd() {
  const { lang } = useSettings();
  return (text: string) => translateData(text, lang);
}
