import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { AnalyticsOverview, VisitorCoordinate } from '@/types/analytics';
import {
  Activity,
  Users,
  Eye,
  Globe,
  MapPin,
  Compass,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Clock,
  Radio,
  Sliders,
  Server,
  Shield,
  Layers,
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorCoordinate | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchOverview = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const res = await adminApi.getAnalyticsOverview();
      setData(res);
      setLastUpdated(new Date());
      if (res.recent_visitors && res.recent_visitors.length > 0 && !selectedVisitor) {
        setSelectedVisitor(res.recent_visitors[0]);
      }
    } catch (err) {
      console.error('Failed to load analytics overview:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview(true);
    // Auto-refresh every 15 seconds for real-time monitoring
    const interval = setInterval(() => {
      fetchOverview(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes('mobile')) return <Smartphone className="w-3.5 h-3.5 text-blue-400" />;
    if (d.includes('tablet')) return <Tablet className="w-3.5 h-3.5 text-purple-400" />;
    if (d.includes('tv')) return <Tv className="w-3.5 h-3.5 text-amber-400" />;
    return <Monitor className="w-3.5 h-3.5 text-emerald-400" />;
  };

  // Convert (lat, lon) to SVG percentages (Equirectangular)
  const coordsToSvg = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return {
      x: Math.max(3, Math.min(97, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pelacakan Pengunjung & Geolokasi Real-Time
            </h1>
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[11px] font-bold text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Deteksi IP, titik koordinat geografis, perangkat, browser, ISP, dan aktivitas akses seluruh pengunjung Murflix secara akurat.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchOverview(false)}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
            <span>Segarkan</span>
          </button>
          <Link
            to="/admin/analytics/logs"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          >
            <span>Buka Tabel Log Lengkap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Active Visitors Now */}
        <div className="bg-[#141416] border border-red-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Aktif Saat Ini</span>
            </span>
            <Radio className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white mt-2">
            {data?.active_visitors || 0}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Dalam 5 menit terakhir</p>
        </div>

        {/* Total Pageviews Today */}
        <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Kunjungan Hari Ini</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{data?.visits_today || 0}</p>
          <p className="text-[11px] text-zinc-500 font-mono">Total Semua: {data?.total_visits || 0}</p>
        </div>

        {/* Unique IPs Today */}
        <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Pengunjung Unik (IP)</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">{data?.unique_ips_today || 0}</p>
          <p className="text-[11px] text-zinc-500 font-mono">Total Unik: {data?.unique_ips || 0}</p>
        </div>

        {/* Top Country */}
        <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Negara Terbanyak</span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white truncate">
            {data?.top_countries && data.top_countries.length > 0
              ? `${data.top_countries[0].country}`
              : 'N/A'}
          </p>
          <p className="text-[11px] text-zinc-500">
            {data?.top_countries && data.top_countries.length > 0
              ? `${data.top_countries[0].count} Kunjungan (${data.top_countries[0].percentage.toFixed(1)}%)`
              : '0 Kunjungan'}
          </p>
        </div>

        {/* Dominant Device */}
        <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Perangkat Dominan</span>
            <Monitor className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white truncate">
            {data?.top_devices && data.top_devices.length > 0
              ? data.top_devices[0].device_type
              : 'Desktop'}
          </p>
          <p className="text-[11px] text-zinc-500">
            {data?.top_devices && data.top_devices.length > 0
              ? `${data.top_devices[0].count} Pengguna (${data.top_devices[0].percentage.toFixed(1)}%)`
              : '0 Pengguna'}
          </p>
        </div>
      </div>

      {/* Interactive Geolocation Radar Map & Selected Visitor Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* World Map Radar View (Col-Span 2) */}
        <div className="lg:col-span-2 bg-[#121215] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <Compass className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-base font-bold text-white">Peta Sebaran Titik Koordinat Pengunjung</h3>
                <p className="text-xs text-zinc-400">
                  Plot koordinat astronomis (Lintang & Bujur) dari pengunjung yang terdeteksi
                </p>
              </div>
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center space-x-2">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Pengunjung</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span>Terpilih</span>
              </span>
            </div>
          </div>

          {/* Map Canvas with Grid Lines */}
          <div className="relative w-full aspect-[1.8/1] bg-[#09090b] rounded-2xl border border-zinc-800 overflow-hidden shadow-inner">
            {/* Subtle Latitude/Longitude Grid Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="w-full h-full grid grid-cols-12 grid-rows-6 border border-zinc-700/50">
                {Array.from({ length: 72 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-zinc-700/40" />
                ))}
              </div>
            </div>

            {/* Continents Outline Background (Stylized World Vector) */}
            <svg
              viewBox="0 0 1000 500"
              className="absolute inset-0 w-full h-full opacity-15 text-zinc-600 fill-current pointer-events-none"
            >
              {/* North America */}
              <path d="M 150,80 Q 220,70 280,120 Q 290,180 230,220 Q 180,260 140,200 Z" />
              {/* South America */}
              <path d="M 280,260 Q 340,300 320,380 Q 280,440 250,380 Q 240,300 280,260 Z" />
              {/* Europe */}
              <path d="M 480,90 Q 560,80 580,140 Q 530,170 480,150 Z" />
              {/* Africa */}
              <path d="M 480,180 Q 560,190 580,260 Q 560,360 500,380 Q 450,260 480,180 Z" />
              {/* Asia */}
              <path d="M 600,80 Q 820,70 880,160 Q 850,260 740,240 Q 640,220 600,150 Z" />
              {/* Indonesia / SE Asia */}
              <circle cx="750" cy="300" r="14" />
              <circle cx="780" cy="315" r="18" />
              <circle cx="820" cy="310" r="22" />
              {/* Australia */}
              <path d="M 780,360 Q 870,350 880,410 Q 820,450 770,410 Z" />
            </svg>

            {/* Plotted Visitor Pinpoints */}
            {data?.recent_visitors?.map((visitor) => {
              const pos = coordsToSvg(visitor.latitude, visitor.longitude);
              const isSelected = selectedVisitor?.id === visitor.id;

              return (
                <div
                  key={visitor.id}
                  onClick={() => setSelectedVisitor(visitor)}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 transition-transform hover:scale-150"
                  title={`${visitor.city}, ${visitor.country} (${visitor.ip_address})`}
                >
                  {/* Radar Pulse ring */}
                  <span
                    className={`absolute -inset-2 rounded-full animate-ping opacity-60 ${
                      isSelected ? 'bg-yellow-400' : 'bg-red-500'
                    }`}
                  />
                  {/* Core Pin */}
                  <span
                    className={`relative block w-3 h-3 rounded-full border shadow-lg ${
                      isSelected
                        ? 'bg-yellow-400 border-white ring-2 ring-yellow-400/50'
                        : 'bg-[#e50914] border-white/80'
                    }`}
                  />

                  {/* Hover Mini Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-black/95 text-white text-[10px] font-sans rounded-lg px-2.5 py-1.5 shadow-xl border border-zinc-700 pointer-events-none z-30">
                    <p className="font-bold text-red-400">{visitor.city || 'Kota'}, {visitor.country}</p>
                    <p className="text-zinc-300 font-mono text-[9px]">{visitor.ip_address}</p>
                    <p className="text-zinc-400 text-[9px]">Lat: {visitor.latitude.toFixed(4)}, Lon: {visitor.longitude.toFixed(4)}</p>
                  </div>
                </div>
              );
            })}

            {/* Map Legend & Summary Overlay */}
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-zinc-800 rounded-xl px-3 py-1.5 text-[11px] text-zinc-400 font-mono">
              Koordinat terdeteksi: {data?.recent_visitors?.length || 0} titik
            </div>
          </div>

          {/* Interactive OpenStreetMap Coordinate Live Inspector for Selected Visitor */}
          {selectedVisitor && (
            <div className="bg-[#161619] border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-white">
                    Koordinat Presisi: {selectedVisitor.latitude.toFixed(6)}, {selectedVisitor.longitude.toFixed(6)}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                    {selectedVisitor.city}, {selectedVisitor.country}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  ISP: <span className="text-zinc-200">{selectedVisitor.isp}</span> | Akses: <code className="text-red-400">{selectedVisitor.path}</code>
                </p>
              </div>

              <a
                href={`https://www.google.com/maps?q=${selectedVisitor.latitude},${selectedVisitor.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-colors whitespace-nowrap"
              >
                <span>Lihat di Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Selected Visitor Live Dossier / Details (Col-Span 1) */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>Detail Intelijen Pengunjung</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">Detail Lengkap</span>
            </div>

            {selectedVisitor ? (
              <div className="mt-4 space-y-3.5 text-xs">
                {/* IP Address */}
                <div className="bg-black/40 border border-zinc-800 rounded-xl p-3">
                  <span className="text-zinc-400 block text-[11px]">Alamat IP Publik</span>
                  <span className="text-sm font-bold font-mono text-white tracking-wide">
                    {selectedVisitor.ip_address}
                  </span>
                </div>

                {/* Country & City */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/40 border border-zinc-800 rounded-xl p-3">
                    <span className="text-zinc-400 block text-[11px]">Kota / Daerah</span>
                    <span className="font-bold text-white truncate block">
                      {selectedVisitor.city || 'N/A'}
                    </span>
                    <span className="text-[10px] text-zinc-500">{selectedVisitor.region}</span>
                  </div>
                  <div className="bg-black/40 border border-zinc-800 rounded-xl p-3">
                    <span className="text-zinc-400 block text-[11px]">Negara</span>
                    <span className="font-bold text-white truncate block">
                      {selectedVisitor.country} ({selectedVisitor.country_code})
                    </span>
                  </div>
                </div>

                {/* Exact Coordinates */}
                <div className="bg-black/40 border border-zinc-800 rounded-xl p-3 space-y-1">
                  <span className="text-zinc-400 block text-[11px]">Titik Koordinat Geografis (GPS)</span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div>
                      <span className="text-zinc-500 text-[10px]">Latitude (Lintang):</span>
                      <p className="text-amber-400 font-bold">{selectedVisitor.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px]">Longitude (Bujur):</span>
                      <p className="text-amber-400 font-bold">{selectedVisitor.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                </div>

                {/* ISP / Provider */}
                <div className="bg-black/40 border border-zinc-800 rounded-xl p-3">
                  <span className="text-zinc-400 block text-[11px]">Internet Service Provider (ISP)</span>
                  <span className="font-semibold text-zinc-200 block truncate">
                    {selectedVisitor.isp || 'Unknown ISP'}
                  </span>
                </div>

                {/* Device & Browser */}
                <div className="bg-black/40 border border-zinc-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[11px]">Perangkat & Sistem Operasi</span>
                    <div className="flex items-center space-x-1">
                      {getDeviceIcon(selectedVisitor.device_type)}
                      <span className="text-zinc-300 font-semibold">{selectedVisitor.device_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">OS:</span>
                    <span className="text-white font-medium">{selectedVisitor.os}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Browser:</span>
                    <span className="text-white font-medium">{selectedVisitor.browser}</span>
                  </div>
                </div>

                {/* Access Path */}
                <div className="bg-black/40 border border-zinc-800 rounded-xl p-3">
                  <span className="text-zinc-400 block text-[11px]">Halaman Terakhir Diakses</span>
                  <span className="font-mono text-red-400 break-all block mt-0.5">
                    {selectedVisitor.path}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Pilih salah satu titik di peta untuk melihat detail pengunjung.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Terakhir diperbarui:</span>
            <span>{lastUpdated.toLocaleTimeString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Breakdowns: Top Countries, Top Cities, Devices, Top Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Top Countries */}
        <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Globe className="w-4 h-4 text-red-500" />
              <span>Top 10 Negara</span>
            </h4>
            <span className="text-xs text-zinc-500 font-mono">Kunjungan</span>
          </div>
          <div className="space-y-2.5">
            {data?.top_countries?.map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium truncate">{c.country} ({c.country_code})</span>
                  <span className="font-bold text-white font-mono">{c.count}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, c.percentage))}%` }}
                  />
                </div>
              </div>
            ))}
            {(!data?.top_countries || data.top_countries.length === 0) && (
              <p className="text-xs text-zinc-500 text-center py-4">Belum ada data negara</p>
            )}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Top 10 Kota</span>
            </h4>
            <span className="text-xs text-zinc-500 font-mono">Kunjungan</span>
          </div>
          <div className="space-y-2.5">
            {data?.top_cities?.map((city, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/40 last:border-0">
                <div className="min-w-0 pr-2">
                  <p className="text-zinc-200 font-semibold truncate">{city.city}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{city.country}</p>
                </div>
                <span className="font-bold text-emerald-400 font-mono flex-shrink-0">{city.count}</span>
              </div>
            ))}
            {(!data?.top_cities || data.top_cities.length === 0) && (
              <p className="text-xs text-zinc-500 text-center py-4">Belum ada data kota</p>
            )}
          </div>
        </div>

        {/* Top Devices & Browsers */}
        <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-purple-400" />
              <span>Perangkat & Browser</span>
            </h4>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Tipe Perangkat</p>
              <div className="space-y-1.5">
                {data?.top_devices?.map((dev, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 flex items-center space-x-1.5">
                      {getDeviceIcon(dev.device_type)}
                      <span>{dev.device_type}</span>
                    </span>
                    <span className="font-mono text-zinc-400 font-bold">
                      {dev.count} ({dev.percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/60">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Browser Teratas</p>
              <div className="space-y-1.5">
                {data?.top_browsers?.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 truncate">{b.browser}</span>
                    <span className="font-mono text-zinc-400 font-bold">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Visited Pages */}
        <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Halaman Terpopuler</span>
            </h4>
            <span className="text-xs text-zinc-500 font-mono">Akses</span>
          </div>
          <div className="space-y-2">
            {data?.top_paths?.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/40 last:border-0">
                <span className="text-zinc-300 font-mono truncate max-w-[170px]" title={p.path}>
                  {p.path}
                </span>
                <span className="font-bold text-blue-400 font-mono flex-shrink-0">{p.count}</span>
              </div>
            ))}
            {(!data?.top_paths || data.top_paths.length === 0) && (
              <p className="text-xs text-zinc-500 text-center py-4">Belum ada rekaman halaman</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

