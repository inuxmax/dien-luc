import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
  city: string;
  windSpeed: number;
  precipitation: number;
  forecast: {
    time: string;
    temp: number;
    description: string;
  }[];
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const API_KEY = '9aNtWZqHtqubbw29i7A215pnKKtjiW1X';
        const response = await fetch(
          `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu thời tiết');
        }

        const data = await response.json();
        const currentConditions = data.timelines.minutely[0].values;
        const hourlyForecast = data.timelines.hourly.slice(0, 6); // Lấy 6 giờ tiếp theo

        // Chuyển đổi mô tả thời tiết
        const getWeatherDescription = (weatherCode: number) => {
          const weatherMap: { [key: number]: string } = {
            1000: "Quang mây",
            1100: "Ít mây",
            1101: "Nhiều mây",
            1102: "U ám",
            2000: "Sương mù",
            4000: "Mưa nhỏ",
            4001: "Mưa",
            4200: "Mưa rào",
            4201: "Mưa lớn",
            7000: "Có sấm sét",
            7101: "Sấm sét và mưa",
            8000: "Mây đen u ám"
          };
          return weatherMap[weatherCode] || "Không xác định";
        };

        interface HourlyData {
          time: string;
          values: {
            temperature: number;
            weatherCode: number;
          };
        }

        // Xử lý dự báo theo giờ
        const forecast = hourlyForecast.map((hour: HourlyData) => ({
          time: new Date(hour.time).getHours() + ':00',
          temp: Math.round(hour.values.temperature),
          description: getWeatherDescription(hour.values.weatherCode)
        }));

        setWeather({
          temp: Math.round(currentConditions.temperature),
          humidity: Math.round(currentConditions.humidity),
          description: getWeatherDescription(currentConditions.weatherCode),
          city: "Nam Định",
          windSpeed: Math.round(currentConditions.windSpeed),
          precipitation: Math.round(currentConditions.precipitationProbability),
          forecast
        });
      } catch (err) {
        setError('Không thể tải dữ liệu thời tiết');
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError('Không thể xác định vị trí');
          setLoading(false);
          console.error('Geolocation error:', err);
        }
      );
    } else {
      setError('Trình duyệt không hỗ trợ định vị');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
      <div className="flex flex-col">
        {/* Header with location */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-800">{weather.city}</h3>
          </div>
        </div>

        {/* Current weather */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-gray-900">{weather.temp}°C</div>
            <div className="text-sm text-gray-600">{weather.description}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end text-gray-600 mb-1">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{weather.humidity}%</span>
            </div>
            <div className="flex items-center justify-end text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-sm">{weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="border-t pt-3">
          <div className="text-xs text-gray-500 mb-2">Dự báo 6 giờ tới</div>
          <div className="grid grid-cols-6 gap-2">
            {weather.forecast.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-600">{item.time}</div>
                <div className="font-semibold text-sm">{item.temp}°</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 