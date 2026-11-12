import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Film,
  Tv,
  Heart,
  Shield,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Settings,
  Users,
  ChevronDown,
  Lock,
  Edit2,
  SlidersHorizontal,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAvatarUrl } from '@/utils/avatarConverter';
import { UserProfile } from '@/types/profile';
import { MurflixLogo } from './MurflixLogo';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfilePinModal } from '@/components/profile/ProfilePinModal';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { moviesApi } from '@/api/movies';
import { COUNTRY_OPTIONS, YEAR_OPTIONS } from '@/constants/catalogFilters';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pinModalProfile, setPinModalProfile] = useState<UserProfile | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeProfile, profiles, selectProfile, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch genres for navbar filters
  useEffect(() => {
    if (isAuthenticated) {
      const isTV = location.pathname.includes('/tv');
      moviesApi
        .getGenres(isTV ? 'tv' : 'movie')
        .then((res) => setGenres(res.genres || []))
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Serial', path: '/browse/tv', icon: Tv },
    { label: 'Film', path: '/browse/movies', icon: Film },
    { label: 'Daftar Saya', path: '/my-list', icon: Heart },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const searchParams = new URLSearchParams(location.search);
  const currentCountry = location.pathname.startsWith('/browse') ? (searchParams.get('country') || '') : '';
  const currentGenre = location.pathname.startsWith('/browse') ? (searchParams.get('genre') || '') : '';
  const currentYear = location.pathname.startsWith('/browse') ? (searchParams.get('year') || '') : '';

  const handleFilterChange = (key: 'country' | 'genre' | 'year', val: string) => {
    const isTV = location.pathname.includes('/tv');
    const targetBase = isTV ? '/browse/tv' : '/browse/movies';
    const nextParams = new URLSearchParams(location.search);

    if (val) {
      nextParams.set(key, val);
    } else {
      nextParams.delete(key);
    }
    nextParams.set('page', '1');

    navigate(`${targetBase}?${nextParams.toString()}`);
  };

  const hasActiveFilters = Boolean(currentCountry || currentGenre || currentYear);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-[#141414]/95 backdrop-blur-md shadow-lg shadow-black/40 border-b border-white/5' : 'bg-gradient-to-b from-black/85 via-black/40 to-transparent'
      }`}
    >
      <div className="w-full max-w-[2400px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-20">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-5 sm:space-x-7">
            <Link to="/" className="flex items-center transition-transform hover:scale-105 active:scale-95" aria-label="Beranda Murflix">
              <MurflixLogo size="md" />
            </Link>

            {/* Desktop Links (1:1 Netflix Style Pill Navigation) */}
            <div className="hidden lg:flex items-center space-x-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-xs sm:text-sm transition-all duration-200 ${
                      active
                        ? 'bg-zinc-800/90 text-white font-bold px-3.5 py-1.5 rounded-full shadow-sm'
                        : 'text-zinc-300 hover:text-white font-medium px-3 py-1.5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Inline Desktop Filters (Navbar Integration) */}
            {isAuthenticated && (
              <div className="hidden xl:flex items-center space-x-2 pl-3 border-l border-zinc-800/80">
                {/* Filter Negara */}
                <CustomDropdown
                  size="sm"
                  value={currentCountry}
                  onChange={(val) => handleFilterChange('country', val)}
                  options={COUNTRY_OPTIONS}
                  placeholder="Negara"
                  className="w-36"
                />

                {/* Filter Genre */}
                <CustomDropdown
                  size="sm"
                  value={currentGenre}
                  onChange={(val) => handleFilterChange('genre', val)}
                  options={[
                    { value: '', label: 'Semua Genre' },
                    ...genres.map((g) => ({ value: String(g.id), label: g.name })),
                  ]}
                  placeholder="Genre"
                  className="w-36"
                />

                {/* Filter Tahun */}
                <CustomDropdown
                  size="sm"
                  value={currentYear}
                  onChange={(val) => handleFilterChange('year', val)}
                  options={YEAR_OPTIONS}
                  placeholder="Tahun"
                  className="w-32"
                />
              </div>
            )}
          </div>

          {/* Right Actions: Filter Button, Search, Notifications & Profile */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5">
            
            {/* Filter Button for smaller desktops & tablets */}
            {isAuthenticated && (
              <div className="xl:hidden">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(true)}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border cursor-pointer ${
                    hasActiveFilters
                      ? 'bg-[#e50914] text-white border-red-500 shadow-md shadow-red-600/30'
                      : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700/60'
                  }`}
                  title="Filter Katalog"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
              </div>
            )}

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Cari film, serial TV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 md:w-56 lg:w-64 bg-black/60 border border-gray-700 text-white placeholder-gray-400 text-xs sm:text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#e50914] focus:w-72 transition-all duration-300"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            {/* Notification Dropdown */}
            <NotificationDropdown />

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:ring-2 hover:ring-[#e50914] transition-all group cursor-pointer"
                  title="Menu Profil"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 shadow-md flex items-center justify-center border border-white/20">
                    <img
                      src={getAvatarUrl(activeProfile?.avatar_url || user?.avatar_url)}
                      alt={activeProfile?.name || 'Profile'}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/avatars/avatar-red.svg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#18181b] border border-gray-800 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                    {/* Active Profile Info */}
                    <div className="px-4 py-2.5 border-b border-gray-800 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-black border border-red-500/50 flex-shrink-0">
                        <img
                          src={getAvatarUrl(activeProfile?.avatar_url || user?.avatar_url)}
                          alt={activeProfile?.name || 'Profile'}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/avatars/avatar-red.svg';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{activeProfile?.name || user?.full_name || 'Member'}</p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{user?.email}</p>
                      </div>
                    </div>

                    {/* Switch Profile Sub-menu */}
                    {profiles.length > 1 && (
                      <div className="py-2 border-b border-gray-800">
                        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Ganti Profil
                        </p>
                        {profiles
                          .filter((p) => p.id !== activeProfile?.id)
                          .map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setIsProfileOpen(false);
                                if (p.has_pin) {
                                  setPinModalProfile(p);
                                } else {
                                  selectProfile(p);
                                }
                              }}
                              className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-800 transition-colors text-left group cursor-pointer"
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <img
                                  src={getAvatarUrl(p.avatar_url)}
                                  alt={p.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/avatars/avatar-red.svg';
                                  }}
                                  className="w-6 h-6 rounded-md object-cover flex-shrink-0"
                                />
                                <span className="text-xs text-gray-300 group-hover:text-white truncate font-medium">
                                  {p.name}
                                </span>
                              </div>
                              {p.has_pin && (
                                <Lock className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white flex-shrink-0 ml-2" />
                              )}
                            </button>
                          ))}
                      </div>
                    )}

                    {/* Manage Profiles & Account Settings */}
                    <div className="py-1">
                      <Link
                        to="/profiles"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span>Ganti Profil</span>
                      </Link>

                      <Link
                        to="/profiles?manage=true"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-red-500" />
                        <span>Kelola Profil</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-blue-400" />
                        <span>Pengaturan Akun &amp; Avatar</span>
                      </Link>

                      <Link
                        to="/my-list"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span>Daftar Tontonan</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-amber-500" />
                          <span>Portal Admin</span>
                        </Link>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors border-t border-gray-800 mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/30 transition-all hover:scale-105"
              >
                Masuk
              </Link>
            )}

            {/* Mobile Search Button */}
            <Link
              to="/search"
              className="sm:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800"
            >
              <Search className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#141418] border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#e50914]" />
                <h3 className="text-sm font-bold text-white">Filter Katalog</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Negara / Asal:</span>
                <CustomDropdown
                  value={currentCountry}
                  onChange={(val) => {
                    handleFilterChange('country', val);
                    setIsFilterModalOpen(false);
                  }}
                  options={COUNTRY_OPTIONS}
                  className="w-full"
                />
              </div>

              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Genre:</span>
                <CustomDropdown
                  value={currentGenre}
                  onChange={(val) => {
                    handleFilterChange('genre', val);
                    setIsFilterModalOpen(false);
                  }}
                  options={[
                    { value: '', label: 'Semua Genre' },
                    ...genres.map((g) => ({ value: String(g.id), label: g.name })),
                  ]}
                  className="w-full"
                />
              </div>

              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 mb-1">Tahun Rilis:</span>
                <CustomDropdown
                  value={currentYear}
                  onChange={(val) => {
                    handleFilterChange('year', val);
                    setIsFilterModalOpen(false);
                  }}
                  options={YEAR_OPTIONS}
                  className="w-full"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  navigate('/browse/movies');
                  setIsFilterModalOpen(false);
                }}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Reset Semua
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#e50914] text-white font-semibold text-xs shadow-md cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile PIN Verification Modal */}
      <ProfilePinModal
        isOpen={!!pinModalProfile}
        profile={pinModalProfile}
        onSuccess={() => {
          if (pinModalProfile) {
            selectProfile(pinModalProfile);
            setPinModalProfile(null);
          }
        }}
        onClose={() => setPinModalProfile(null)}
      />
    </nav>
  );
};
