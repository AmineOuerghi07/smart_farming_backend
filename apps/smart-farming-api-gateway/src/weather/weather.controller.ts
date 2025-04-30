import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('coordinates')
  async getWeatherByCoordinates(
    @Query('lat') lat: number,
    @Query('lon') lon: number
  ) {
    if (!lat || !lon) throw new BadRequestException('Les paramètres lat et lon sont requis');
    return await this.weatherService.getWeatherByCoordinates(lat, lon);
  }

  @Get('forecast/coordinates')
  async getForecastByCoordinates(
    @Query('lat') lat: number,
    @Query('lon') lon: number
  ) {
    if (!lat || !lon) throw new BadRequestException('Les paramètres lat et lon sont requis');
    return await this.weatherService.getForecastByCoordinates(lat, lon);
  }

  @Get('humidity-details/coordinates')
  async getHumidityDetailsByCoordinates(
    @Query('lat') lat: number,
    @Query('lon') lon: number
  ) {
    if (!lat || !lon) throw new BadRequestException('Les paramètres lat et lon sont requis');
    return await this.weatherService.getHumidityDetailsByCoordinates(lat, lon);
  }
}
