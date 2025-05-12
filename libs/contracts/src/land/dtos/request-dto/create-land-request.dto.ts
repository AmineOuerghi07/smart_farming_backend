import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateLandRequestDto
{
    @IsNotEmpty()
    requestingUser: string;

    @IsNotEmpty()
    landId: string; 

}