import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SendCodeDto, VerifyCodeDto } from './dto/auth.dto';

@ApiTags('认证')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送验证码' })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  @ApiResponse({ status: 429, description: '请求过于频繁' })
  async sendCode(@Body() sendCodeDto: SendCodeDto, @Req() req: Request) {
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    await this.authService.sendVerificationCode(
      sendCodeDto.email,
      clientIp,
      userAgent,
    );
    
    return {
      message: '验证码已发送到您的邮箱',
      success: true,
    };
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '验证登录码' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '验证码错误或已过期' })
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto, @Req() req: Request) {
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    const result = await this.authService.verifyCodeAndLogin(
      verifyCodeDto.email,
      verifyCodeDto.code,
      clientIp,
      userAgent,
    );
    
    return {
      message: '登录成功',
      success: true,
      data: result,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@Req() req: any) {
    const profile = await this.authService.getProfile(req.user.userId);
    
    return {
      message: '获取成功',
      success: true,
      data: profile,
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async refreshToken(@Req() req: any) {
    const result = await this.authService.refreshToken(req.user.userId);
    
    return {
      message: '令牌刷新成功',
      success: true,
      data: result,
    };
  }
}