import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Tv,
  Film,
  Smartphone,
  Laptop,
  Tablet,
  Download,
  ShieldCheck,
  Zap,
  Check,
  ChevronDown,
  Volume2,
  Layers,
  Lock,
  Star,
  Flame,
  ArrowRight,
  Sliders,
  HelpCircle,
  Globe,
  Radio,
  Server,
} from 'lucide-react';
import { MurflixLogo } from '@/components/layout/MurflixLogo';
import { publicApi } from '@/api/public';
import { MediaItem } from '@/types/tmdb';
import { SubscriptionPlan } from '@/types/auth';
import { getTMDBImageUrl, getDirectTMDBUrl } from '@/utils/image';
import { getMovieUrl, getTVUrl } from '@/utils/slug';
import { DEFAULT_STREAMING_SERVERS } from '@/constants/streamingServers';
import { triggerPWAInstallPrompt } from '@/components/pwa/InstallAppPrompt';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeCatalogTab, setActiveCatalogTab] = useState<'trending' | 'movies' | 'tv'>('trending');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [featuredItem, setFeaturedItem] = useState<MediaItem | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);

  // SEO setup
  useEffect(() => {
    document.title = 'Murflix - Nonton Streaming Film & Serial TV Kualitas 4K Sub Indo';

    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(attr);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', name);
        } else {
          el.setAttribute('name', name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', 'Streaming ribuan film box office, serial TV populer, anime, dan drama Asia kualitas 4K Ultra HD tanpa jeda iklan di Murflix. Nikmati pengalaman streaming cinema modern di semua perangkat.');
    updateMeta('keywords', 'streaming film, nonton film sub indo, streaming movie indonesia, nonton anime, serial tv online, nonton bioskop gratis, nonton film netflix, murflix');
    updateMeta('og:title', 'Murflix - Nonton Streaming Film & Serial TV Kualitas 4K Sub Indo', true);
    updateMeta('og:description', 'Streaming ribuan film box office, serial TV populer, anime, dan drama Asia kualitas 4K Ultra HD tanpa jeda iklan di Murflix.', true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch live public data
  useEffect(() => {
    const loadPublicData = async () => {
      try {
        const [trendRes, movRes, tvRes, planRes] = await Promise.allSettled([
          publicApi.getTrending(),
          publicApi.getPopularMovies(),
          publicApi.getPopularTV(),
          publicApi.getPlans(),
        ]);

        if (trendRes.status === 'fulfilled' && trendRes.value.results) {
          setTrending(trendRes.value.results);
          if (trendRes.value.results.length > 0) {
            setFeaturedItem(trendRes.value.results[0]);
          }
        }
        if (movRes.status === 'fulfilled' && movRes.value.results) {
          setPopularMovies(movRes.value.results);
        }
        if (tvRes.status === 'fulfilled' && tvRes.value.results) {
          setPopularTV(tvRes.value.results);
        }
        if (planRes.status === 'fulfilled' && planRes.value) {
          setPlans(planRes.value);
        }
      } catch (err) {
        console.error('Failed to load landing data:', err);
      }
    };

    loadPublicData();
  }, []);

  // Gatekeeper: Require login on click
  const handleItemClick = (item: MediaItem) => {
    const isTV = item.media_type === 'tv' || !!item.first_air_date;
    const title = item.title || item.name || '';
    const targetUrl = isTV ? getTVUrl(item.id, title) : getMovieUrl(item.id, title);
    navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
  };

  const handleAuthRedirect = (targetPath = '/') => {
    navigate(`/login?redirect=${encodeURIComponent(targetPath)}`);
  };

  const getCatalogItems = () => {
    if (activeCatalogTab === 'movies') return popularMovies.slice(0, 12);
    if (activeCatalogTab === 'tv') return popularTV.slice(0, 12);
    return trending.slice(0, 12);
  };

  const featuredTitle = featuredItem?.title || featuredItem?.name || 'Project Hail Mary';
  const featuredOverview = featuredItem?.overview || 'Koleksi ribuan film box office dunia dan serial TV eksklusif dengan kualitas gambar tajam dan audio sinematik tanpa jeda iklan.';
  const featuredBackdrop = featuredItem?.backdrop_path
    ? imageError
      ? getDirectTMDBUrl(featuredItem.backdrop_path, 'w1280')
      : getTMDBImageUrl(featuredItem.backdrop_path, 'w1280')
    : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1280&q=80';

  const faqs = [
    {
      q: 'Apa itu Murflix?',
      a: 'Murflix adalah platform streaming sinema digital generasi baru yang menyajikan ribuan film box office, serial TV populer, drama Asia, dan anime dengan kualitas visual hingga 4K Ultra HD dan audio spasial sinematik tanpa interupsi iklan.',
    },
    {
      q: 'Bagaimana cara mulai menonton di Murflix?',
      a: 'Cukup klik tombol "Masuk" atau "Mulai Nonton Sekarang", masuk menggunakan akun Anda atau aktifkan Akun Demo instan, lalu pilih film atau episode yang ingin Anda tonton langsung dari browser Anda.',
    },
    {
      q: 'Di perangkat apa saja Murflix dapat diakses?',
      a: 'Murflix dirancang responsif dan kompatibel dengan Smart TV, laptop, komputer desktop, tablet (iPad & Android), serta smartphone (iOS & Android) tanpa perlu menginstal aplikasi tambahan.',
    },
    {
      q: 'Apakah tayangan di Murflix terganggu oleh iklan komersial?',
      a: 'Tidak sama sekali. Semua tayangan di Murflix disajikan 100% bebas dari jeda iklan komersial sehingga pengalaman sinema Anda tetap fokus dan imersif.',
    },
    {
      q: 'Berapa banyak server pemutar video yang tersedia?',
      a: 'Murflix menyediakan multi-server streaming berkecepatan tinggi (VidLink, VidSrc, Embed.su, MoviesAPI, dll.) dengan fitur switch server otomatis jika salah satu sumber mengalami hambatan.',
    },
    {
      q: 'Apakah katalog konten di Murflix selalu diperbarui?',
      a: 'Ya, sistem kami terintegrasi secara langsung dengan basis data sinema global sehingga rilisan film terbaru, episode serial mingguan, dan judul trending selalu diperbarui setiap hari.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-[#e50914] selection:text-white font-sans overflow-x-hidden">
      {/* --------------------------------------------------------------------- */}
      {/* 1. Apple-Style Translucent Header Navigation                          */}
      {/* --------------------------------------------------------------------- */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a0a0c]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/80'
            : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <a href="#" className="flex items-center transition-transform hover:scale-105 active:scale-95" title="Murflix Streaming Hub">
              <MurflixLogo size="md" />
            </a>

            {/* Desktop Navigation Links (Apple Style Clean Typography) */}
            <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-wider text-gray-300 uppercase">
              <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
              <a href="#server" className="hover:text-white transition-colors">Server</a>
              <a href="#katalog" className="hover:text-white transition-colors">Katalog</a>
              <a href="#perangkat" className="hover:text-white transition-colors">Perangkat</a>
              <a href="#paket" className="hover:text-white transition-colors">Paket</a>
              <a href="#tentang" className="hover:text-white transition-colors">Tentang</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleAuthRedirect('/')}
                className="inline-flex items-center space-x-2 bg-[#e50914] hover:bg-red-700 text-white font-bold px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm tracking-wide shadow-lg shadow-red-600/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span>Masuk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* 2. Hero Section (Apple Pro Typography + Live Cinema Preview)          */}
      {/* --------------------------------------------------------------------- */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle Ambient Red Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Eyebrow Badge (No Dot) */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-6 sm:mb-8 text-xs font-semibold tracking-widest uppercase text-gray-300">
          <span>Generasi Baru Hiburan Sinema Digital</span>
        </div>

        {/* Massive Apple Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.08]">
          Bioskop Tanpa Batas.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-red-500">
            Di Mana Saja, Kapan Saja.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 sm:mt-8 text-base sm:text-xl text-gray-400 max-w-3xl mx-auto font-normal leading-relaxed">
          Streaming ribuan film box office, serial TV eksklusif, anime terpopuler, dan drama Asia dalam resolusi 4K Ultra HD dengan audio spasial tanpa jeda iklan.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={() => handleAuthRedirect('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-[#e50914] hover:bg-red-700 text-white font-bold px-7 py-3.5 rounded-full text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-xl shadow-red-600/30"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Mulai Nonton Sekarang</span>
          </button>
          <a
            href="#katalog"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-semibold px-6 py-3.5 rounded-full text-sm sm:text-base transition-all duration-300 backdrop-blur-md"
          >
            <span>Jelajahi Katalog</span>
            <ChevronDown className="w-4 h-4" />
          </a>
          <button
            onClick={triggerPWAInstallPrompt}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white font-semibold px-6 py-3.5 rounded-full text-sm sm:text-base transition-all duration-300 backdrop-blur-md cursor-pointer"
            title="Pasang aplikasi Murflix langsung di HP atau PC tanpa browser"
          >
            <Download className="w-4 h-4 text-red-500" />
            <span>Pasang Aplikasi (APK)</span>
          </button>
        </div>

        {/* Hardware Frame Cinema Mockup (Apple Style Curved Display) */}
        <div className="mt-14 sm:mt-20 relative max-w-5xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 bg-gradient-to-b from-white/20 via-white/5 to-transparent border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.9)]">
            <div className="relative w-full aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden bg-black group cursor-pointer"
                 onClick={() => featuredItem && handleItemClick(featuredItem)}>
              
              {/* Featured Backdrop */}
              <img
                src={featuredBackdrop}
                alt={featuredTitle}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.75]"
              />

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

              {/* Cinema Metadata & Play Button */}
              <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
                <div className="max-w-xl space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-red-500 uppercase tracking-widest">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>Tayangan Unggulan Minggu Ini</span>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                    {featuredTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed">
                    {featuredOverview}
                  </p>
                  <div className="flex items-center space-x-3 pt-1 text-[11px] font-semibold text-gray-400">
                    <span className="px-2 py-0.5 rounded border border-white/20 text-white">4K ULTRA HD</span>
                    <span className="px-2 py-0.5 rounded border border-white/20 text-white">DOLBY ATMOS</span>
                    <span className="text-emerald-400">99% Cocok</span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="inline-flex items-center space-x-3 bg-[#e50914] text-white font-bold px-6 py-3 rounded-full text-xs sm:text-sm shadow-xl shadow-red-600/50 group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-4 h-4 fill-current" />
                    <span>Tonton Trailer / Masuk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. Live Catalog Showcase (Movies & TV Series Tabs)                    */}
      {/* --------------------------------------------------------------------- */}
      <section id="katalog" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto [content-visibility:auto] [contain-intrinsic-size:0_750px]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">
              Koleksi Hiburan Terlengkap
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Jelajahi Film &amp; Serial TV Terbaru
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-2xl">
              Pilih dari ribuan judul populer. Klik judul manapun untuk masuk dan langsung menikmati tayangan full sinema.
            </p>
          </div>

          {/* Catalog Switcher Tabs */}
          <div className="flex items-center p-1 bg-zinc-900/90 border border-white/10 rounded-full self-start sm:self-auto">
            <button
              onClick={() => setActiveCatalogTab('trending')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                activeCatalogTab === 'trending'
                  ? 'bg-[#e50914] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveCatalogTab('movies')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                activeCatalogTab === 'movies'
                  ? 'bg-[#e50914] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Film Box Office
            </button>
            <button
              onClick={() => setActiveCatalogTab('tv')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                activeCatalogTab === 'tv'
                  ? 'bg-[#e50914] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Serial TV
            </button>
          </div>
        </div>

        {/* Movie / TV Grid (High-Performance GPU Optimized) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 [content-visibility:auto] [contain-intrinsic-size:0_650px] transform-gpu">
          {getCatalogItems().map((item) => {
            const title = item.title || item.name || 'Untitled';
            const poster = item.poster_path
              ? getTMDBImageUrl(item.poster_path, 'w342')
              : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=342&q=80';
            const year = (item.release_date || item.first_air_date || '').split('-')[0];
            const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
            const isTV = item.media_type === 'tv' || !!item.first_air_date;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-red-500/80 transition-[transform,border-color] duration-150 hover:scale-[1.02] cursor-pointer flex flex-col transform-gpu"
              >
                {/* Poster Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                  <img
                    src={poster}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Rating Badge */}
                  {rating && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-black/90 border border-white/10 flex items-center space-x-1 text-[11px] font-bold text-amber-400 shadow-md">
                      <Star className="w-3 h-3 fill-current text-amber-400" />
                      <span>{rating}</span>
                    </div>
                  )}

                  {/* Media Type Pill */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/90 text-[10px] font-bold uppercase tracking-wider text-gray-300 border border-white/10 shadow-md">
                    {isTV ? 'Serial TV' : 'Film'}
                  </div>

                  {/* Hover Overlay with Login Prompt */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-end p-4 text-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-[#e50914] text-white flex items-center justify-center mb-2 shadow-lg shadow-red-600/50">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                    <div className="flex items-center space-x-1 text-xs font-bold text-white">
                      <Lock className="w-3 h-3 text-red-500" />
                      <span>Masuk untuk Nonton</span>
                    </div>
                  </div>
                </div>

                {/* Info Text */}
                <div className="p-3 bg-zinc-950 flex-1 flex flex-col justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                    {title}
                  </h4>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-gray-400">
                    <span>{year || '2026'}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase">HD Cinema</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Catalog Banner Action */}
        <div className="mt-12 text-center">
          <button
            onClick={() => handleAuthRedirect('/browse/movies')}
            className="inline-flex items-center space-x-2 px-8 py-3 rounded-full bg-zinc-900 border border-white/15 text-white font-bold text-xs sm:text-sm hover:bg-zinc-800 hover:border-red-500/50 transition-all duration-300"
          >
            <span>Buka Seluruh Koleksi (10,000+ Judul)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. Bento Grid of Features (Apple-Style Innovation Cards)              */}
      {/* --------------------------------------------------------------------- */}
      <section id="fitur" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 [content-visibility:auto] [contain-intrinsic-size:0_600px]">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">
            Inovasi Tanpa Kompromi
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Fitur Canggih Standar Sinema Dunia
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-3 leading-relaxed">
            Didesain dengan arsitektur modern berkecepatan tinggi untuk menghadirkan kualitas visual terunggul dan kenyamanan penonton terbaik.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 4K Ultra HD (Spans 2 cols) */}
          <div className="md:col-span-2 rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-white/10 hover:border-red-500/30 transition-all duration-300 relative overflow-hidden group">
            <div className="relative z-10 max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Resolusi 4K Ultra HD &amp; HDR
              </h3>
              <p className="text-sm sm:text-base text-gray-400 mt-3 leading-relaxed">
                Visual kristal dengan ketajaman piksel tinggi, kontras warna mendalam, dan dukungan format 10-bit HDR yang membuat setiap adegan tampak nyata seperti di studio film.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-gray-300">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">3840 x 2160 Pixels</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">60 FPS Smooth Playback</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Warna Sinematik DCI-P3</span>
              </div>
            </div>
            {/* Visual Decorative */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none hidden sm:block bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/40 via-transparent to-transparent" />
          </div>

          {/* Card 2: Audio Spasial */}
          <div className="rounded-3xl p-8 sm:p-10 bg-zinc-950 border border-white/10 hover:border-red-500/30 transition-all duration-300 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Audio Spasial Sinematik
            </h3>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Tata suara surround multidimensi yang bergerak mengitari Anda, menghadirkan kedalaman vokal jernih dan dentuman efek suara yang menggelegar.
            </p>
          </div>

          {/* Card 3: Multi-Platform Sync */}
          <div className="rounded-3xl p-8 sm:p-10 bg-zinc-950 border border-white/10 hover:border-red-500/30 transition-all duration-300 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Sinkronisasi Multi-Perangkat
            </h3>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Mulai menonton di TV ruang keluarga, lalu lanjutkan di smartphone atau laptop Anda tepat di menit terakhir yang sama tanpa repot.
            </p>
          </div>

          {/* Card 4: Download & Putar Offline */}
          <div className="rounded-3xl p-8 sm:p-10 bg-zinc-950 border border-white/10 hover:border-red-500/30 transition-all duration-300 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Mode Putar Fleksibel
            </h3>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Dukungan pemutar video modern dengan multi-subtitle bahasa Indonesia, pilihan audio ganda, dan mode cinema layar penuh tanpa distorsi.
            </p>
          </div>

          {/* Card 5: 100% Zero Ads & Ultra Fast Buffer (Spans 2 cols on mobile/desktop) */}
          <div className="md:col-span-1 rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-white/10 hover:border-red-500/30 transition-all duration-300 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              100% Tanpa Iklan
            </h3>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Bebas dari segala jenis pop-up, iklan video jeda tengah, atau redirect menjengkelkan. Pengalaman streaming Anda murni hiburan.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4.5. Multi-Server Streaming Infrastructure (Zero Ads & 11 Servers)    */}
      {/* --------------------------------------------------------------------- */}
      <section id="server" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 [content-visibility:auto] [contain-intrinsic-size:0_600px]">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">
            Infrastruktur &amp; Pemutar Video
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            11 Pilihan Server Streaming Global
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-3 leading-relaxed">
            Didukung jaringan 11 server embed tercepat di dunia. Anda dapat berpindah server secara instan langsung dari video player jika salah satu sumber mengalami hambatan jaringan.
          </p>
        </div>

        {/* Server Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {DEFAULT_STREAMING_SERVERS.map((server, idx) => {
            const isAdFree =
              server.description?.toLowerCase().includes('zero') ||
              server.description?.toLowerCase().includes('no ads') ||
              server.description?.toLowerCase().includes('ad-free');

            return (
              <div
                key={server.id}
                className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-zinc-700 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-500">
                    SERVER {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isAdFree ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {isAdFree ? 'Ad-Free' : 'HD Stream'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">
                  {server.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {server.description || 'Fast video stream'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Server Features Bar */}
        <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs sm:text-sm text-zinc-300">
            <Server className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>
              <strong>Fitur Failover Instan:</strong> Pemutar video menyediakan tombol switch server sekali klik untuk menjamin film tetap berputar lancar tanpa buffering.
            </span>
          </div>
          <button
            onClick={() => handleAuthRedirect('/')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer"
          >
            <span>Coba Pemutar Video</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 5. Supported Devices (Apple Style Hardware Lineup)                    */}
      {/* --------------------------------------------------------------------- */}
      <section id="perangkat" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 [content-visibility:auto] [contain-intrinsic-size:0_600px]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">
            Kompatibilitas Luas
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Nonton di Semua Perangkat Favorit Anda
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-3">
            Dari layar bioskop TV raksasa hingga layar genggam smartphone, Murflix menyesuaikan tampilan dengan rasio visual sempurna.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Smart TV */}
          <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/10 text-center hover:border-red-500/30 transition-all duration-300">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 mb-6">
              <Tv className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Smart TV</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Samsung Tizen, LG webOS, Android TV, Google TV, Apple TV, dan Chromecast.
            </p>
          </div>

          {/* Komputer & Laptop */}
          <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/10 text-center hover:border-red-500/30 transition-all duration-300">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 mb-6">
              <Laptop className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Komputer &amp; Laptop</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              macOS, Windows PC, Linux, dan Chrome OS melalui semua peramban web modern.
            </p>
          </div>

          {/* Tablet */}
          <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/10 text-center hover:border-red-500/30 transition-all duration-300">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 mb-6">
              <Tablet className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Tablet</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Apple iPad, Samsung Galaxy Tab, dan tablet Android dengan layar Retina tajam.
            </p>
          </div>

          {/* Smartphone */}
          <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/10 text-center hover:border-red-500/30 transition-all duration-300">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 mb-6">
              <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Smartphone</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              iPhone (iOS) dan semua ponsel Android dengan navigasi sentuh satu tangan yang intuitif.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 6. Pricing Plans Showcase                                             */}
      {/* --------------------------------------------------------------------- */}
      <section id="paket" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 [content-visibility:auto] [contain-intrinsic-size:0_600px]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">
            Pilihan Paket Berlangganan
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Investasi Terjangkau untuk Hiburan Tanpa Batas
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-3">
            Pilih paket yang paling sesuai dengan kebutuhan tontonan harian atau keluarga Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(plans.length > 0
            ? plans
            : [
                {
                  id: 1,
                  name: 'Paket Basic',
                  price: 15000,
                  duration_unit: 'months',
                  duration_value: 1,
                  description: 'Ideal untuk penonton solo di layar ponsel dan laptop.',
                },
                {
                  id: 2,
                  name: 'Paket Standard Pro',
                  price: 25000,
                  duration_unit: 'months',
                  duration_value: 1,
                  description: 'Paling diminati! Nonton di 2 layar bersamaan resolusi Full HD.',
                },
                {
                  id: 3,
                  name: 'Paket Ultimate VIP 4K',
                  price: 50000,
                  duration_unit: 'months',
                  duration_value: 1,
                  description: 'Kualitas tertinggi 4K HDR + Dolby Atmos untuk seluruh keluarga.',
                },
              ]
          ).map((plan, idx) => {
            const isFeatured = idx === 1 || plan.name.toLowerCase().includes('standard') || plan.name.toLowerCase().includes('vip');

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? 'bg-gradient-to-b from-zinc-900 to-black border-2 border-red-600 shadow-2xl shadow-red-600/30 md:-translate-y-2'
                    : 'bg-zinc-950 border border-white/10 hover:border-white/20'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#e50914] text-white text-xs font-extrabold uppercase tracking-widest shadow-md">
                    Paling Populer
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-gray-400 mt-2 min-h-[36px]">
                    {plan.description || 'Akses tak terbatas ke seluruh film dan serial TV.'}
                  </p>

                  <div className="mt-6 flex items-baseline space-x-2">
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      Rp {plan.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold uppercase">
                      /{plan.duration_value} {plan.duration_unit === 'months' ? 'Bulan' : plan.duration_unit}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-3.5 text-xs sm:text-sm text-gray-300">
                    <li className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Akses ke 10,000+ film &amp; serial TV</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>100% bebas jeda iklan komersial</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{isFeatured ? 'Kualitas 4K Ultra HD & Dolby Atmos' : 'Kualitas Full HD 1080p'}</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{isFeatured ? 'Dukungan hingga 4 perangkat simultan' : 'Dukungan 1 perangkat aktif'}</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Subtitle lengkap Bahasa Indonesia</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleAuthRedirect('/login')}
                  className={`mt-10 w-full py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 ${
                    isFeatured
                      ? 'bg-[#e50914] hover:bg-red-700 text-white shadow-lg shadow-red-600/40 hover:scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Pilih Paket Ini
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 7. Tentang Murflix (Comprehensive Vision & Trust Section)             */}
      {/* --------------------------------------------------------------------- */}
      <section id="tentang" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 [content-visibility:auto] [contain-intrinsic-size:0_600px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">
              Tentang Murflix
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Platform Sinema Digital yang Mengutamakan Kepuasan Penonton.
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mt-6 leading-relaxed">
              Murflix didirikan dengan visi sederhana: memberikan akses termudah dan ternyaman bagi masyarakat Indonesia untuk menikmati mahakarya perfilman dunia tanpa hambatan teknis, tanpa jeda iklan yang merusak alur cerita, dan dengan kualitas tayang tertinggi.
            </p>
            <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed">
              Kami memadukan infrastruktur server terdistribusi dengan algoritma kompresi mutakhir sehingga Anda dapat menikmati tayangan 4K beresolusi tajam bahkan dengan kuota internet hemat dan koneksi standar.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white">10,000+</div>
                <div className="text-xs text-gray-400 mt-1 uppercase font-semibold">Judul Film &amp; Serial</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-red-500">99.9%</div>
                <div className="text-xs text-gray-400 mt-1 uppercase font-semibold">Uptime Server Global</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white">0%</div>
                <div className="text-xs text-gray-400 mt-1 uppercase font-semibold">Iklan Mengganggu</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-zinc-900 to-black border border-white/10 space-y-6">
            <h3 className="text-xl font-black text-white">Komitmen Keamanan &amp; Kualitas Kami</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Privasi Pengguna Terjamin</h4>
                  <p className="text-xs text-gray-400 mt-1">Kami tidak menjual data pribadi dan tidak menyematkan pelacak berbahaya ke dalam browser Anda.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0 mt-0.5">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Server Pemutar Berkecepatan Tinggi</h4>
                  <p className="text-xs text-gray-400 mt-1">Integrasi dengan multi-CDN server tercepat di Asia Tenggara untuk menjamin buffer minim di bawah satu detik.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0 mt-0.5">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Subtitle Akurat Bahasa Indonesia</h4>
                  <p className="text-xs text-gray-400 mt-1">Terjemahan kontekstual yang nyaman dibaca dengan sinkronisasi waktu akurat per dialog.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 8. FAQ Section (Apple-Style Accordion)                                */}
      {/* --------------------------------------------------------------------- */}
      <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/5 [content-visibility:auto] [contain-intrinsic-size:0_600px]">
        <div className="text-center mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">
            Pertanyaan Umum
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Kerap Ditanyakan (FAQ)
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-3">
            Semua hal yang perlu Anda ketahui sebelum mulai menikmati tayangan di Murflix.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaqIndex === index;

            return (
              <div
                key={index}
                className="rounded-2xl bg-zinc-950/80 border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between space-x-4 focus:outline-none"
                >
                  <span className="text-base sm:text-lg font-bold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-red-500 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-gray-300 leading-relaxed border-t border-white/5 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 9. Final Call to Action Banner (Apple Style High Impact)               */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/40 via-zinc-900 to-black p-10 sm:p-16 border border-red-500/30 text-center">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-6xl font-black tracking-tight text-white">
              Siap Merasakan Sensasi Sinema yang Sesungguhnya?
            </h2>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              Daftar sekarang atau masuk menggunakan akun Anda untuk membuka seluruh akses pustaka film dan serial TV kualitas 4K tanpa batasan.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleAuthRedirect('/')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 bg-[#e50914] hover:bg-red-700 text-white font-bold px-10 py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:scale-105 shadow-2xl shadow-red-600/50"
              >
                <span>Mulai Nonton Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 10. Polished Comprehensive Footer                                      */}
      {/* --------------------------------------------------------------------- */}
      <footer className="border-t border-white/10 bg-black py-16 px-4 sm:px-6 lg:px-8 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <MurflixLogo size="sm" />
            <p className="text-gray-400 leading-relaxed">
              Murflix adalah platform streaming film dan serial TV kualitas 4K Ultra HD subtitle Indonesia tanpa jeda iklan.
            </p>
            <div className="text-[11px] text-zinc-500">
              Hak Cipta &copy; {new Date().getFullYear()} Murflix Entertainment. Semua Hak Dilindungi.
            </div>
          </div>

          {/* Col 2: Navigasi */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Navigasi Sinema</h4>
            <ul className="space-y-2.5">
              <li><a href="#katalog" className="hover:text-white transition-colors">Film Populer</a></li>
              <li><a href="#katalog" className="hover:text-white transition-colors">Serial TV Teratas</a></li>
              <li><a href="#fitur" className="hover:text-white transition-colors">Kualitas 4K HDR</a></li>
              <li><a href="#perangkat" className="hover:text-white transition-colors">Dukungan Perangkat</a></li>
            </ul>
          </div>

          {/* Col 3: Informasi & Layanan */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Informasi</h4>
            <ul className="space-y-2.5">
              <li><a href="#tentang" className="hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="#paket" className="hover:text-white transition-colors">Paket Berlangganan</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Pusat Bantuan &amp; FAQ</a></li>
              <li><button onClick={() => handleAuthRedirect('/')} className="hover:text-white transition-colors text-left">Login Member</button></li>
            </ul>
          </div>

          {/* Col 4: Disclaimer & Legal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Ketentuan &amp; Privasi</h4>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              Katalog film dan metadata disediakan melalui integrasi API basis data TMDB. Murflix tidak menyimpan file media di server internal, seluruh pemutaran video menggunakan tautan streaming pihak ketiga yang sah.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

