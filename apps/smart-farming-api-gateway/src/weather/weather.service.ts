import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {

  private readonly apiKey = 'f56277b8a7f619a6c0acfab85da42d89';
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5'; 

  async getWeather(city: string) {
    const url = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`; // Now correctly constructs the URL
    console.log('API Request URL:', url);
  
    try {
      const response = await axios.get(url);
      console.log('API Response:', response.data);
      return this.formatWeatherResponse(response.data);
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message); 
      throw new Error('Failed to fetch weather data');
    }
  }

  private formatWeatherResponse(weatherData: any) {
    const city = weatherData.name;
    const temperature = `${Math.round(weatherData.main.temp)}°C`;
    const weather = weatherData.weather[0].main;
    const humidity = `${weatherData.main.humidity}%`;  
    const advice = this.getPlantingAdvice(weatherData);

    return {
      city,
      temperature,
      weather,
      humidity, 
      advice,
    };
  }




  async getHumidityDetails(city: string) {
    const encodedCity = encodeURIComponent(city);
    const currentUrl = `${this.baseUrl}/weather?q=${encodedCity}&appid=${this.apiKey}&units=metric`;
    const forecastUrl = `${this.baseUrl}/forecast?q=${encodedCity}&appid=${this.apiKey}&units=metric`;

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(currentUrl),
        axios.get(forecastUrl)
      ]);

      const currentData = currentResponse.data;
      const forecastData = forecastResponse.data;

      // Get key time readings (6AM, 12PM, 6PM, 12AM)
      const keyTimes = this.extractKeyTimes(forecastData.list);
      
      // Calculate averages
      const todayHumidityValues = forecastData.list
        .slice(0, 8) // Next 24 hours
        .map(item => item.main.humidity);
      const avgToday = this.calculateAverage(todayHumidityValues);
      
      // For demo purposes - in production you'd get real historical data
      const avgYesterday = this.calculateAverage([
        ...todayHumidityValues.map(v => v * 0.95), // Simulate yesterday being 5% higher
        ...todayHumidityValues.map(v => v * 1.05)
      ]);

      return {
        humidity: {
          current: `${currentData.main.humidity}%`,
          dewPoint: `${this.calculateDewPoint(currentData.main.temp, currentData.main.humidity)}°C`,
          hourlyReadings: keyTimes,
          chart: {
            labels: keyTimes.map(item => item.time),
            data: keyTimes.map(item => parseInt(item.value)),
            scale: {
              min: 0,
              max: 100,
              steps: [0, 20, 40, 60, 80, 100]
            }
          }
        },
        dailySummary: {
          averageHumidity: `${Math.round(avgToday)}%`,
          dewPointRange: this.calculateDewPointRange(forecastData),
          description: this.getHumidityDescription(keyTimes)
        },
        dailyComparison: {
          today: `${Math.round(avgToday)}%`,
          yesterday: `${Math.round(avgYesterday)}%`,
          difference: `${Math.abs(Math.round(avgToday - avgYesterday))}% ${avgToday > avgYesterday ? 'higher' : 'lower'}`,
          trend: avgToday > avgYesterday ? 'increasing' : 'decreasing'
        },
        relativeHumidity: {
          definition: "Relative humidity measures how much water vapor is in the air compared to the maximum possible at that temperature.",
          currentImpact: this.getHumidityImpact(currentData.main.humidity)
        }
      };

    } catch (error) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(`Failed to fetch humidity details: ${error.response?.data?.message || error.message}`);
    }
  }

  private extractKeyTimes(forecastList: any[]): {time: string, value: string}[] {
    const targetHours = [6, 12, 18, 0]; // 6AM, 12PM, 6PM, 12AM
    const now = new Date();
    const today = now.getDate();

    return targetHours.map(hour => {
      // Find the forecast item closest to the target hour
      const reading = forecastList.find(item => {
        const date = new Date(item.dt * 1000);
        return date.getDate() === today && date.getHours() === hour;
      }) || forecastList[0]; // Fallback to first reading if none found

      return {
        time: hour === 0 ? '12AM' : 
              hour === 6 ? '6AM' :
              hour === 12 ? '12PM' : '6PM',
        value: `${reading.main.humidity}%`
      };
    });
  }

  private calculateDewPointRange(forecastData: any): string {
    const temps = forecastData.list.slice(0, 8).map(item => item.main.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const avgHumidity = this.calculateAverage(forecastData.list.slice(0, 8).map(item => item.main.humidity));

    const minDew = this.calculateDewPoint(minTemp, avgHumidity);
    const maxDew = this.calculateDewPoint(maxTemp, avgHumidity);
    return `${minDew}°C to ${maxDew}°C`;
  }

  private getHumidityDescription(readings: {value: string}[]): string {
    const values = readings.map(r => parseInt(r.value));
    const max = Math.max(...values);
    const min = Math.min(...values);
    const variation = max - min;

    if (variation > 30) return "Today's humidity shows significant variation, peaking at night and dropping sharply at midday.";
    if (variation > 15) return "Moderate humidity variation throughout the day.";
    return "Stable humidity levels expected today.";
  }

  private getHumidityImpact(humidity: number): string {
    if (humidity < 30) return 'Very dry air that may cause discomfort.';
    if (humidity < 50) return 'Comfortable humidity level for most activities.';
    if (humidity < 70) return 'Slightly humid, may feel sticky to some people.';
    return 'High humidity that may feel oppressive and uncomfortable.';
  }

  private calculateAverage(values: number[]): number {
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  private calculateDewPoint(temp: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint * 10) / 10; // 1 decimal place
  }
  ////weather/////////////
  private getPlantingAdvice(weatherData: any): string {
    const temperature = weatherData.main.temp;
    const weatherCondition = weatherData.weather[0].main.toLowerCase();

    if (weatherCondition.includes('rain')) {
      return 'Not a good day for planting (rainy).';
    } else if (temperature < 10 || temperature > 30) {
      return 'Not a good day for planting (extreme temperature).';
    } else {
      return 'Good day for planting!';
    }
  }
}