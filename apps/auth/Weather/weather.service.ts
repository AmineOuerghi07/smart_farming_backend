import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {

  private readonly apiKey = 'f56277b8a7f619a6c0acfab85da42d89';
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5'; 

  async getWeather(city: string) {
    const url = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
    console.log('API Request URL:', url);
  
    try {
      const response = await axios.get(url);
      
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
    const precipitation = this.getPrecipitation(weatherData);
    const advice = this.getPlantingAdvice(weather, city);
    const soilCondition = this.getDynamicSoilCondition(weather); 

    return {
      city,
      temperature,
      weather,
      humidity,
      precipitation,
      soilCondition,
      advice,
    };
  }

  private getPrecipitation(weatherData: any): string {
    
  
    // Check if rain data exists for the last 3 hours
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
      return `${precipitationPercentage.toFixed(0)}%`
    }
    
   
    return '0%';
  }
  //soil
  // Dynamically return soil condition based on weather type
private getDynamicSoilCondition(weather: string): string {
  let soilConditionMessage = "";

  if (weather === 'Clear') {
    soilConditionMessage = "Dry";
  } else if (weather === 'Clouds') {
    soilConditionMessage = "Moderate";
  } else if (weather === 'Rain') {
    soilConditionMessage = "Wet";
  } else if (weather === 'Snow') {
    soilConditionMessage = "Frozen";
  } else if (weather === 'Thunderstorm') {
    soilConditionMessage = "Unstable";
  } else {
    soilConditionMessage = "Unknown";
  }

  return soilConditionMessage;
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
  
      const todayHumidityValues = forecastData.list
        .slice(0, 8)
        .map(item => item.main.humidity);
      const avgToday = this.calculateAverage(todayHumidityValues);
  
      const avgYesterday = this.calculateAverage(
        todayHumidityValues.map(v => v + (Math.random() * 10 - 5))
      );
  
      const result = {
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
  
      console.log('Humidity Details Response:', result); 
  
      return result;
  
    } catch (error) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(`Failed to fetch humidity details: ${error.response?.data?.message || error.message}`);
    }
  }
  
  private extractKeyTimes(forecastList: any[]): { time: string, value: string }[] {
    const targetHours = [6, 12, 18, 0];
    const usedTimestamps = new Set<number>();
  
    return targetHours.map(hour => {
      let closestReading = forecastList.find(item => {
        const date = new Date(item.dt * 1000);
        const h = date.getHours();
        return Math.abs(h - hour) <= 1 && !usedTimestamps.has(item.dt); 
      });
  
      if (closestReading) {
        usedTimestamps.add(closestReading.dt);
      } else {
        // fallback : premier élément
        closestReading = forecastList.find(item => !usedTimestamps.has(item.dt)) || forecastList[0];
        usedTimestamps.add(closestReading.dt);
      }
  
      return {
        time: hour === 0 ? '12AM' :
              hour === 6 ? '6AM' :
              hour === 12 ? '12PM' : '6PM',
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
  private getPlantingAdvice(weather: string, city: string): string {
    let adviceMessage = "Bonne nouvelle !";
  
    // Customize the advice based on weather conditions
    if (weather === 'Clear') {
      adviceMessage += ` Le ciel est dégagé, idéal pour la plantation en extérieur à ${city}.`;
    } else if (weather === 'Clouds') {
      adviceMessage += ` Il y a quelques nuages, mais c'est toujours une bonne journée pour planter à ${city}.`;
    } else if (weather === 'Rain') {
      adviceMessage += ` Il pleut, c'est une bonne journée pour planter si vous avez un espace couvert à ${city}.`;
    } else if (weather === 'Snow') {
      adviceMessage += ` Il neige, mieux vaut attendre des températures plus douces avant de planter à ${city}.`;
    } else if (weather === 'Thunderstorm') {
      adviceMessage += ` Il y a un orage, il est préférable de reporter la plantation à ${city}.`;
    } else {
      adviceMessage += ` Les conditions sont imprévues pour la plantation aujourd'hui à ${city}.`;
    }
  
    return adviceMessage;
  }
/////////////////////////////////////

  
  
  
}