import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query('city') city: string) {
    if (!city) throw new BadRequestException('Le paramètre city est requis');
    return await this.weatherService.getWeather(city);
  }

  @Get('humidity-details')
  async getHumidityDetails(@Query('city') city: string) {
    if (!city) throw new BadRequestException('Le paramètre city est requis');
    return await this.weatherService.getHumidityDetails(city);
  }

  @Get('forecast')
  async getForecast(@Query('city') city: string) {
    if (!city) throw new BadRequestException('Le paramètre city est requis');
    return await this.weatherService.getForecast(city);
  }

  @Get('city-from-coords')
  async getCityFromCoords(
    @Query('lat') lat: number,
    @Query('lon') lon: number
  ) {
    if (!lat || !lon) throw new BadRequestException('Les paramètres lat et lon sont requis');
    return await this.weatherService.getCityFromCoords(lat, lon);
  }
}
