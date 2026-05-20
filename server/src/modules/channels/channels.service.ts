import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Channel, ChannelDocument } from './schemas/channel.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(createChannelDto: { channel_name: string; description?: string; user: string; avatar_url?: string; banner_url?: string }) {
    const newChannel = new this.channelModel(createChannelDto);
    const savedChannel = await newChannel.save();

    // Change user role to creator if it's their first channel
    const userChannelsCount = await this.channelModel.countDocuments({ user: createChannelDto.user });
    if (userChannelsCount === 1) {
      await this.userModel.findByIdAndUpdate(createChannelDto.user, { role: 'creator' });
    }

    return savedChannel;
  }

  async findByUser(userId: string) {
    return this.channelModel.find({ user: userId }).exec();
  }

  async findById(id: string) {
    return this.channelModel.findById(id).exec();
  }

  async update(id: string, updateData: { channel_name?: string; description?: string; avatar_url?: string; banner_url?: string }) {
    return this.channelModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string) {
    const channel = await this.channelModel.findById(id).exec();
    if (!channel) return null;

    const userId = channel.user.toString();
    await this.channelModel.findByIdAndDelete(id).exec();

    // Check if user has any channels left
    const remainingChannels = await this.channelModel.countDocuments({ user: userId });
    if (remainingChannels === 0) {
      await this.userModel.findByIdAndUpdate(userId, { role: 'viewer' });
    }

    return { success: true };
  }
}
