import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query('city') city: string) {
    if (!city) {
      throw new BadRequestException('City parameter is required');
    }
    return this.weatherService.getWeather(city);  
  }

  @Get('forecast')
  async getForecast(@Query('city') city: string) {
    if (!city) {
      throw new BadRequestException('City parameter is required');
    }
    return this.weatherService.getForecast(city);
  }

  @Get('city-from-coords')
  async getCityFromCoords(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ) {
    if (!lat || !lon) {
      throw new BadRequestException('Latitude and longitude parameters are required');
    }
    return this.weatherService.getCityFromCoords(parseFloat(lat), parseFloat(lon));
  }

  @Get('humidity-details')
  async getHumidityDetails(@Query('city') city: string) {
    if (!city) {
      throw new BadRequestException('City parameter is required');
    }
    return this.weatherService.getHumidityDetails(city);
  }
} 