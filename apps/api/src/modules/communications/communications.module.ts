import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    TemplatesController,
    MessagesController,
    CampaignsController,
    PreferencesController,
    TicketsController,
  ],
  providers: [
    TemplatesService,
    MessagesService,
    CampaignsService,
    PreferencesService,
    TicketsService,
  ],
  exports: [
    TemplatesService,
    MessagesService,
    CampaignsService,
    PreferencesService,
    TicketsService,
  ],
})
export class CommunicationsModule {}