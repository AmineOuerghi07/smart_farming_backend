import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { IdentityService } from './identity.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../guards/auth.guard';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';

@Controller()
export class IdentityController {

    constructor(private identityService: IdentityService) { }

  

    @MessagePattern(AUTH_PATTERNS.REGISTER)
    async register(command) {
        try
        {
            let user = this.identityService.register(command);

            return user;
        }catch(e)
        {
            throw e;
        }
        
    }

   
    @MessagePattern(AUTH_PATTERNS.LOGIN)
    async login(@Payload() command : LoginDto, @Ctx() context: RmqContext) {
       
        console.log('command user: ', command.email);
        //const channel = context.getChannelRef();

        try
        {
            let response = await this.identityService.login(command);
            //channel.ack(context.getMessage());
            return response;
        }catch(e)
        {
            throw e;
        }
        
        
    }
  

    @MessagePattern('me')
    async me(command) {
        const { id, ...rest } = command.user;

        return rest;
    }

    @MessagePattern(AUTH_PATTERNS.IS_AUTHENTICATED)
    async isAuthenticated(command) {
        try {
            const res = this.identityService.validateToken(command.jwt);

            return res;
        }
        catch (err) {
            return false;
        }
    }

    ///
    //@UseGuards(AuthGuard)
    @MessagePattern(AUTH_PATTERNS.UPDATE_USER)
    async updateUser(@Payload() command) {
      return this.identityService.updateUser(command.id, command.updateData);
    }
  
   
    @MessagePattern(AUTH_PATTERNS.DELETE_USER)
    async deleteUser(@Payload() command) {
      return this.identityService.deleteUser(command.id);
    }

    @MessagePattern(AUTH_PATTERNS.GOOGLE_LOGIN)
    async googleLogin(command) {
        return this.identityService.googleLogin(command);
    }

    @EventPattern(AUTH_PATTERNS.CANCEL_REGISTER)
    async cancelRegister(id : string)
    {
        await this.identityService.cancelRegistration(id)
    }

    @EventPattern(AUTH_PATTERNS.CANCEL_REMOVE)
    async cancelRemove(id : string)
    {
        await this.identityService.cancelRemove(id)
    }

    @EventPattern(AUTH_PATTERNS.CANCEL_UPDATE)
    async cancelUpdate(id : string)
    {
        await this.identityService.cancelUpdate(id)
    }
    @MessagePattern(AUTH_PATTERNS.FIND_ONE)
    async findOne(@Payload() command) {
        try {
            const user = await this.identityService.findOne(command.id);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

}