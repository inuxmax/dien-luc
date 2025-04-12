import axios from 'axios';
import * as cheerio from 'cheerio';

export interface PowerOutage {
  date: string;
  time: string;
  location: string;
  reason: string;
}

export async function getPowerOutageSchedule(provinceUrl: string): Promise<PowerOutage[]> {
  try {
    const response = await axios.get(provinceUrl);
    const $ = cheerio.load(response.data);
    const powerOutages: PowerOutage[] = [];

    $('#table tr').each((index, element) => {
      if (index === 0) return; // Skip header row

      const columns = $(element).find('td');
      if (columns.length >= 4) {
        powerOutages.push({
          date: $(columns[0]).text().trim(),
          time: $(columns[1]).text().trim(),
          location: $(columns[2]).text().trim(),
          reason: $(columns[3]).text().trim(),
        });
      }
    });

    return powerOutages;
  } catch (error) {
    console.error('Error fetching power outage schedule:', error);
    return [];
  }
} 