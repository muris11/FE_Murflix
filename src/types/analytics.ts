export interface VisitorCoordinate {
  id: string;
  ip_address: string;
  country: string;
  country_code: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  isp: string;
  device_type: string;
  browser: string;
  os: string;
  path: string;
  user_name?: string;
  created_at: string;
}

export interface CountryStat {
  country: string;
  country_code: string;
  count: number;
  percentage: number;
}

export interface CityStat {
  city: string;
  country: string;
  country_code: string;
  count: number;
}

export interface DeviceStat {
  device_type: string;
  count: number;
  percentage: number;
}

export interface BrowserStat {
  browser: string;
  count: number;
  percentage: number;
}

export interface OSStat {
  os: string;
  count: number;
  percentage: number;
}

export interface PathStat {
  path: string;
  count: number;
}

export interface AnalyticsOverview {
  active_visitors: number;
  total_visits: number;
  visits_today: number;
  unique_ips: number;
  unique_ips_today: number;
  top_countries: CountryStat[];
  top_cities: CityStat[];
  top_devices: DeviceStat[];
  top_browsers: BrowserStat[];
  top_os: OSStat[];
  top_paths: PathStat[];
  recent_visitors: VisitorCoordinate[];
}

export interface VisitorLog {
  id: string;
  ip_address: string;
  country?: string;
  country_code?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  asn?: string;
  user_agent?: string;
  browser?: string;
  os?: string;
  device_type?: string;
  path: string;
  referrer?: string;
  screen_resolution?: string;
  session_id?: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  created_at: string;
}

export interface TrackVisitorRequest {
  path: string;
  referrer?: string;
  screen_resolution?: string;
  session_id?: string;
}

