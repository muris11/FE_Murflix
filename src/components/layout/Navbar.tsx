import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Film, Tv, Heart, Shield, LogOut, User as UserIcon, Menu, X, Settings, Users, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MurflixLogo } from './MurflixLogo';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, activeProfile, profiles, selectProfile, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-[#141414]/95 backdrop-blur-md shadow-lg shadow-black/40 border-b border-white/5' : 'bg-gradient-to-b from-black/85 via-black/40 to-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link to="/" className="flex items-center transition-transform hover:scale-105 active:scale-95" title="Beranda Murflix">
              <MurflixLogo size="md" />
            </Link>

            {/* Desktop Links (1:1 Netflix Style Pill Navigation) */}
            <div className="hidden lg:flex items-center space-x-2">
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
          </div>

          {/* Right Actions: Search, Notifications & Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Cari film, serial TV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 md:w-64 bg-black/60 border border-gray-700 text-white placeholder-gray-400 text-xs sm:text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#e50914] focus:w-72 transition-all duration-300"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            {/* Notification Bell (Netflix 1:1 Badge) */}
            <div className="relative cursor-pointer p-1.5 text-zinc-300 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#e50914] text-white text-[9px] font-black flex items-center justify-center shadow-md">
                3
              </span>
            </div>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:ring-2 hover:ring-[#e50914] transition-all group"
                  title="Menu Profil"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 shadow-md flex items-center justify-center border border-white/20">
                    <img
                      src={activeProfile?.avatar_url || user?.avatar_url || '/avatars/avatar-red.svg'}
                      alt={activeProfile?.name || 'Profile'}
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
                          src={activeProfile?.avatar_url || user?.avatar_url || '/avatars/avatar-red.svg'}
                          alt={activeProfile?.name || 'Profile'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{activeProfile?.name || user?.full_name || 'Member'}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-red-500 border border-red-500/40 text-[10px] font-bold uppercase">
                          {user?.role === 'admin' ? 'Super Admin' : user?.plan_name || 'Member Aktif'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Switch Profiles (Netflix Style) */}
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
                                selectProfile(p);
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 transition-colors text-left"
                            >
                              <img
                                src={p.avatar_url || '/avatars/avatar-red.svg'}
                                alt={p.name}
                                className="w-6 h-6 rounded-md object-cover flex-shrink-0"
                              />
                              <span className="text-xs text-gray-300 hover:text-white truncate font-medium">
                                {p.name}
                              </span>
                            </button>
                          ))}
                      </div>
                    )}

                    {/* Manage Profiles & Account Settings */}
                    <div className="py-1">
                      <Link
                        to="/profiles?manage=true"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                        <Users className="w-4 h-4 text-red-500" />
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
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors border-t border-gray-800 mt-1"
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
    </nav>
  );
};
