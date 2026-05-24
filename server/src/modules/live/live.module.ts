import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { LiveStream, LiveStreamSchema } from './schemas/live.schema';
import { LiveMessage, LiveMessageSchema } from './schemas/live-message.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Channel, ChannelSchema } from '../channels/schemas/channel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveStream.name, schema: LiveStreamSchema },
      { name: LiveMessage.name, schema: LiveMessageSchema },
      { name: User.name, schema: UserSchema },
      { name: Channel.name, schema: ChannelSchema },
    ]),
  ],
  controllers: [LiveController],
  providers: [LiveService],
  exports: [LiveService],
})
export class LiveModule {}
