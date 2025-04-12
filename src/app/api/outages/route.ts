import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province');

    if (!province) {
      return NextResponse.json({ error: 'Province parameter is required' }, { status: 400 });
    }

    const url = `https://lichcatdien.com/lich-cat-dien-${province}.html`;
    console.log('Fetching data from:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch:', response.status, response.statusText);
      throw new Error(`Failed to fetch data from source: ${response.status}`);
    }

    const html = await response.text();
    console.log('Received HTML length:', html.length);
    
    // Extract table content
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) {
      console.log('No table found in HTML');
      return NextResponse.json([]);
    }

    const tableContent = tableMatch[0];
    console.log('Found table content length:', tableContent.length);

    // Extract power outage information from table
    const outages = [];
    const rows = tableContent.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
    console.log('Found rows:', rows.length);

    for (const row of rows) {
      // Skip header rows and empty rows
      if (row.includes('th') || !row.includes('td')) continue;

      const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      if (cells.length >= 4) {
        const date = cells[0]?.replace(/<[^>]+>/g, '').trim();
        const time = cells[1]?.replace(/<[^>]+>/g, '').trim();
        const location = cells[2]?.replace(/<[^>]+>/g, '').trim();
        const reason = cells[3]?.replace(/<[^>]+>/g, '').trim();

        if (date && time && location) {
          outages.push({
            date,
            time,
            location,
            reason: reason || 'Bảo dưỡng và sửa chữa lưới điện'
          });
        }
      }
    }

    console.log('Processed outages:', outages.length);
    return NextResponse.json(outages);
  } catch (error) {
    console.error('Error fetching power outages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch power outages' },
      { status: 500 }
    );
  }
} 