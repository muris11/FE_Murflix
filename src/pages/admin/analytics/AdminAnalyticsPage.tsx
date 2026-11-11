import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { AnalyticsOverview, VisitorCoordinate } from '@/types/analytics';
import {
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
    const interval = setInterval(() => {
      fetchOverview(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes('mobile')) return <Smartphone className="w-4 h-4 text-zinc-400" />;
    if (d.includes('tablet')) return <Tablet className="w-4 h-4 text-zinc-400" />;
    if (d.includes('tv')) return <Tv className="w-4 h-4 text-zinc-400" />;
    return <Monitor className="w-4 h-4 text-zinc-400" />;
  };

  // Convert (lat, lon) to SVG percentages (Equirectangular)
  const coordsToSvg = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return {
      x: Math.max(2, Math.min(98, x)),
      y: Math.max(3, Math.min(97, y)),
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-600 border-t-red-600 animate-spin" />
      </div>
    );
  }

  const topCountry = data?.top_countries?.[0];
  const topDevice = data?.top_devices?.[0];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Pelacakan Pengunjung &amp; Geolokasi
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pantau sebaran geografis, koordinat presisi, perangkat, dan aktivitas pengunjung secara real-time.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => fetchOverview(false)}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
            <span>Segarkan</span>
          </button>
          <Link
            to="/admin/analytics/logs"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-colors"
          >
            <span>Tabel Log Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Active Visitors */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 space-y-1">
          <span className="text-xs font-medium text-zinc-400 block">Pengunjung Aktif</span>
          <p className="text-3xl font-bold text-white tracking-tight">
            {data?.active_visitors || 0}
          </p>
          <p className="text-[11px] text-zinc-500">5 menit terakhir</p>
        </div>

        {/* Total Pageviews */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 space-y-1">
          <span className="text-xs font-medium text-zinc-400 block">Kunjungan Hari Ini</span>
          <p className="text-3xl font-bold text-white tracking-tight">
            {data?.visits_today || 0}
          </p>
          <p className="text-[11px] text-zinc-500">Total akumulasi: {data?.total_visits || 0}</p>
        </div>

        {/* Unique IPs */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 space-y-1">
          <span className="text-xs font-medium text-zinc-400 block">IP Unik</span>
          <p className="text-3xl font-bold text-white tracking-tight">
            {data?.unique_ips_today || 0}
          </p>
          <p className="text-[11px] text-zinc-500">Total IP unik: {data?.unique_ips || 0}</p>
        </div>

        {/* Top Country */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 space-y-1">
          <span className="text-xs font-medium text-zinc-400 block">Negara Terbanyak</span>
          <p className="text-xl font-bold text-white truncate tracking-tight">
            {topCountry?.country || 'N/A'}
          </p>
          <p className="text-[11px] text-zinc-500">
            {topCountry ? `${topCountry.count} kunjungan (${topCountry.percentage.toFixed(0)}%)` : 'Belum ada data'}
          </p>
        </div>

        {/* Dominant Device */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 space-y-1">
          <span className="text-xs font-medium text-zinc-400 block">Perangkat Utama</span>
          <p className="text-xl font-bold text-white truncate tracking-tight">
            {topDevice?.device_type || 'Desktop'}
          </p>
          <p className="text-[11px] text-zinc-500">
            {topDevice ? `${topDevice.count} pengguna (${topDevice.percentage.toFixed(0)}%)` : 'Desktop'}
          </p>
        </div>

      </div>

      {/* Main Radar Map & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* World Map Radar View (Col-Span 2) */}
        <div className="lg:col-span-2 bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Peta Sebaran Koordinat Pengunjung
              </h2>
              <p className="text-xs text-zinc-400">
                Peta ekuirektangular global dengan titik koordinat astronomis pengunjung
              </p>
            </div>
            
            <div className="text-xs text-zinc-400 flex items-center space-x-3 font-medium">
              <span className="text-red-400">Merah: Pengunjung</span>
              <span className="text-amber-400">Kuning: Terpilih</span>
            </div>
          </div>

          {/* Accurate World Map Canvas */}
          <div className="relative w-full aspect-[2/1] bg-[#09090b] rounded-xl border border-zinc-800/80 overflow-hidden">
            
            {/* Real World Vector SVG Image */}
            <img
              src="/world-map.svg"
              alt="World Map"
              className="absolute inset-0 w-full h-full object-fill opacity-35 select-none pointer-events-none"
            />

            {/* Subtle Grid Coordinates Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="w-full h-full grid grid-cols-12 grid-rows-6">
                {Array.from({ length: 72 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-zinc-600" />
                ))}
              </div>
            </div>

            {/* Plotted Visitor Pinpoints */}
            {data?.recent_visitors?.map((visitor) => {
              const pos = coordsToSvg(visitor.latitude, visitor.longitude);
              const isSelected = selectedVisitor?.id === visitor.id;

              return (
                <button
                  type="button"
                  key={visitor.id}
                  onClick={() => setSelectedVisitor(visitor)}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 p-1 group focus:outline-none"
                  title={`${visitor.city}, ${visitor.country} (${visitor.ip_address})`}
                >
                  <span
                    className={`block w-2.5 h-2.5 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-amber-400 border-white scale-125 ring-2 ring-amber-400/50'
                        : 'bg-red-600 border-white/80 group-hover:scale-125'
                    }`}
                  />
                  
                  {/* Tooltip on Hover */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-max max-w-[220px] bg-zinc-900 text-white text-[10px] rounded px-2 py-1 shadow-lg border border-zinc-700 pointer-events-none z-30 font-sans">
                    <p className="font-semibold text-zinc-100">{visitor.city || 'Kota'}, {visitor.country}</p>
                    <p className="text-zinc-400 font-mono text-[9px]">{visitor.ip_address}</p>
                  </div>
                </button>
              );
            })}

            {/* Coordinates Summary */}
            <div className="absolute bottom-2.5 left-2.5 bg-black/70 border border-zinc-800 rounded px-2.5 py-1 text-[11px] text-zinc-400 font-mono">
              Koordinat terdeteksi: {data?.recent_visitors?.length || 0}
            </div>
          </div>

          {/* Quick Google Maps Bar for Selected Visitor */}
          {selectedVisitor && (
            <div className="border border-zinc-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e0e11]">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-white">
                  Koordinat: {selectedVisitor.latitude.toFixed(6)}, {selectedVisitor.longitude.toFixed(6)} ({selectedVisitor.city || 'Kota'}, {selectedVisitor.country})
                </p>
                <p className="text-[11px] text-zinc-400">
                  Provider: {selectedVisitor.isp} | Jalur: {selectedVisitor.path}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps?q=${selectedVisitor.latitude},${selectedVisitor.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <span>Lihat di Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </a>
            </div>
          )}
        </div>

        {/* Selected Visitor Inspector (Col-Span 1) */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-zinc-800/80 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Detail Pengunjung
              </h2>
              <span className="text-[11px] text-zinc-500 font-mono">Intelijen Akses</span>
            </div>

            {selectedVisitor ? (
              <div className="mt-4 space-y-3 text-xs divide-y divide-zinc-800/50">
                
                {/* IP Address */}
                <div className="pt-2 first:pt-0">
                  <span className="text-[11px] text-zinc-500 block">Alamat IP Publik</span>
                  <span className="font-mono font-semibold text-white text-sm">
                    {selectedVisitor.ip_address}
                  </span>
                </div>

                {/* Location */}
                <div className="pt-2">
                  <span className="text-[11px] text-zinc-500 block">Lokasi Geografis</span>
                  <span className="text-zinc-200 font-medium block">
                    {selectedVisitor.city || 'N/A'}, {selectedVisitor.region}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {selectedVisitor.country} ({selectedVisitor.country_code})
                  </span>
                </div>

                {/* GPS Coordinates */}
                <div className="pt-2">
                  <span className="text-[11px] text-zinc-500 block">Koordinat Astronomis</span>
                  <p className="font-mono text-zinc-200 text-xs mt-0.5">
                    Lat: {selectedVisitor.latitude.toFixed(6)} | Lon: {selectedVisitor.longitude.toFixed(6)}
                  </p>
                </div>

                {/* ISP */}
                <div className="pt-2">
                  <span className="text-[11px] text-zinc-500 block">Penyedia Layanan (ISP)</span>
                  <span className="text-zinc-200 font-medium block truncate">
                    {selectedVisitor.isp || 'N/A'}
                  </span>
                </div>

                {/* Device & Browser */}
                <div className="pt-2 space-y-1">
                  <span className="text-[11px] text-zinc-500 block">Perangkat &amp; Browser</span>
                  <div className="flex items-center space-x-2 text-zinc-200 font-medium">
                    {getDeviceIcon(selectedVisitor.device_type)}
                    <span>{selectedVisitor.device_type}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Sistem Operasi: {selectedVisitor.os}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Peramban: {selectedVisitor.browser}
                  </p>
                </div>

                {/* Path Accessed */}
                <div className="pt-2">
                  <span className="text-[11px] text-zinc-500 block">Halaman Terakhir</span>
                  <span className="font-mono text-zinc-300 block break-all text-[11px] mt-0.5">
                    {selectedVisitor.path}
                  </span>
                </div>

                {/* Timestamp */}
                <div className="pt-2">
                  <span className="text-[11px] text-zinc-500 block">Waktu Akses</span>
                  <span className="text-zinc-400 text-[11px]">
                    {new Date(selectedVisitor.created_at).toLocaleString('id-ID')}
                  </span>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Pilih titik pada peta untuk melihat detail pengunjung.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Pembaruan otomatis</span>
            <span>{lastUpdated.toLocaleTimeString('id-ID')}</span>
          </div>
        </div>

      </div>

      {/* Breakdowns: Top Countries, Top Cities, Devices, Top Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Top Countries */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <h3 className="text-xs font-semibold text-white">Top 10 Negara</h3>
            <span className="text-[10px] text-zinc-500 font-mono">Kunjungan</span>
          </div>
          <div className="space-y-2">
            {data?.top_countries?.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 truncate max-w-[140px]">{c.country}</span>
                <span className="font-mono text-zinc-400 text-[11px]">{c.count} ({c.percentage.toFixed(0)}%)</span>
              </div>
            ))}
            {(!data?.top_countries || data.top_countries.length === 0) && (
              <p className="text-xs text-zinc-500">Belum ada data kunjungan.</p>
            )}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <h3 className="text-xs font-semibold text-white">Top 10 Kota</h3>
            <span className="text-[10px] text-zinc-500 font-mono">Kunjungan</span>
          </div>
          <div className="space-y-2">
            {data?.top_cities?.map((city, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 truncate max-w-[140px]">{city.city}</span>
                <span className="font-mono text-zinc-400 text-[11px]">{city.count}</span>
              </div>
            ))}
            {(!data?.top_cities || data.top_cities.length === 0) && (
              <p className="text-xs text-zinc-500">Belum ada data kota.</p>
            )}
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <h3 className="text-xs font-semibold text-white">Perangkat</h3>
            <span className="text-[10px] text-zinc-500 font-mono">Distribusi</span>
          </div>
          <div className="space-y-2">
            {data?.top_devices?.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">{d.device_type}</span>
                <span className="font-mono text-zinc-400 text-[11px]">{d.count} ({d.percentage.toFixed(0)}%)</span>
              </div>
            ))}
            {(!data?.top_devices || data.top_devices.length === 0) && (
              <p className="text-xs text-zinc-500">Belum ada data perangkat.</p>
            )}
          </div>
        </div>

        {/* Top Paths */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <h3 className="text-xs font-semibold text-white">Halaman Terpopuler</h3>
            <span className="text-[10px] text-zinc-500 font-mono">Hits</span>
          </div>
          <div className="space-y-2">
            {data?.top_paths?.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-300 truncate max-w-[140px] text-[11px]">{p.path}</span>
                <span className="font-mono text-zinc-400 text-[11px]">{p.count}</span>
              </div>
            ))}
            {(!data?.top_paths || data.top_paths.length === 0) && (
              <p className="text-xs text-zinc-500">Belum ada data halaman.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
