import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Video, VideoSchema } from '../videos/schemas/video.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { Admin, AdminSchema } from '../admin/schemas/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Video.name, schema: VideoSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
