<<<<<<< HEAD
import { DEFAULT_BRANCH_ID } from '../../common/constants';
=======
>>>>>>> origin/main
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { PreferencesService } from './preferences.service';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { ListDocs, CreateDocs, UpdateDocs, DeleteDocs } from '../../common/swagger.decorators';

@ApiTags('Communication Preferences')
@Controller('comms/preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Put()
  @ApiOperation({ 
    summary: 'Create or update preference',
    description: 'Creates a new communication preference or updates an existing one for a specific owner and channel'
  })
  @CreateDocs('Preference created or updated successfully')
  upsert(@Body() upsertPreferenceDto: CreatePreferenceDto) {
    return this.preferencesService.upsert(upsertPreferenceDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all preferences',
    description: 'Retrieves communication preferences with optional filtering by owner type, owner ID, and channel'
  })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip', example: '0' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take', example: '20' })
  @ApiQuery({ name: 'ownerType', required: false, description: 'Filter by owner type', example: 'student' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'Filter by owner ID', example: 'student-123' })
  @ApiQuery({ name: 'channel', required: false, description: 'Filter by communication channel', example: 'sms' })
  @ListDocs('List of communication preferences')
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('ownerType') ownerType?: string,
    @Query('ownerId') ownerId?: string,
    @Query('channel') channel?: string,
  ) {
    const where: any = {};
    if (ownerType) where.ownerType = ownerType;
    if (ownerId) where.ownerId = ownerId;
    if (channel) where.channel = channel;

    return this.preferencesService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
    });
  }

  @Get(':ownerType/:ownerId')
  @ApiOperation({ 
    summary: 'Get preferences by owner',
    description: 'Retrieves all communication preferences for a specific owner'
  })
  @ApiParam({ name: 'ownerType', description: 'Type of owner (student, guardian, staff)', example: 'student' })
  @ApiParam({ name: 'ownerId', description: 'Owner ID', example: 'student-123' })
  @ListDocs('List of preferences for the specified owner')
  findByOwner(
    @Param('ownerType') ownerType: string,
    @Param('ownerId') ownerId: string,
  ) {
    return this.preferencesService.findByOwner(ownerType, ownerId);
  }

  @Get(':ownerType/:ownerId/:channel/consent')
  @ApiOperation({ 
    summary: 'Check consent status',
    description: 'Checks if the owner has given consent for communication via the specified channel'
  })
  @ApiParam({ name: 'ownerType', description: 'Type of owner (student, guardian, staff)', example: 'student' })
  @ApiParam({ name: 'ownerId', description: 'Owner ID', example: 'student-123' })
  @ApiParam({ name: 'channel', description: 'Communication channel', example: 'sms' })
  @ListDocs('Consent status for the specified owner and channel')
  async checkConsent(
    @Param('ownerType') ownerType: string,
    @Param('ownerId') ownerId: string,
    @Param('channel') channel: string,
  ) {
    const hasConsent = await this.preferencesService.checkConsent(
      ownerType,
      ownerId,
      channel,
    );
    return { hasConsent };
  }

  @Get(':ownerType/:ownerId/:channel/quiet-hours')
  @ApiOperation({ 
    summary: 'Check quiet hours status',
    description: 'Checks if the current time falls within the quiet hours for the specified owner and channel'
  })
  @ApiParam({ name: 'ownerType', description: 'Type of owner (student, guardian, staff)', example: 'student' })
  @ApiParam({ name: 'ownerId', description: 'Owner ID', example: 'student-123' })
  @ApiParam({ name: 'channel', description: 'Communication channel', example: 'sms' })
  @ListDocs('Quiet hours status for the specified owner and channel')
  async checkQuietHours(
    @Param('ownerType') ownerType: string,
    @Param('ownerId') ownerId: string,
    @Param('channel') channel: string,
  ) {
    const inQuietHours = await this.preferencesService.isInQuietHours(
      ownerType,
      ownerId,
      channel,
    );
    return { inQuietHours };
  }

  @Delete(':ownerType/:ownerId/:channel')
  @ApiOperation({ 
    summary: 'Delete preference',
    description: 'Removes a communication preference for the specified owner and channel'
  })
  @ApiParam({ name: 'ownerType', description: 'Type of owner (student, guardian, staff)', example: 'student' })
  @ApiParam({ name: 'ownerId', description: 'Owner ID', example: 'student-123' })
  @ApiParam({ name: 'channel', description: 'Communication channel', example: 'sms' })
  @DeleteDocs('Preference deleted successfully')
  remove(
    @Param('ownerType') ownerType: string,
    @Param('ownerId') ownerId: string,
    @Param('channel') channel: string,
  ) {
    return this.preferencesService.remove(ownerType, ownerId, channel);
  }

  @Post(':ownerType/:ownerId/bulk-consent')
  @ApiOperation({ 
    summary: 'Bulk update consent',
    description: 'Updates consent status for multiple channels for the specified owner'
  })
  @ApiParam({ name: 'ownerType', description: 'Type of owner (student, guardian, staff)', example: 'student' })
  @ApiParam({ name: 'ownerId', description: 'Owner ID', example: 'student-123' })
  @ApiBody({
    description: 'Array of consent settings for different channels',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          channel: { type: 'string', example: 'sms', enum: ['sms', 'email', 'push', 'whatsapp'] },
          consent: { type: 'boolean', example: true }
        },
        required: ['channel', 'consent']
      },
      example: [
        { channel: 'sms', consent: true },
        { channel: 'email', consent: false }
      ]
    }
  })
  @UpdateDocs('Consent preferences updated successfully')
  bulkUpdateConsent(
    @Param('ownerType') ownerType: string,
    @Param('ownerId') ownerId: string,
    @Body() consents: Array<{ channel: string; consent: boolean }>,
  ) {
    return this.preferencesService.bulkUpdateConsent(
      ownerType,
      ownerId,
      consents,
    );
  }
}