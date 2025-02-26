import { Module } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";


@Module({

    providers:[{
        provide: 'APP_INTERCEPTOR',
        useClass: AuthGuard,
      },
    ]
}) export class AuthModule {}
