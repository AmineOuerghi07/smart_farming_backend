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

  @MessagePattern(USER_PATTERNS.UPDATE)
  async update(@Payload() updateUserDto: UpdateUserDto) {
    console.log(updateUserDto)
    try
    {
      let user = await this.usersService.update(updateUserDto._id.toString(), updateUserDto);
      console.log(user)
      return user;
    }catch(e)
    {
      throw e;
    }
  }

  @EventPattern(USER_PATTERNS.REMOVE)
  async remove(@Payload() id: string) {
    return await this.usersService.remove(id);
  }

  @EventPattern(USER_PATTERNS.USER_CANCEL_CREATION)
  async cancelCreate(@Payload() id : string)
  {
    await this.usersService.cancelCreation(id)
  }

  @EventPattern(USER_PATTERNS.USER_CANCEL_UPDATE)
  async cancelUpdate(@Payload() id : string)
  {
    await this.usersService.cancelUpdate(id)
  }

  @EventPattern(USER_PATTERNS.USER_CANCEL_REMOVE)
  async cancelRemove(@Payload() id : string)
  {
    await this.usersService.cancelRemove(id)
  }
}
