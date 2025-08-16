import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateSettingDto, SettingsQueryDto } from './dto/settings.dto';

@ApiTags('系统设置')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: '获取系统设置' })
  @ApiQuery({ name: 'category', required: false, description: '设置分类' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSettings(@Query() query: SettingsQueryDto) {
    const settings = await this.settingsService.getSettings(query.category);
    
    return {
      message: '获取成功',
      success: true,
      data: settings,
    };
  }

  @Get(':key')
  @ApiOperation({ summary: '获取单个设置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '设置不存在' })
  async getSetting(@Param('key') key: string) {
    const setting = await this.settingsService.getSetting(key);
    
    return {
      message: '获取成功',
      success: true,
      data: setting,
    };
  }

  @Put(':key')
  @ApiOperation({ summary: '更新设置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '设置不存在' })
  async updateSetting(
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    const setting = await this.settingsService.updateSetting(key, updateSettingDto);
    
    return {
      message: '设置更新成功',
      success: true,
      data: setting,
    };
  }

  @Get('categories/list')
  @ApiOperation({ summary: '获取设置分类列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCategories() {
    const categories = await this.settingsService.getCategories();
    
    return {
      message: '获取成功',
      success: true,
      data: categories,
    };
  }
}