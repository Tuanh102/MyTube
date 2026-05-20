import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { UsersModule } from './modules/users/users.module';
import { VideosModule } from './modules/videos/videos.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { CommentsModule } from './modules/comments/comments.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AdminModule } from './modules/admin/admin.module';
import { SupportModule } from './modules/support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: [
        join(__dirname, '../../.env'),
        join(process.cwd(), '../.env'),
        join(process.cwd(), '.env'),
        '.env'
      ]
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mytube'),
    UsersModule,
    VideosModule,
    ChannelsModule,
    PlaylistsModule,
    CommentsModule,
    PaymentsModule,
    AdminModule,
    SupportModule,
  ],
})
export class AppModule {}
