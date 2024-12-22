import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../users/decorator/user.decorator';
import { Users } from './schemas/users.schema';
import { Public } from '../auth/decorators/public.decorator';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Get()
  async find(@Query() query: Record<string, any>) {
    return await this.usersService._find(query);
  }

  @Get('/:id?')
  async get(@Query() query: Record<string, any>, @Param('id') id: string) {
    return await this.usersService._get(id, query);
  }

  @Public()
  @Post()
  async create(@Body() createUsersDto: Users) {
    await this.verifyOTP(createUsersDto);

    const saltOrRounds = 10;
    const password = await bcrypt.hash(createUsersDto.password, saltOrRounds);

    const user = (await this.usersService._create({
      ...createUsersDto,
      password,
    })) as Users;

    // await this.removeOTP(createUsersDto.email);
    const sanitizedUser = this.usersService.sanitizeUser(user);
    const payload = { sub: { id: user._id }, user };

    return {
      user: sanitizedUser,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  @Patch('/:id?')
  async patch(
    @Query() query,
    @Body() patchUsersDto: Partial<Users>,
    @Param('id') id,
  ) {
    return await this.usersService._patch(id, patchUsersDto, query);
  }

  @Delete('/:id?')
  async delete(@Param('id') id, @Query() query, @User() user) {
    return await this.usersService._remove(id, query, user);
  }

  async verifyOTP(createUsersDto: Users) {
    if (!Object.keys(createUsersDto).includes('otp')) {
      throw new BadRequestException('OTP not provided!');
    }
    console.log({ createUsersDto });
  }
}
