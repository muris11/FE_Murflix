import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { VisitorLog } from '@/types/analytics';
import {
  Search,
  Filter,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Globe,
  Clock,
  User,
  ArrowLeft,
  X,
  ShieldAlert,
} from 'lucide-react';

import { ConfirmModal } from '@/components/common/ConfirmModal';

export const AdminVisitorLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);
  const [search, setSearch] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<VisitorLog | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getVisitorLogs({
        page,
        limit,
        search,
        country: selectedCountry,
        device: selectedDevice,
      });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to fetch visitor logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, selectedCountry, selectedDevice]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const executeDeleteOldLogs = async () => {
    setIsDeleting(true);
    try {
      await adminApi.deleteVisitorLogs(30);
      setShowDeleteModal(false);
      fetchLogs();
    } catch (err) {
      console.error('Failed to delete visitor logs:', err);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDeviceIcon = (device?: string) => {
    const d = (device || '').toLowerCase();
    if (d.includes('mobile')) return <Smartphone className="w-3.5 h-3.5 text-blue-400" />;
    if (d.includes('tablet')) return <Tablet className="w-3.5 h-3.5 text-purple-400" />;
    if (d.includes('tv')) return <Tv className="w-3.5 h-3.5 text-amber-400" />;
    return <Monitor className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-400 mb-1">
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link to="/admin/analytics" className="hover:text-white transition-colors">Pelacakan & Analitik</Link>
            <span>/</span>
            <span className="text-zinc-200 font-medium">Log Pengunjung & IP</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Log Lengkap Pengunjung &amp; Deteksi IP
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Rekaman terperinci alamat IP publik, koordinat GPS, lokasi kota/negara, ISP, perangkat, dan riwayat akses.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/analytics"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span>Peta Geolocation</span>
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-red-400 text-xs font-medium border border-zinc-700/60 transition-colors"
            title="Bersihkan log lebih dari 30 hari"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Log Lama</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari IP, Kota, Negara, URL Halaman, ISP, atau Pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-zinc-800/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-zinc-700/60 transition-colors"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center space-x-2">
          {/* Device Filter */}
          <select
            value={selectedDevice}
            onChange={(e) => {
              setSelectedDevice(e.target.value);
              setPage(1);
            }}
            className="bg-[#0a0a0c] border border-zinc-800/80 rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            <option value="">Semua Perangkat</option>
            <option value="Desktop">Desktop</option>
            <option value="Mobile">Mobile</option>
            <option value="Tablet">Tablet</option>
          </select>

          {/* Limit Filter */}
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-[#0a0a0c] border border-zinc-800/80 rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            <option value={25}>25 Baris</option>
            <option value={50}>50 Baris</option>
            <option value={100}>100 Baris</option>
          </select>

          <button
            onClick={() => fetchLogs()}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/60"
            title="Segarkan Log"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0e11] border-b border-zinc-800/80 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Alamat IP & Titik Koordinat</th>
                <th className="py-3 px-4">Lokasi (Kota, Negara)</th>
                <th className="py-3 px-4">Provider / ISP</th>
                <th className="py-3 px-4">Halaman URL</th>
                <th className="py-3 px-4">Perangkat & OS</th>
                <th className="py-3 px-4">Browser</th>
                <th className="py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {logs.map((log) => {
                const hasCoords = log.latitude !== undefined && log.longitude !== undefined && log.latitude !== 0;
                const timeStr = new Date(log.created_at).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedDetail(log)}
                  >
                    {/* Waktu */}
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {timeStr}
                    </td>

                    {/* IP & Koordinat */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-white block">{log.ip_address}</span>
                        {hasCoords ? (
                          <span className="text-[10px] font-mono text-amber-400 flex items-center space-x-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span>{log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500">Koordinat tidak tersedia</span>
                        )}
                      </div>
                    </td>

                    {/* Lokasi */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-zinc-200">{log.city || 'Kota Tidak Dikenal'}</p>
                        <p className="text-[11px] text-zinc-400">
                          {log.country || 'Unknown'} {log.country_code ? `(${log.country_code})` : ''}
                        </p>
                      </div>
                    </td>

                    {/* ISP */}
                    <td className="py-3 px-4 max-w-[180px] truncate" title={log.isp || ''}>
                      <span className="text-zinc-300 truncate block">
                        {log.isp || 'Unknown ISP'}
                      </span>
                    </td>

                    {/* Halaman URL */}
                    <td className="py-3 px-4 max-w-[200px] truncate font-mono text-red-400" title={log.path}>
                      <span className="truncate block">{log.path}</span>
                    </td>

                    {/* Perangkat & OS */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        {getDeviceIcon(log.device_type)}
                        <span className="text-zinc-300 font-medium">{log.device_type || 'Desktop'}</span>
                        <span className="text-zinc-500 text-[10px]">({log.os || 'OS'})</span>
                      </div>
                    </td>

                    {/* Browser */}
                    <td className="py-3 px-4 whitespace-nowrap text-zinc-300 font-medium">
                      {log.browser || 'Browser'}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        {hasCoords && (
                          <a
                            href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                            title="Buka Koordinat di Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedDetail(log)}
                          className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-200"
                        >
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {logs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    Tidak ditemukan data log pengunjung sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-[#18181c] border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <div>
            Menampilkan <span className="text-white font-semibold">{logs.length}</span> dari{' '}
            <span className="text-white font-semibold">{total}</span> total catatan log
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-zinc-800 ${
                page <= 1
                  ? 'text-zinc-600 bg-zinc-900 cursor-not-allowed'
                  : 'text-zinc-300 bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-2 font-mono text-zinc-300">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-zinc-800 ${
                page >= totalPages
                  ? 'text-zinc-600 bg-zinc-900 cursor-not-allowed'
                  : 'text-zinc-300 bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Popover / Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-white">
                  Detail Akses Pengunjung: {selectedDetail.ip_address}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-3 rounded-lg">
                <span className="text-zinc-500 block text-[10px]">Alamat IP</span>
                <span className="font-mono font-semibold text-white text-xs">{selectedDetail.ip_address}</span>
              </div>

              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-3 rounded-lg">
                <span className="text-zinc-500 block text-[10px]">Waktu Akses</span>
                <span className="font-mono text-zinc-300 text-xs">{new Date(selectedDetail.created_at).toLocaleString('id-ID')}</span>
              </div>

              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-3 rounded-lg">
                <span className="text-zinc-500 block text-[10px]">Lokasi Geografis</span>
                <span className="font-medium text-white text-xs">
                  {selectedDetail.city || 'Kota N/A'}, {selectedDetail.region || ''}, {selectedDetail.country} ({selectedDetail.country_code})
                </span>
              </div>

              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-3 rounded-lg">
                <span className="text-zinc-500 block text-[10px]">Titik Koordinat (GPS)</span>
                {selectedDetail.latitude && selectedDetail.longitude ? (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-zinc-200 font-semibold text-xs">
                      {selectedDetail.latitude.toFixed(6)}, {selectedDetail.longitude.toFixed(6)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${selectedDetail.latitude},${selectedDetail.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-white font-medium text-[11px] flex items-center space-x-1"
                    >
                      <span>Peta</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <span className="text-zinc-500 text-xs">Tidak tersedia</span>
                )}
              </div>

              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-3 rounded-lg sm:col-span-2">
                <span className="text-zinc-500 block text-[10px]">Internet Service Provider (ISP) &amp; ASN</span>
                <span className="text-zinc-300 font-medium text-xs">
                  {selectedDetail.isp || 'N/A'} {selectedDetail.asn ? `(${selectedDetail.asn})` : ''}
                </span>
              </div>

              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-3 rounded-lg sm:col-span-2">
                <span className="text-zinc-500 block text-[10px]">Halaman URL yang Diakses</span>
                <span className="font-mono text-zinc-200 break-all text-xs">{selectedDetail.path}</span>
              </div>

              {selectedDetail.referrer && (
                <div className="bg-[#0a0a0c] border border-zinc-800/80 p-3 rounded-lg sm:col-span-2">
                  <span className="text-zinc-500 block text-[10px]">HTTP Referrer</span>
                  <span className="font-mono text-zinc-400 break-all text-xs">{selectedDetail.referrer}</span>
                </div>
              )}

              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-3 rounded-lg">
                <span className="text-zinc-500 block text-[10px]">Perangkat &amp; OS</span>
                <span className="text-zinc-200 font-medium text-xs">{selectedDetail.device_type} - {selectedDetail.os}</span>
              </div>

              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-3 rounded-lg">
                <span className="text-zinc-500 block text-[10px]">Browser &amp; Resolusi</span>
                <span className="text-zinc-200 font-medium text-xs">
                  {selectedDetail.browser} ({selectedDetail.screen_resolution || 'Resolusi N/A'})
                </span>
              </div>

              {selectedDetail.user_email && (
                <div className="bg-[#0a0a0c] border border-zinc-800/80 p-3 rounded-lg sm:col-span-2">
                  <span className="text-zinc-500 block text-[10px]">Pengguna Terautentikasi</span>
                  <span className="text-white font-medium text-xs">
                    {selectedDetail.user_name || 'User'} ({selectedDetail.user_email})
                  </span>
                </div>
              )}

              <div className="bg-[#0a0a0c] border border-zinc-800/80 p-3 rounded-lg sm:col-span-2">
                <span className="text-zinc-500 block text-[10px]">Raw User-Agent</span>
                <span className="font-mono text-[10px] text-zinc-400 break-all">
                  {selectedDetail.user_agent}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700/60 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Bersihkan Log Lama?"
        message="Log kunjungan yang lebih lama dari 30 hari akan dihapus permanen dari basis data."
        confirmText="Hapus Log"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={executeDeleteOldLogs}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

