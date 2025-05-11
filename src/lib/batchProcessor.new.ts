import type { Redis } from 'ioredis';
import redis from './redis';
import mongoose from 'mongoose';
import Customer from '@/models/Customer';
import CommunicationLog from '@/models/CommunicationLog';

interface CustomerRecord {
  _id: string;
  phone?: string;
  email?: string;
}

// Helper function to convert filter values to proper types
function convertFilterValues(filter: Record<string, any>): Record<string, any> {
  const convertedFilter: Record<string, any> = {};
  const numericFields = ['spend', 'visits', 'orders', 'avg_order_value', 'clv'];

  for (const [field, condition] of Object.entries(filter)) {
    if (field === '$and' || field === '$or') {
      const conditionsArray = Array.isArray(condition) ? condition : [condition];
      convertedFilter[field] = conditionsArray.map((subCondition) => convertFilterValues(subCondition));
    } else if (typeof condition === 'object' && condition !== null) {
      const operatorConditions: Record<string, any> = {};
      for (const [operator, value] of Object.entries(condition)) {
        if (operator === '$regex' && typeof value === 'string') {
          operatorConditions[operator] = new RegExp(value, 'i');
        } else if (['$gt', '$gte', '$lt', '$lte', '$eq', '$ne'].includes(operator)) {
          if (numericFields.includes(field)) {
            let numValue: number;
            if (typeof value === 'string') {
              numValue = Number(value.replace(/['"]/g, ''));
            } else {
              numValue = Number(value);
            }
            if (isNaN(numValue)) {
              throw new Error(`Invalid numeric value for field ${field}: ${value}`);
            }
            operatorConditions[operator] = numValue;
          } else {
            operatorConditions[operator] = value;
          }
        } else {
          operatorConditions[operator] = value;
        }
      }
      convertedFilter[field] = operatorConditions;
    } else {
      if (numericFields.includes(field) && (typeof condition === 'string' || typeof condition === 'number')) {
        const numValue = Number(String(condition).replace(/['"]/g, ''));
        if (isNaN(numValue)) {
          throw new Error(`Invalid numeric value for field ${field}: ${condition}`);
        }
        convertedFilter[field] = numValue;
      } else {
        convertedFilter[field] = condition;
      }
    }
  }

  return convertedFilter;
}

interface DeliveryReceipt {
  customerId: string;
  message: string;
  status: string;
  timestamp: Date;
  campaignId?: string;
}

interface MessageBatch {
  segmentId: string;
  messageContent: string;
  audienceFilter: Record<string, any>;
  campaignId?: string;
}

class BatchProcessor {
  private batchSize: number;
  private processingInterval: number;
  private isProcessing: boolean;
  private redis: Redis;
  private messageQueueKey = 'message:queue';
  private receiptQueueKey = 'receipt:queue';
  private static instance: BatchProcessor;

  private constructor() {
    this.batchSize = 50;
    this.processingInterval = 5000;
    this.isProcessing = false;
    this.redis = redis;
    this.startProcessing();
  }

  public static getInstance(): BatchProcessor {
    if (!BatchProcessor.instance) {
      BatchProcessor.instance = new BatchProcessor();
    }
    return BatchProcessor.instance;
  }

  public async addMessageBatch(batch: MessageBatch): Promise<void> {
    try {
      await this.redis.lpush(this.messageQueueKey, JSON.stringify(batch));
      console.log(`Added message batch to queue for segment ${batch.segmentId}`);
    } catch (error) {
      console.error('Error adding message batch to queue:', error);
      throw error;
    }
  }

  public async addReceipt(receipt: DeliveryReceipt): Promise<void> {
    try {
      await this.redis.lpush(this.receiptQueueKey, JSON.stringify(receipt));
      console.log(`Added delivery receipt to queue for customer ${receipt.customerId}`);
    } catch (error) {
      console.error('Error adding receipt to queue:', error);
      throw error;
    }
  }

  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.isProcessing) {
      try {
        await this.processMessageQueue();
        await this.processReceiptQueue();
        await new Promise(resolve => setTimeout(resolve, this.processingInterval));
      } catch (error) {
        console.error('Error in batch processing:', error);
      }
    }
  }

  private async processMessageQueue(): Promise<void> {
    const queueSize = await this.redis.llen(this.messageQueueKey);
    if (queueSize === 0) return;

    const itemsToProcess = Math.min(queueSize, this.batchSize);
    const batch: MessageBatch[] = [];

    for (let i = 0; i < itemsToProcess; i++) {
      const item = await this.redis.rpop(this.messageQueueKey);
      if (item) {
        batch.push(JSON.parse(item));
      }
    }

    if (batch.length > 0) {
      await this.processMessages(batch);
    }
  }

  private async processReceiptQueue(): Promise<void> {
    const queueSize = await this.redis.llen(this.receiptQueueKey);
    if (queueSize === 0) return;

    const itemsToProcess = Math.min(queueSize, this.batchSize);
    const batch: DeliveryReceipt[] = [];

    for (let i = 0; i < itemsToProcess; i++) {
      const item = await this.redis.rpop(this.receiptQueueKey);
      if (item) {
        batch.push(JSON.parse(item));
      }
    }

    if (batch.length > 0) {
      await this.processReceipts(batch);
    }
  }

  private async processMessages(batches: MessageBatch[]): Promise<void> {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const batch of batches) {
          const convertedFilter = convertFilterValues(batch.audienceFilter);
          
          const customers = await Customer.find(convertedFilter)
            .select('_id phone email')
            .lean() as CustomerRecord[];

          const logs = customers.map((customer: CustomerRecord) => ({
            customerId: customer._id,
            segmentId: batch.segmentId,
            campaignId: batch.campaignId,
            messageContent: batch.messageContent,
            status: 'pending',
            channel: customer.phone ? 'sms' : 'email',
            timestamp: new Date()
          }));

          const subBatchSize = 100;
          for (let i = 0; i < logs.length; i += subBatchSize) {
            const subBatch = logs.slice(i, i + subBatchSize);
            await CommunicationLog.insertMany(subBatch, { session });
          }

          console.log(`Processed message batch for segment ${batch.segmentId} with ${customers.length} recipients`);
        }
      });
    } catch (error) {
      console.error('Error processing message batch:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private async processReceipts(receipts: DeliveryReceipt[]): Promise<void> {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const updates = receipts.map(receipt => ({
          updateOne: {
            filter: {
              customerId: receipt.customerId,
              status: 'pending'
            },
            update: {
              $set: {
                status: receipt.status,
                deliveryTimestamp: receipt.timestamp,
                lastUpdated: new Date()
              }
            }
          }
        }));

        await CommunicationLog.bulkWrite(updates, { session });
        console.log(`Processed ${receipts.length} delivery receipts`);
      });
    } catch (error) {
      console.error('Error processing delivery receipts:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  public stop(): void {
    this.isProcessing = false;
  }
}

// Create the singleton instance
const batchProcessor = BatchProcessor.getInstance();

// Export the singleton instance
export { batchProcessor };
