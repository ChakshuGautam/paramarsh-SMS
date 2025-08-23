import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { TemplatesAltController } from './templates-alt.controller';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignsAltController } from './campaigns-alt.controller';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsAltController } from './tickets-alt.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    TemplatesController,
    TemplatesAltController,
    MessagesController,
    CampaignsController,
    CampaignsAltController,
    PreferencesController,
    TicketsController,
    TicketsAltController,
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