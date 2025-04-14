import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CropService {
  private readonly apiUrl = 'https://api.openweathermap.org/data/2.5s'; 

  async getCropData(plant: string, startYear?: number, endYear?: number) {
    try {
      const response = await axios.get(this.apiUrl, {
        params: { plant, startYear, endYear },
      });

      const data = response.data; // Expected format: { "2020": 620, "2021": 700, ... }

      const filteredData: Record<number, number> = {};
      for (const year in data) {
        const y = parseInt(year);
        if (
          (!startYear || y >= startYear) &&
          (!endYear || y <= endYear)
        ) {
          filteredData[y] = data[y];
        }
      }

      const years = Object.keys(filteredData)
        .map((y) => parseInt(y))
        .sort((a, b) => a - b);

      const cropSummary = [];
      let prevCrop = null;

      for (const year of years) {
        const crop = filteredData[year];
        const summaryItem: any = { year, crop };

        if (prevCrop !== null && prevCrop !== 0) {
          const change = ((crop - prevCrop) / prevCrop) * 100;
          summaryItem.change = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        }

        cropSummary.push(summaryItem);
        prevCrop = crop;
      }

      const chartData = {
        labels: years.map((y) => y.toString()),
        data: years.map((y) => filteredData[y]),
      };

      const first = filteredData[years[0]];
      const last = filteredData[years[years.length - 1]];
      let trend = 'stable';
      if (last > first) trend = 'upward';
      else if (last < first) trend = 'downward';

      const latestChange = cropSummary[cropSummary.length - 1]?.change || '';
      const summary = `The crop has shown steady growth over the years, with a significant increase of ${latestChange} in ${years[years.length - 1]} compared to ${years[years.length - 2]}.`;

      return {
        plant,
        cropSummary,
        chartData,
        trend,
        summary,
      };
    } catch (error) {
      console.error('Error fetching crop data:', error.message);
      throw new Error('Failed to fetch crop data');
    }
  }
}
