import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { Land } from './entities/land.entity';
import { Plant } from '../plants/entities/plant.entity';
import { LandRequest } from './entities/requests.entity';
import { CreateLandRequestDto } from './dto/create-land-request.dto';
import { BLOCKCHAIN_NAME } from '@app/contracts/blockchain/blockchain.rmq';
import { ClientProxy } from '@nestjs/microservices';
import { BLOCKCHAIN_PATTERNS } from '@app/contracts/blockchain/blockchain.patterns';
import { BlockchainDto } from '@app/contracts/blockchain/dto/blockchain.dto';

@Injectable()
export class LandsService {
  constructor(@InjectModel(Land.name) private landModel: Model<Land>, @InjectModel(LandRequest.name) private landRequestModel, @Inject(BLOCKCHAIN_NAME) private readonly client : ClientProxy) { }

  async create(createLandDto: CreateLandDto): Promise<Land> {
    const createdLand = new this.landModel({
      ...createLandDto,
      user: createLandDto.user, // Convert to ObjectId automatically
      regions: []
    });
    return createdLand.save();
  }

  async findAll(): Promise<Land[] | string> {
    const lands = await this.landModel.find({}).exec();

    // Check if no lands are found
    if (lands.length === 0) {
      return 'Nothing in the database'; // Custom message when no data is available
    }

    return lands;
  }


  async findOne(id: ObjectId): Promise<Land> {
    return this.landModel.findById(id)
      .populate('user')
      .exec();
  }

  async update(id: ObjectId, updateLandDto: UpdateLandDto): Promise<Land> {
    return this.landModel.findByIdAndUpdate(
      id,
      updateLandDto,
      { new: true }
    ).populate('user regions').exec();
  }

  async remove(id: ObjectId): Promise<Land> {
    return this.landModel.findByIdAndDelete(id).exec();
  }

  async getPlantsByLandId(landId: ObjectId): Promise<{ plant: Plant; totalQuantity: number }[]> {
    try {
      const land = await this.landModel
        .findById(landId)
        .populate({
          path: 'regions',
          model: 'Region',
          populate: {
            path: 'plants.plant',
            model: 'Plant',
          },
        })
        .exec();

      if (!land) {
        throw new Error('Land not found');
      }

      const plantMap = new Map<string, { plant: Plant; totalQuantity: number }>();

      const regions = Array.isArray(land.regions) ? land.regions : [];
      for (const region of regions) {
        const plants = Array.isArray(region.plants) ? region.plants : [];
        for (const plantEntry of plants) {
          if (!plantEntry.plant || !plantEntry.plant._id) {
            continue;
          }
          const plantId = plantEntry.plant._id.toString();
          const quantity = plantEntry.quantity || 0;

          if (plantMap.has(plantId)) {
            const existing = plantMap.get(plantId)!;
            existing.totalQuantity += quantity;
          } else {
            plantMap.set(plantId, {
              plant: plantEntry.plant as unknown as Plant,
              totalQuantity: quantity,
            });
          }
        }
      }

      return Array.from(plantMap.values());
    } catch (error) {
      throw new Error(`Failed to fetch plants for land ${landId}: ${error.message}`);
    }
  }

  async getPlantsBySeason(season: string): Promise<Plant[]> {
    try {
      const lands = await this.landModel.find()
        .populate({
          path: 'regions',
          populate: {
            path: 'plants.plant',
            match: { plantingSeasons: season }
          }
        })
        .exec();

      const plants = new Set<Plant>();
      
      lands.forEach(land => {
        land.regions.forEach((region: any) => {
          region.plants.forEach((plantEntry: any) => {
            if (plantEntry.plant) {
              plants.add(plantEntry.plant);
            }
          });
        });
      });

      return Array.from(plants);
    } catch (error) {
      throw new Error(`Failed to fetch plants by season: ${error.message}`);
    }
  }

  async getPlantsByGrowthCycle(months: number): Promise<Plant[]> {
    try {
      const lands = await this.landModel.find()
        .populate({
          path: 'regions',
          populate: {
            path: 'plants.plant',
            match: { growthCycleMonths: months }
          }
        })
        .exec();

      const plants = new Set<Plant>();
      
      lands.forEach(land => {
        land.regions.forEach((region: any) => {
          region.plants.forEach((plantEntry: any) => {
            if (plantEntry.plant) {
              plants.add(plantEntry.plant);
            }
          });
        });
      });

      return Array.from(plants);
    } catch (error) {
      throw new Error(`Failed to fetch plants by growth cycle: ${error.message}`);
    }
  }

  async setLandForRent(landId: string, userId: string, rentPrice: number): Promise<Land> {
    const land = await this.landModel.findOne({
      _id: new Types.ObjectId(landId),
      user: new Types.ObjectId(userId), // Ensure the user owns the land
    }).exec();

    if (!land) {
      throw new NotFoundException(`Land with ID ${landId} not found or not owned by user ${userId}`);
    }

    // If rentPrice > 0, set forRent to true; if 0, set forRent to false
    land.forRent = rentPrice > 0;
    land.rentPrice = rentPrice;

    return land.save();
  }

  // New method: Fetch all lands for rent
  async findLandsForRent(): Promise<Land[]> {
    try {
      console.log('Fetching lands for rent...');
      const lands = await this.landModel
        .find({ forRent: true })
        .populate('user regions')
        .exec();
      console.log(`Found ${lands.length} lands for rent`);
      return lands;
    } catch (error) {
      console.error(`Error in findLandsForRent: ${error.message}`);
      throw error;
    }
  }
  async findLandsByUserId(userId: string): Promise<Land[]> {
    const lands = await this.landModel.find({ user: userId }).exec();

    if (lands.length === 0) {
      throw new NotFoundException(`No lands found for user with ID ${userId}`);
    }

    return lands;
  }


  async getLandRequestsByUserId(userId: string): Promise<LandRequest[]> {
    const lands = await this.landModel.find({ user: userId }).exec();
    const requests = await this.landRequestModel.find().exec();
    const filterdRequests = requests.filter((request) => {
      const land = lands.find((land) => land._id.toString() === request.landId.toString());
      return land != null;
    });
    return filterdRequests;
  }

  async addRequestToLand(createLandRequestDto: CreateLandRequestDto): Promise<boolean> {
    // Checking if the user already has a request for this land
    const existingRequest = await this.landRequestModel.findOne({ landId: createLandRequestDto.landId, requestingUser: createLandRequestDto.requestingUser }).exec();
    if (existingRequest) {
      return false;
    }
    try {
      // Create a new request
      let landRequest = new LandRequest();
      landRequest.requestingUser = new Types.ObjectId(createLandRequestDto.requestingUser);
      landRequest.landId = new Types.ObjectId(createLandRequestDto.landId);
      landRequest.requestDate = new Date().toString();
      landRequest.status = 'pending'; // Default status
      console.log('Creating new land request:', landRequest);
      const newRequest = await this.landRequestModel.create(landRequest).exec();
      console.log('New request created:', newRequest);
      return true;
    } catch (error) {
      console.error('Error creating land request:', error);
      throw new Error('Failed to create land request');
    }
  }

  async acceptRequest(requestId: string): Promise<boolean> {
    try {

      const preRequest: LandRequest = await this.landRequestModel.findById({ _id: requestId }).exec();
      if (preRequest.status != "pending") {
        return false;
      }
      const request = await this.landRequestModel.findByIdAndUpdate({ _id: requestId }, { status: 'accepted' }).exec();
      if (!request) {
        throw new NotFoundException(`Request with ID ${requestId} not found`);
      }
      const land = await this.landModel.findById({ _id: preRequest.landId }).exec();
      land.fromDate = new Date(Date.now()).toLocaleString();
      land.toDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleString(); // Set to one year from now
      land.rentingUser = preRequest.requestingUser;
      await this.landModel.findByIdAndUpdate({ _id: preRequest.landId }, land).exec();
      let blockchainRequest = new BlockchainDto()
      blockchainRequest.requestingUser = preRequest.requestingUser.toString();
      blockchainRequest.fromDate = land.fromDate;
      blockchainRequest.toDate = land.toDate;
      blockchainRequest.landId = preRequest.landId.toString();
      blockchainRequest.rentPrice = land.rentPrice.toString();
      blockchainRequest.totalPrice = (land.rentPrice * 12).toString();
      await this.client.emit(BLOCKCHAIN_PATTERNS.BLOCKCHAIN_CREATE_LAND_REQUEST,blockchainRequest).toPromise();
      return true;
    } catch (error) {
      console.error('Error accepting land request:', error);
      throw new Error('Failed to accept land request');
    }
  }

  async rejectRequest(requestId: string): Promise<boolean> {
    try {
      const preRequest: LandRequest = await this.landRequestModel.findById({ _id: requestId }).exec();
      if (preRequest.status != "pending") {
        return false;
      }
      const request = await this.landRequestModel.findByIdAndUpdate({ _id: requestId }, { status: 'rejected' }).exec();
      if (!request) {
        throw new NotFoundException(`Request with ID ${requestId} not found`);
      }
      return true;
    } catch (error) {
      console.error('Error rejecting land request:', error);
      throw new Error('Failed to reject land request');
    }
  }
}