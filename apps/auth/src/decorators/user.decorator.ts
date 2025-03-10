import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator((data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request.user);
    return request.user;
});