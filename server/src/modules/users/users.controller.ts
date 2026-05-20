import { Controller, Post, Get, Body, Query, Param, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('history')
  async getHistory(@Query('userId') userId: string) {
    return this.usersService.getHistory(userId);
  }

  @Get('purchased')
  async getPurchasedVideos(@Query('userId') userId: string) {
    return this.usersService.getPurchasedVideos(userId);
  }

  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Get('profile-by-email')
  async getProfileByEmail(@Query('email') email: string) {
    return this.usersService.getUserByEmail(email);
  }

  @Get('profile-by-username')
  async getProfileByUsername(@Query('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @Post('history')
  async addToHistory(@Body('userId') userId: string, @Body('videoId') videoId: string) {
    return this.usersService.addToHistory(userId, videoId);
  }

  @Post('login')
  async login(@Body() loginDto: { phone: string; password: string }) {
    const user = await this.usersService.validateUser(loginDto.phone, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không chính xác');
    }
    return user;
  }

  @Post('register')
  async register(@Body() registerDto: { username: string; phone: string; password: string }) {
    try {
      const user = await this.usersService.register(registerDto);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('google-login')
  async googleLogin(@Body() googleData: any) {
    return this.usersService.createOrUpdateGoogleUser(googleData);
  }

  @Post('facebook-login')
  async facebookLogin(@Body() facebookData: any) {
    try {
      return await this.usersService.createOrUpdateFacebookUser(facebookData);
    } catch (error: any) {
      console.error('[CONTROLLER FACEBOOK ERROR]:', error);
      throw new BadRequestException(error.message || 'Lỗi đăng nhập Facebook');
    }
  }

  @Post('github-login')
  async githubLogin(@Body() githubData: any) {
    try {
      return await this.usersService.createOrUpdateGithubUser(githubData);
    } catch (error: any) {
      console.error('[CONTROLLER GITHUB ERROR]:', error);
      throw new BadRequestException(error.message || 'Lỗi đăng nhập GitHub');
    }
  }

  @Post('discord-login')
  async discordLogin(@Body() discordData: any) {
    try {
      return await this.usersService.createOrUpdateDiscordUser(discordData);
    } catch (error: any) {
      console.error('[CONTROLLER DISCORD ERROR]:', error);
      throw new BadRequestException(error.message || 'Lỗi đăng nhập Discord');
    }
  }

  @Post('upgrade-premium')
  async upgradePremium(@Body('userId') userId: string) {
    try {
      const res = await this.usersService.upgradePremium(userId);
      return res;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}
