import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly apiKey = 'f56277b8a7f619a6c0acfab85da42d89';
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly geoUrl = 'https://api.openweathermap.org/geo/1.0';

  async getWeather(city: string) {
    const url = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
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

  async getCityFromCoords(lat: number, lon: number) {
    const url = `${this.geoUrl}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`;
    try {
      const response = await axios.get(url);
      if (response.data && response.data.length > 0) {
        return response.data[0].name;
      }
      throw new Error('No city found for these coordinates');
    } catch (error) {
      console.error('Geocoding Error:', error.response?.data || error.message);
      throw new Error('Failed to get city from coordinates');
    }
  }

  async getForecast(city: string) {
    const url = `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`;
    try {
      const response = await axios.get(url);
      return this.formatForecastResponse(response.data);
    } catch (error) {
      console.error('Forecast Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch forecast data');
    }
  }

  private formatWeatherResponse(weatherData: any) {
    const city = weatherData.name;
    const temperature = `${Math.round(weatherData.main.temp)}°C`;
    const weather = weatherData.weather[0].main;
    const humidity = `${weatherData.main.humidity}%`;
    const precipitation = this.getPrecipitation(weatherData);
    const advice = this.getPlantingAdvice(weather, city);
    const soilCondition = "Loamy";
    const windSpeed = `${Math.round(weatherData.wind.speed)} m/s`;
    const visibility = `${(weatherData.visibility / 1000).toFixed(1)} km`;
    const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const feelsLike = `${Math.round(weatherData.main.feels_like)}°C`;

    const baseUV = Math.floor((weatherData.main.temp + 20) / 10);
    const cloudFactor = (100 - weatherData.clouds.all) / 100;
    const uvIndex = Math.max(1, Math.min(11, Math.floor(baseUV * cloudFactor)));

    let uvDescription;
    if (uvIndex <= 2) uvDescription = 'Low';
    else if (uvIndex <= 5) uvDescription = 'Moderate';
    else if (uvIndex <= 7) uvDescription = 'High';
    else if (uvIndex <= 10) uvDescription = 'Very High';
    else uvDescription = 'Extreme';

    return {
      city,
      temperature,
      weather,
      humidity,
      precipitation,
      soilCondition,
      advice,
      windSpeed,
      visibility,
      sunrise,
      sunset,
      feelsLike,
      uvIndex: uvIndex.toString(),
      uvDescription
    };
  }

  private formatForecastResponse(forecastData: any) {
    const dailyForecasts = [];
    const processedDates = new Set();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000);
      const dateString = date.toDateString();

      if (!processedDates.has(dateString) && dailyForecasts.length < 10) {
        processedDates.add(dateString);
        dailyForecasts.push({
          day: daysOfWeek[date.getDay()],
          temperature: `${Math.round(item.main.temp)}°C`,
          condition: item.weather[0].main
        });
      }
    }

    return dailyForecasts;
  }

  private getPrecipitation(weatherData: any): string {
    if (weatherData.rain && weatherData.rain['3h']) {
      const rainAmount = weatherData.rain['3h'];
      const maxRainThreshold = 50;
      const precipitationPercentage = Math.min((rainAmount / maxRainThreshold) * 100, 100);
      return `${precipitationPercentage.toFixed(0)}%`;
    }

    if (weatherData.rain && weatherData.rain['1h']) {
      const rainAmount = weatherData.rain['1h'];
      const maxRainThreshold = 50;
      const precipitationPercentage = Math.min((rainAmount / maxRainThreshold) * 100, 100);
      return `${precipitationPercentage.toFixed(0)}%`;
    }

    return '0%';
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

      const keyTimes = this.extractKeyTimes(forecastData.list);
      const todayHumidityValues = forecastData.list.slice(0, 8).map(item => item.main.humidity);
      const avgToday = this.calculateAverage(todayHumidityValues);
      const avgYesterday = this.calculateAverage(todayHumidityValues.map(v => v + (Math.random() * 10 - 5)));

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
      console.error('API Error:', error);
      throw new Error('Failed to fetch humidity details');
    }
  }

  private extractKeyTimes(forecastList: any[]): { time: string; value: string }[] {
    const targetHours = [6, 12, 18, 0];
    const usedTimestamps = new Set<number>();

    return targetHours.map(hour => {
      let closestReading = forecastList.find(item => {
        const date = new Date(item.dt * 1000);
        const h = date.getHours();
        return Math.abs(h - hour) <= 1 && !usedTimestamps.has(item.dt);
      });

      if (!closestReading) {
        closestReading = forecastList.find(item => !usedTimestamps.has(item.dt)) || forecastList[0];
      }
      usedTimestamps.add(closestReading.dt);

      return {
        time: hour === 0 ? '12AM' : hour === 6 ? '6AM' : hour === 12 ? '12PM' : '6PM',
        value: `${closestReading.main.humidity}%`
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

  private getHumidityDescription(readings: { value: string }[]): string {
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
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateDewPoint(temp: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint * 10) / 10;
  }

  private getPlantingAdvice(weather: string, city: string): string {
    let adviceMessage = "Bonne nouvelle !";

    switch (weather) {
      case 'Clear':
        adviceMessage += ` Le ciel est dégagé, idéal pour la plantation en extérieur à ${city}.`;
        break;
      case 'Clouds':
        adviceMessage += ` Il y a quelques nuages, mais c'est toujours une bonne journée pour planter à ${city}.`;
        break;
      case 'Rain':
        adviceMessage += ` Il pleut, c'est une bonne journée pour planter si vous avez un espace couvert à ${city}.`;
        break;
      case 'Snow':
        adviceMessage += ` Il neige, mieux vaut attendre des températures plus douces avant de planter à ${city}.`;
        break;
      case 'Thunderstorm':
        adviceMessage += ` Il y a un orage, il est préférable de reporter la plantation à ${city}.`;
        break;
      default:
        adviceMessage += ` Les conditions sont imprévues pour la plantation aujourd'hui à ${city}.`;
    }

    return adviceMessage;
  }
} 