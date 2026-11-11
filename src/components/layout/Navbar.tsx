import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Film, Tv, PlaySquare, Heart, Shield, LogOut, User as UserIcon, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

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
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/browse/movies', icon: Film },
    { label: 'Series TV', path: '/browse/tv', icon: Tv },
    { label: 'DramaBox', path: '/dramabox', icon: PlaySquare },
    { label: 'ReelShort', path: '/reelshort', icon: Sparkles },
    { label: 'Anime', path: '/anime', icon: PlaySquare },
    { label: 'Daftar Saya', path: '/my-list', icon: Heart },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-[#141414]/95 backdrop-blur-md shadow-lg shadow-black/40' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-wider text-[#e50914] drop-shadow-[0_2px_8px_rgba(229,9,20,0.6)]">
                MURFLIX
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    isActive(link.path) ? 'text-white font-bold' : 'text-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Actions: Search & Profile */}
          <div className="flex items-center space-x-4">
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Cari film, serial, anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 md:w-64 bg-black/50 border border-gray-700 text-white placeholder-gray-400 text-xs sm:text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#e50914] focus:w-72 transition-all duration-300"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:ring-2 hover:ring-[#e50914] transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e50914] to-red-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    {user?.full_name ? user.full_name[0].toUpperCase() : user?.email[0].toUpperCase()}
                  </div>
                </button>

                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl py-2 z-50"
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-sm font-medium text-white truncate">{user?.full_name || 'Member'}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {user?.role === 'admin' ? 'Super Admin' : user?.subscription_status === 'forever' ? 'Lifetime Access' : 'Active Member'}
                      </div>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800/80 transition-colors"
                      >
                        <Shield className="w-4 h-4 mr-3 text-red-500" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/my-list"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800/80 transition-colors"
                    >
                      <Heart className="w-4 h-4 mr-3 text-pink-500" />
                      Daftar Tontonan
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-gray-800 mt-1"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#e50914] hover:bg-red-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-md shadow-red-600/30"
              >
                Masuk
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#141414] border-b border-gray-800 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Cari film, serial, anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-400 text-sm rounded-lg pl-9 pr-4 py-2"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const IconComp = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(link.path) ? 'bg-[#e50914] text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {IconComp && <IconComp className="w-4 h-4" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

