import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { Land } from './entities/land.entity';
import { Plant } from '../plants/entities/plant.entity';
import { LandRequest } from './entities/requests.entity';
import { CreateLandRequestDto } from './dto/create-land-request.dto';
import { BLOCKCHAIN_NAME } from '@app/contracts/blockchain/blockchain.rmq';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { BLOCKCHAIN_PATTERNS } from '@app/contracts/blockchain/blockchain.patterns';
import { BlockchainDto } from '@app/contracts/blockchain/dto/blockchain.dto';
import { RpcInternalServerErrorException, RpcNoDataException } from '@app/contracts/errors/filters/rpc.exception.filter';


@Injectable()
export class LandsService {
  constructor(
    @InjectModel(Land.name) private landModel: Model<Land>, 
    @InjectModel(LandRequest.name) private landRequestModel, 
    @Inject(BLOCKCHAIN_NAME) private readonly client: ClientProxy
  ) {}

  async create(createLandDto: CreateLandDto): Promise<Land> {
    try {
      const createdLand = new this.landModel({
        ...createLandDto,
        user: createLandDto.user,
        regions: []
      });
      return await createdLand.save();
    } catch (error) {
      throw new RpcException({
        message: `Failed to create land: ${error.message}`,
        statusCode: 400
      });
    }
  }

  async findAll(): Promise<Land[] | { message: string }> {
    try {
      const lands = await this.landModel.find({}).populate('regions').exec();
      
      if (lands.length === 0) {
        // Use our custom RpcNoDataException for no data scenarios
        throw new RpcNoDataException('No lands found in the database');
      }
      
      return lands;
    } catch (error) {
      // Preserve our custom exceptions
      if (error instanceof RpcNoDataException) {
        throw error;
      }
      
      throw new RpcInternalServerErrorException(`Failed to fetch lands: ${error.message}`);
    }
  }

  async findOne(id: ObjectId): Promise<Land> {
    try {
      const land = await this.landModel.findById(id)
        .populate('user')
        .exec();
      
      if (!land) {
        throw new RpcException({
          message: `Land with ID ${id} not found`,
          statusCode: 404
        });
      }
      
      return land;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException({
        message: `Failed to fetch land: ${error.message}`,
        statusCode: error.name === 'CastError' ? 400 : 500
      });
    }
  }

  async update(id: ObjectId, updateLandDto: UpdateLandDto): Promise<Land> {
    try {
      const updatedLand = await this.landModel.findByIdAndUpdate(
        id,
        updateLandDto,
        { new: true }
      ).populate('user regions').exec();
      
      if (!updatedLand) {
        throw new RpcException({
          message: `Land with ID ${id} not found`,
          statusCode: 404
        });
      }
      
      return updatedLand;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException({
        message: `Failed to update land: ${error.message}`,
        statusCode: error.name === 'CastError' ? 400 : 500
      });
    }
  }

  async remove(id: ObjectId): Promise<Land> {
    try {
      const deletedLand = await this.landModel.findByIdAndDelete(id).exec();
      
      if (!deletedLand) {
        throw new RpcException({
          message: `Land with ID ${id} not found`,
          statusCode: 404
        });
      }
      
      return deletedLand;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException({
        message: `Failed to delete land: ${error.message}`,
        statusCode: error.name === 'CastError' ? 400 : 500
      });
    }
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
        throw new RpcException({
          message: `Land with ID ${landId} not found`,
          statusCode: 404
        });
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
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException({
        message: `Failed to fetch plants for land ${landId}: ${error.message}`,
        statusCode: error.name === 'CastError' ? 400 : 500
      });
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

  // async setLandForRent(landId: string, userId: string, rentPrice: number): Promise<Land> {
  //   const land = await this.landModel.findOne({
  //     _id: new Types.ObjectId(landId),
  //     user: new Types.ObjectId(userId), // Ensure the user owns the land
  //   }).exec();
  // }

  async findLandsByUserId(userId: string): Promise<Land[]> {
    try {
      let lands = await this.landModel.find({ user: new Types.ObjectId(userId) }).exec();
      const rentedLands = await this.landModel.find({ rentingUser : new Types.ObjectId(userId) }).exec();
      const result = lands.filter(land => {
        let isRented = false;
        if(land.rentingUser != null) {
          isRented = true;
        }
        return !isRented;
      });

      const allLands = result.concat(rentedLands);
  

      if (allLands.length === 0) {
        throw new RpcException({
          message: `No lands found for user with ID ${userId}`,
          statusCode: 404
        });
      }

      return allLands;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException({
        message: `Failed to fetch lands for user ${userId}: ${error.message}`,
        statusCode: error.name === 'CastError' ? 400 : 500
      });
    }
  }

  async findLandsForRent(): Promise<Land[]> {
    try {
      console.log('Fetching lands for rent...');
      const lands = await this.landModel
        .find({ forRent: true })
        .populate('user regions')
        .exec();
      
      if (lands.length === 0) {
        throw new RpcException({
          message: 'No lands available for rent',
          statusCode: 404
        });
      }
      
      console.log(`Found ${lands.length} lands for rent`);
      return lands;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      console.error(`Error in findLandsForRent: ${error.message}`);
      throw new RpcException({
        message: `Failed to fetch lands for rent: ${error.message}`,
        statusCode: 500
      });
    }
  }

  async setLandForRent(landId: string, userId: string, rentPrice: number): Promise<Land> {
    try {
      const land = await this.landModel.findOne({
        _id: new Types.ObjectId(landId),
        user: new Types.ObjectId(userId),
      }).exec();

      if (!land) {
        throw new RpcException({
          message: `Land with ID ${landId} not found or not owned by user ${userId}`,
          statusCode: 404
        });
      }

      land.forRent = rentPrice > 0;
      land.rentPrice = rentPrice;

      return await land.save();
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException({
        message: `Failed to set land for rent: ${error.message}`,
        statusCode: error.name === 'CastError' ? 400 : 500
      });
    }
  }

  // Updated methods for land requests
  async getLandRequestsByUserId(userId: string) {
    try {
      const lands = await this.landModel.find({ user: userId }).exec();
      
      if (lands.length === 0) {
        throw new RpcException({
          message: `No lands found for user with ID ${userId}`,
          statusCode: 404
        });
      }
      
      const requests = await this.landRequestModel.find({status : "pending"}).populate("requestingUser landId").exec();
      let userRequests : {requestId : string,userName: string, landName: string, landLocation : string, userImg : string, price : number , landId : string, userId: string}[] = [];
      const filteredRequests = requests.filter((request) => {
        const land = lands.find((land) => land._id.toString() === request.landId._id.toString());

        console.log('Land:', land);
        console.log('Request:', request);
        if(land != null)
        {
          userRequests.push({
            requestId: request._id.toString(),
            userName: request.requestingUser.name,
            landName: land.name,
            landLocation: land.cordonate,
            userImg: request.requestingUser.image ?? "",
            price: land.rentPrice,
            landId: land._id.toString(),
            userId: request.requestingUser._id.toString()
          });
          return true;
        }
        return false;
      });
      
      if (filteredRequests.length === 0) {
        throw new RpcException({
          message: `No land requests found for user with ID ${userId}`,
          statusCode: 404
        });
      }
      
      return userRequests;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException({
        message: `Failed to fetch land requests: ${error.message}`,
        statusCode: error.name === 'CastError' ? 400 : 500
      });
    }
  }

  async addRequestToLand(createLandRequestDto: CreateLandRequestDto): Promise<{ success: boolean; message: string }> {
    try {
      // Check if the land exists
      const land = await this.landModel.findById(createLandRequestDto.landId).exec();
      if (!land) {
        throw new RpcException({
          message: `Land with ID ${createLandRequestDto.landId} not found`,
          statusCode: 404
        });
      }
      
      // Check if the land is available for rent
      if (!land.forRent) {
        throw new RpcException({
          message: `Land with ID ${createLandRequestDto.landId} is not available for rent`,
          statusCode: 400
        });
      }
      
      // Checking if the user already has a request for this land
      const existingRequest = await this.landRequestModel.findOne({ 
        landId: new Types.ObjectId(createLandRequestDto.landId), 
        requestingUser: new Types.ObjectId(createLandRequestDto.requestingUser) 
      }).exec();
      
      if (existingRequest) {
        throw new RpcException({
          message: 'You already have a pending request for this land',
          statusCode: 400
        });
      }
      
      // Create a new request
      let landRequest = new this.landRequestModel();
      landRequest.requestingUser = new Types.ObjectId(createLandRequestDto.requestingUser);
      landRequest.landId = new Types.ObjectId(createLandRequestDto.landId);
      landRequest.requestDate = new Date().toString();
      landRequest.status = 'pending';
      
      console.log('Creating new land request:', landRequest);
      await landRequest.save();
      
      return landRequest;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      console.error('Error creating land request:', error);
      throw new RpcException({
        message: `Failed to create land request: ${error.message}`,
        statusCode: error.name === 'CastError' ? 400 : 500
      });
    }
  }

  async acceptRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    try {
      const preRequest = await this.landRequestModel.findById(requestId).populate("requestingUser landId").exec();
      
      if (!preRequest) {
        throw new RpcException({
          message: `Request with ID ${requestId} not found`,
          statusCode: 404
        });
      }
      
      if (preRequest.status !== "pending") {
        throw new RpcException({
          message: `Request with ID ${requestId} is not in pending status`,
          statusCode: 400
        });
      }
      
      await this.landRequestModel.findByIdAndUpdate(
        requestId, 
        { status: 'accepted' }
      ).exec();
      
      const land = await this.landModel.findById(preRequest.landId).exec();
      
      if (!land) {
        throw new RpcException({
          message: `Land with ID ${preRequest.landId} not found`,
          statusCode: 404
        });
      }
      
      land.fromDate = new Date(Date.now()).toLocaleString();
      land.toDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleString();
      land.rentingUser = preRequest.requestingUser;
      land.forRent = false;
      
      await this.landModel.findByIdAndUpdate(preRequest.landId, land).exec();
      
      let blockchainRequest = {
        ownerId : land.user._id.toString(),
        requestingUser: preRequest.requestingUser.toString(),
        userName : preRequest.requestingUser.name,
        fromDate: land.fromDate,
        toDate: land.toDate,
        landId: preRequest.landId._id.toString(),
        landName: land.name,
        landLocation: land.cordonate,
        rentPrice: land.rentPrice.toString(),
        totalPrice: (land.rentPrice * 12).toString()
      };
      
      await this.client.emit(BLOCKCHAIN_PATTERNS.BLOCKCHAIN_CREATE_LAND_REQUEST, blockchainRequest).toPromise();
      
      return preRequest;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      console.error('Error accepting land request:', error);
      throw new RpcException({
        message: `Failed to accept land request: ${error.message}`,
        statusCode: error.name === 'CastError' ? 400 : 500
      });
    }
  }

  async rejectRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    try {
      const preRequest = await this.landRequestModel.findById(requestId).exec();
      
      if (!preRequest) {
        throw new RpcException({
          message: `Request with ID ${requestId} not found`,
          statusCode: 404
        });
      }
      
      if (preRequest.status !== "pending") {
        throw new RpcException({
          message: `Request with ID ${requestId} is not in pending status`,
          statusCode: 400
        });
      }
      
      await this.landRequestModel.findByIdAndUpdate(
        requestId, 
        { status: 'rejected' }
      ).exec();
      
      return preRequest;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      console.error('Error rejecting land request:', error);
      throw new RpcException({
        message: `Failed to reject land request: ${error.message}`,
        statusCode: error.name === 'CastError' ? 400 : 500
      });
    }
  }
}