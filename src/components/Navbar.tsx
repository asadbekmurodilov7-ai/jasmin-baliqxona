import React from 'react';
import { Fish, ShoppingBag, ShieldCheck, Compass, CalendarRange, Clock, LogOut, Sun, Moon, Languages } from 'lucide-react';
import { useSettings } from '../context/Settings';
import { useT } from '../i18n';

interface NavbarProps {
  currentTab: 'menu' | 'booking' | 'orders' | 'admin';
  onChangeTab: (tab: 'menu' | 'booking' | 'orders' | 'admin') => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  cartCount: number;
  activeOrderCount: number;
}

export default function Navbar({
  currentTab,
  onChangeTab,
  isAdmin,
  onToggleAdmin,
  cartCount,
  activeOrderCount,
}: NavbarProps) {
  const [logoClicks, setLogoClicks] = React.useState(0);
  const [lastClickTime, setLastClickTime] = React.useState(0);
  const { theme, lang, toggleTheme, toggleLang } = useSettings();
  const t = useT();

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime > 3000) {
      setLogoClicks(1);
    } else {
      const newCount = logoClicks + 1;
      setLogoClicks(newCount);
      if (newCount >= 5) {
        onToggleAdmin();
        setLogoClicks(0);
      }
    }
    setLastClickTime(now);
    // Admin panelda bo'lganda logoga bosish menyuga o'tkazmasin
    if (currentTab !== 'admin') {
      onChangeTab('menu');
    }
  };

  const tabBase = 'flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300';
  const tabActive = 'bg-red-600 text-white shadow-md shadow-red-900/20';
  const tabIdle = 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white';

  return (
    <header className="sticky top-0 z-40 bg-white text-zinc-900 border-b border-zinc-200 shadow-sm dark:bg-zinc-950 dark:text-white dark:shadow-xl dark:border-red-900/30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick}>
            <div className="bg-red-600 text-white p-2.5 rounded-full shadow-inner flex items-center justify-center animate-pulse">
              <Fish className="h-6 w-6 stroke-[2.5]" id="navbar-logo-icon" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-red-500 font-sans">
                JASMIN <span className="text-zinc-900 dark:text-white font-medium text-sm md:text-base block -mt-1 tracking-widest uppercase">Baliqxona</span>
              </h1>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => onChangeTab('menu')}
              className={`${tabBase} ${currentTab === 'menu' ? tabActive : tabIdle}`}
              id="nav-tab-menu"
            >
              <Compass className="h-4 w-4" />
              <span>{t('nav.menu')}</span>
            </button>

            <button
              onClick={() => onChangeTab('booking')}
              className={`${tabBase} ${currentTab === 'booking' ? tabActive : tabIdle}`}
              id="nav-tab-booking"
            >
              <CalendarRange className="h-4 w-4" />
              <span>{t('nav.booking')}</span>
            </button>

            <button
              onClick={() => onChangeTab('orders')}
              className={`${tabBase} relative ${currentTab === 'orders' ? tabActive : tabIdle}`}
              id="nav-tab-orders"
            >
              <Clock className="h-4 w-4" />
              <span>{t('nav.orders')}</span>
              {activeOrderCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-zinc-100 text-red-600 text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border border-red-600 animate-bounce">
                  {activeOrderCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              title={lang === 'uz' ? 'Til: O‘zbekcha' : 'Язык: Русский'}
              id="navbar-lang-toggle"
            >
              <Languages className="h-4 w-4" />
              <span className="uppercase">{lang}</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-zinc-100 text-amber-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-amber-400 dark:hover:bg-zinc-700 transition-colors"
              title={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'}
              id="navbar-theme-toggle"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart Button for Menu */}
            <button
              onClick={() => onChangeTab('menu')}
              className="relative p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-red-500 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
              title={t('nav.cart')}
              id="navbar-cart-button"
            >
              <ShoppingBag className="h-5.5 w-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin nav buttons */}
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onChangeTab('admin')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
                    currentTab === 'admin'
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:border-red-500 dark:text-red-200 dark:hover:bg-red-900/85'
                  }`}
                  id="admin-panel-btn"
                >
                  <ShieldCheck className="h-4 w-4 text-red-400" />
                  <span className="hidden sm:inline">{t('nav.admin')}</span>
                </button>
                <button
                  onClick={onToggleAdmin}
                  className="p-2 rounded-xl text-xs font-bold transition-all duration-300 border border-zinc-300 bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-red-950 dark:hover:border-red-500 dark:hover:text-red-300"
                  title={t('nav.adminLogout')}
                  id="admin-logout-btn"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex justify-around p-2 text-zinc-500 dark:text-zinc-400 text-xs font-medium transition-colors">
        <button
          onClick={() => onChangeTab('menu')}
          className={`flex flex-col items-center py-1 px-3 rounded-md transition-all ${
            currentTab === 'menu' ? 'text-red-500 scale-105' : 'hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Compass className="h-5 w-5 mb-0.5" />
          <span>{t('nav.menu')}</span>
        </button>

        <button
          onClick={() => onChangeTab('booking')}
          className={`flex flex-col items-center py-1 px-3 rounded-md transition-all ${
            currentTab === 'booking' ? 'text-red-500 scale-105' : 'hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <CalendarRange className="h-5 w-5 mb-0.5" />
          <span>{t('nav.booking')}</span>
        </button>

        <button
          onClick={() => onChangeTab('orders')}
          className={`flex flex-col items-center py-1 px-3 rounded-md transition-all relative ${
            currentTab === 'orders' ? 'text-red-500 scale-105' : 'hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Clock className="h-5 w-5 mb-0.5" />
          <span>{t('nav.orders')}</span>
          {activeOrderCount > 0 && (
            <span className="absolute top-0 right-3 bg-red-600 text-white text-[9px] h-4 w-4 rounded-full flex items-center justify-center">
              {activeOrderCount}
            </span>
          )}
        </button>

        {isAdmin && (
          <button
            onClick={() => onChangeTab('admin')}
            className={`flex flex-col items-center py-1 px-3 rounded-md transition-all ${
              currentTab === 'admin' ? 'text-red-500 scale-105' : 'hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="h-5 w-5 mb-0.5" />
            <span>{t('nav.admin')}</span>
          </button>
        )}
        {isAdmin && (
          <button
            onClick={onToggleAdmin}
            className="flex flex-col items-center py-1 px-3 rounded-md transition-all text-zinc-500 hover:text-red-400"
            title={t('nav.logout')}
          >
            <LogOut className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">{t('nav.logout')}</span>
          </button>
        )}
      </div>

    </header>
  );
}
