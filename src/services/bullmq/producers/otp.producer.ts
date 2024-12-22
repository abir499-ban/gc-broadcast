import { Injectable } from '@nestjs/common';
import { OTP_QUEUE } from '../constants/queues';
import { JobsOptions, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class OtpProducer {
  constructor(@InjectQueue(OTP_QUEUE) private otpQueue: Queue) {}
  async pushForAsyncStream(
    jobName: string,
    data: Record<string, any>,
    options?: JobsOptions,
  ) {
    await this.otpQueue.add(jobName, data, options);
    console.log(`Job "${jobName}" added to the queue successfully.`);
  }
}
