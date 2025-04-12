import fs from 'fs';
import path from 'path';

interface OutageCache {
  [url: string]: {
    data: any;
    timestamp: number;
  }
}

// Cache sẽ hết hạn sau 30 phút
const CACHE_EXPIRATION = 30 * 60 * 1000;
const CACHE_FILE = path.join(process.cwd(), 'src/app/api/cache/outages.json');

// Đọc cache từ file nếu tồn tại
let outageCache: OutageCache = {};
try {
  if (fs.existsSync(CACHE_FILE)) {
    const fileContent = fs.readFileSync(CACHE_FILE, 'utf-8');
    outageCache = JSON.parse(fileContent);
    console.log('Loaded cache from file');
  }
} catch (error) {
  console.error('Error loading cache file:', error);
}

// Lưu cache vào file
function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(outageCache, null, 2));
    console.log('Saved cache to file');
  } catch (error) {
    console.error('Error saving cache file:', error);
  }
}

export function getCachedOutage(url: string) {
  const cached = outageCache[url];
  if (!cached) return null;

  // Kiểm tra xem cache có hết hạn chưa
  if (Date.now() - cached.timestamp > CACHE_EXPIRATION) {
    delete outageCache[url];
    saveCache();
    return null;
  }

  return cached.data;
}

export function setCachedOutage(url: string, data: any) {
  outageCache[url] = {
    data,
    timestamp: Date.now()
  };
  saveCache();
}

// Xóa cache cũ định kỳ
setInterval(() => {
  let hasExpired = false;
  const now = Date.now();
  
  Object.keys(outageCache).forEach(url => {
    if (now - outageCache[url].timestamp > CACHE_EXPIRATION) {
      delete outageCache[url];
      hasExpired = true;
    }
  });

  if (hasExpired) {
    saveCache();
  }
}, CACHE_EXPIRATION);
