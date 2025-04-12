import { NextRequest, NextResponse } from 'next/server';
import { CompaniesResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    // Kiểm tra Google ID trong header
    const googleId = request.headers.get('X-Google-ID');
    if (!googleId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing X-Google-ID header' },
        { status: 401 }
      );
    }

    // Gọi API từ dienluc.net
    const response = await fetch('https://dienluc.net/api/companies', {
      headers: {
        'X-Google-ID': googleId
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch companies data');
    }

    const data: CompaniesResponse = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 