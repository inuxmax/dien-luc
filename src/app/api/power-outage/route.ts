import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface PowerOutage {
  date: string;
  time: string;
  location: string;
  reason: string;
}

// Hàm delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm fetch với retry logic
async function fetchWithRetry(url: string, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Thêm delay ngẫu nhiên từ 500ms đến 2000ms giữa các request
      if (i > 0) {
        await delay(500 + Math.random() * 1500);
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      
      // Kiểm tra HTML có hợp lệ không
      if (!html || html.length < 100 || html.includes('Access Denied')) {
        throw new Error('Invalid response data');
      }

      return html;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${url}:`, error);
      lastError = error;
      
      if (i < maxRetries - 1) {
        // Tăng thời gian delay theo cấp số nhân
        await delay(Math.pow(2, i) * 1000);
        continue;
      }
    }
  }

  throw lastError;
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp URL của tỉnh/thành phố' },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const powerOutages: PowerOutage[] = [];

    // Tìm bảng lịch cắt điện
    const tables = $('table');
    let foundTable = false;

    tables.each((_, table) => {
      const firstRow = $(table).find('tr:first-child');
      const headers = firstRow.find('th, td').map((_, el) => $(el).text().trim().toLowerCase()).get();
      
      // Kiểm tra xem có phải bảng lịch cắt điện không
      if (headers.some(h => h.includes('ngày') || h.includes('thời gian') || h.includes('khu vực'))) {
        foundTable = true;
        
        $(table).find('tr').each((index, row) => {
          if (index === 0) return; // Bỏ qua hàng tiêu đề

          const columns = $(row).find('td');
          if (columns.length >= 3) {
            let date = $(columns[0]).text().trim();
            let time = $(columns[1]).text().trim();
            let location = $(columns[2]).text().trim();
            let reason = columns.length >= 4 ? $(columns[3]).text().trim() : '';

            // Kiểm tra và chuẩn hóa dữ liệu
            if (!date && !time && !location) return;

            // Xử lý trường hợp ngày và thời gian gộp trong một cột
            if (!time && date.includes('-')) {
              const parts = date.split('-');
              if (parts.length === 2) {
                date = parts[0].trim();
                time = parts[1].trim();
              }
            }

            // Chuẩn hóa khoảng trống và ký tự đặc biệt
            location = location.replace(/\s+/g, ' ').replace(/[\n\r]+/g, ', ');
            reason = reason.replace(/\s+/g, ' ').replace(/[\n\r]+/g, ', ');

            if (date || time || location) {
              powerOutages.push({
                date: date || 'Không có thông tin',
                time: time || 'Không có thông tin',
                location: location || 'Không có thông tin',
                reason: reason || 'Không có thông tin'
              });
            }
          }
        });
      }
    });

    if (!foundTable) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Không tìm thấy lịch cắt điện'
      });
    }

    if (powerOutages.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Không có lịch cắt điện'
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: powerOutages
    });

  } catch (error) {
    console.error('Error fetching power outage:', error);
    
    let errorMessage = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('Access Denied')) {
        errorMessage = 'Server tạm thời chặn truy cập. Vui lòng thử lại sau ít phút.';
        statusCode = 429;
      } else if (error.message.includes('HTTP error')) {
        errorMessage = 'Server không phản hồi. Vui lòng thử lại sau.';
        statusCode = 502;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
} 