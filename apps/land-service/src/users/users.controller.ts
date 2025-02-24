import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectId } from 'mongoose';
import { USER_PATTERNS } from '@app/contracts/land/user.patterns';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @EventPattern(USER_PATTERNS.CREATE)
  async create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern(USER_PATTERNS.FIND_ALL)
  async findAll() {
    console.log("hi there !! ")
    return await this.usersService.findAll();
  }

  @MessagePattern(USER_PATTERNS.FIND_ONE)
  async findOne(@Payload() id: string) {
    return this.usersService.findOne(id);
  }

  @EventPattern(USER_PATTERNS.UPDATE)
  async update(@Payload() updateUserDto: UpdateUserDto) {
    console.log(updateUserDto)
    let user = await this.usersService.update(updateUserDto._id.toString(), updateUserDto);
    console.log(user)
    return user;
  }

  @EventPattern(USER_PATTERNS.REMOVE)
  async remove(@Payload() id: string) {
    return this.usersService.remove(id);
  }
}
