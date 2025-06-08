'use client';

import { useState, useEffect } from 'react';
import { provinces } from '@/data/provinces';
import { outageStats } from '@/data/outageStats';
import WeatherWidget from '@/components/WeatherWidget';

interface PowerOutage {
  date: string;
  time: string;
  location: string;
  reason: string;
  company?: string;
  powerCompany?: string;
  startTime?: string;
  endTime?: string;
}

interface Province {
  name: string;
  slug: string;
  url: string;
}

type Region = {
  [key: string]: string[];
};

// Nhóm tỉnh thành theo khu vực
const regions: Region = {
  'Miền Bắc': ['Hà Nội', 'Hải Phòng', 'Bắc Ninh', 'Bắc Giang', 'Hải Dương', 'Hưng Yên', 'Nam Định', 'Thái Bình', 'Ninh Bình', 'Vĩnh Phúc', 'Phú Thọ', 'Thái Nguyên', 'Bắc Kạn', 'Cao Bằng', 'Lạng Sơn', 'Tuyên Quang', 'Yên Bái', 'Sơn La', 'Hòa Bình', 'Lai Châu', 'Điện Biên'],
  'Miền Trung': ['Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế', 'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận'],
  'Miền Nam': ['TP. Hồ Chí Minh', 'Bà Rịa - Vũng Tàu', 'Bình Dương', 'Bình Phước', 'Đồng Nai', 'Tây Ninh', 'Long An', 'Tiền Giang', 'Bến Tre', 'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp', 'An Giang', 'Kiên Giang', 'Cần Thơ', 'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau']
};

// Thêm interface cho thống kê
interface ProvinceStats {
  total: number;
  today: number;
  upcoming: number;
}

export default function Home() {
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [powerOutages, setPowerOutages] = useState<PowerOutage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Hàm rút gọn nội dung thời gian
  const shortenTime = (time: string) => {
    // Loại bỏ các từ không cần thiết
    const shortened = time
      .replace('Từ', '')
      .replace('đến', '-')
      .replace('giờ', 'h')
      .replace('phút', 'p')
      .trim();

    // Nếu độ dài > 15 ký tự, thêm xuống dòng
    if (shortened.length > 15) {
      const parts = shortened.split('-');
      if (parts.length === 2) {
        return `${parts[0].trim()}\n${parts[1].trim()}`;
      }
    }
    return shortened;
  };

  // Hàm format địa điểm
  const formatLocation = (location: string) => {
    // Thay thế các ký tự đặc biệt
    let formatted = location
      .replace('*', '•')
      .replace('+', ' + ')
      .replace(':', ':\n')
      .replace('TT', 'Thị trấn')
      .replace('TBA', 'Trạm biến áp');

    // Thêm xuống dòng sau dấu phẩy nếu độ dài > 50 ký tự
    if (formatted.length > 50) {
      formatted = formatted.split(',').join(',\n');
    }

    return formatted;
  };

  // Hàm format thời gian
  const formatDateTime = (date: string, time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}:00 ${date}`;
  };

  // Hàm tách thời gian bắt đầu và kết thúc
  const splitTime = (time: string) => {
    const parts = time.split('-');
    if (parts.length === 2) {
      return {
        start: parts[0].trim(),
        end: parts[1].trim()
      };
    }
    return {
      start: time,
      end: time
    };
  };

  // Hàm xử lý dữ liệu
  const processOutageData = (outages: PowerOutage[]) => {
    return outages.map((outage, index) => {
      const times = splitTime(outage.time);
      return {
        ...outage,
        stt: index + 1,
        startTime: formatDateTime(outage.date, times.start),
        endTime: formatDateTime(outage.date, times.end)
      };
    });
  };

  const handleProvinceChange = async (province: string) => {
    setSelectedProvince(province);
    setLoading(true);
    setError(null);
    setPowerOutages([]); // Reset current data

    try {
      const response = await fetch(`/api/outages?province=${encodeURIComponent(province)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received power outages:', data);

      if (!Array.isArray(data)) {
        console.error('Invalid data format:', data);
        throw new Error('Dữ liệu không hợp lệ');
      }

      if (data.length === 0) {
        setError('Không có thông tin cắt điện cho khu vực này');
        return;
      }

      setPowerOutages(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching power outages:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin lịch cắt điện');
      setPowerOutages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    setSelectedProvince('');
    setPowerOutages([]);
  };

  // Lọc tỉnh thành theo khu vực
  const filteredProvinces = selectedRegion 
    ? provinces.filter(province => regions[selectedRegion]?.includes(province.name))
    : provinces;

  // Tính toán số trang
  const totalPages = Math.ceil(powerOutages.length / itemsPerPage);
  
  // Lấy dữ liệu cho trang hiện tại
  const currentOutages = powerOutages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Debug logging
  console.log('Power outages:', powerOutages);
  console.log('Current page outages:', currentOutages);

  // Hàm chuyển trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Hàm tạo mảng số trang
  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const delta = 2; // Số trang hiển thị bên trái và phải của trang hiện tại
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  // Hàm scroll lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setError('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }

    const searchTerm = searchQuery.toLowerCase();
    let found = false;

    // Tìm kiếm trong các khu vực
    for (const [region, provinceNames] of Object.entries(regions)) {
      // Kiểm tra tên khu vực
      if (region.toLowerCase().includes(searchTerm)) {
        setSelectedRegion(region);
        setSelectedProvince('');
        setPowerOutages([]);
        found = true;
        break;
      }

      // Kiểm tra tên tỉnh trong khu vực
      const matchingProvinceName = provinceNames.find(name =>
        name.toLowerCase().includes(searchTerm)
      );

      if (matchingProvinceName) {
        const provinceData = provinces.find(p => p.name === matchingProvinceName);
        if (provinceData) {
          setSelectedRegion(region);
          setSelectedProvince(provinceData.slug);
          handleProvinceChange(provinceData.slug);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      setError('Không tìm thấy khu vực hoặc tỉnh thành phù hợp');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Cập nhật thông tin cúp điện mới nhất từ các công ty điện lực trên toàn quốc
      </h1>

      {/* Weather Widget - Chỉ hiển thị trên mobile */}
      <div className="md:hidden mb-6">
        <WeatherWidget />
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên khu vực hoặc tỉnh thành..."
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white dark:bg-gray-700"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tìm kiếm
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                !selectedRegion ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setSelectedRegion('')}
            >
              Tất cả
            </button>
            {Object.keys(regions).map((region) => (
              <button
                key={region}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedRegion === region ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setSelectedRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section - Moved to top */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6 text-center">
          <div className="loading-spinner mx-auto dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Đang tải dữ liệu...</p>
        </div>
      ) : powerOutages.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Lịch cúp điện</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Khu vực</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Đơn vị</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thông tin</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentOutages.map((outage, index) => {
                    const timeRange = `từ ${outage.time.split('-')[0].trim()}`;
                    const selectedProvinceData = provinces.find(p => p.slug === selectedProvince);
                    const powerCompanyName = selectedProvinceData 
                      ? `Điện lực ${selectedProvinceData.name}`
                      : 'Điện lực';
                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{outage.date}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{timeRange}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 dark:text-white whitespace-pre-line">{formatLocation(outage.location)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 dark:text-white">{powerCompanyName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 dark:text-white whitespace-pre-line">{outage.reason || ''}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Trang trước
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Trang sau
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Hiển thị <span className="font-medium">{currentPage * itemsPerPage - itemsPerPage + 1}</span>
                    {' '}-{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, powerOutages.length)}</span>
                    {' '}trong tổng số{' '}
                    <span className="font-medium">{powerOutages.length}</span> kết quả
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    {getPageNumbers(currentPage, totalPages).map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={page === '...'}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          page === currentPage
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : page === '...'
                            ? 'text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-offset-0'
                            : 'text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : selectedProvince && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">Không có thông tin lịch cúp điện cho tỉnh thành này.</p>
        </div>
      )}

      {/* Regions Section */}
      <section className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold dark:text-white">Danh sách Công ty Điện lực</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProvinces.map((province) => {
                const stats = outageStats[province.slug] || { total: 0, today: 0, upcoming: 0 };
                return (
                  <div key={province.slug} className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{province.name}</h3>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {Object.entries(regions).find(([_, provinces]) => provinces.includes(province.name))?.[0]}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">{stats.total}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Tổng số</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-green-600 dark:text-green-400">{stats.today}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Hôm nay</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">{stats.upcoming}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Sắp tới</div>
                            </div>
                          </div>
                        </div>
                        <button 
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium flex items-center"
                          onClick={() => {
                            setSelectedProvince(province.slug);
                            handleProvinceChange(province.slug);
                            scrollToTop();
                          }}
                        >
                          Chi tiết
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
