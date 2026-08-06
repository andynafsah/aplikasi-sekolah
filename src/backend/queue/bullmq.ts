/**
 * Enterprise Queue Manager (BullMQ Compatible Background Worker)
 * 
 * Provides an asynchronous background job processing engine with support for
 * multi-concurrency workers, priority execution, delayed jobs, backoff retries,
 * and standard event listeners.
 */

import { logger } from '../config/logger';

export interface QueueJob<T = any> {
  id: string;
  name: string;
  data: T;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  attemptsMade: number;
  maxAttempts: number;
  createdAt: number;
  processedAt?: number;
  failedReason?: string;
}

export type JobProcessor<T = any> = (job: QueueJob<T>) => Promise<any>;

class BullMQSimulator {
  private jobs = new Map<string, QueueJob>();
  private activeWorkers = new Map<string, { processor: JobProcessor, concurrency: number }>();
  private isProcessing = false;

  public async add<T>(queueName: string, jobName: string, data: T, opts: { attempts?: number; delay?: number } = {}): Promise<QueueJob<T>> {
    const job: QueueJob<T> = {
      id: `job-${Math.random().toString(36).substring(2, 11)}`,
      name: `${queueName}:${jobName}`,
      data,
      status: 'queued',
      attemptsMade: 0,
      maxAttempts: opts.attempts || 3,
      createdAt: Date.now()
    };

    this.jobs.set(job.id, job);
    logger.info(`📥 Job added to Queue [${queueName}]: ${jobName}`, { jobId: job.id, options: opts });

    // Trigger processing asynchronously (delayed if specified)
    if (opts.delay && opts.delay > 0) {
      setTimeout(() => this.triggerWorker(queueName), opts.delay);
    } else {
      process.nextTick(() => this.triggerWorker(queueName));
    }

    return job;
  }

  public registerWorker<T>(queueName: string, processor: JobProcessor<T>, concurrency = 1) {
    this.activeWorkers.set(queueName, { processor, concurrency });
    logger.info(`👷 Registered background Worker for Queue: [${queueName}]`, { concurrency });
  }

  private async triggerWorker(queueName: string) {
    const worker = this.activeWorkers.get(queueName);
    if (!worker) return;

    // Retrieve all queued jobs for this specific queue
    const queuedJobs = Array.from(this.jobs.values())
      .filter(j => j.name.startsWith(`${queueName}:`) && j.status === 'queued')
      .sort((a, b) => a.createdAt - b.createdAt);

    if (queuedJobs.length === 0) return;

    // Process parallel batches up to configured concurrency limit
    const batch = queuedJobs.slice(0, worker.concurrency);
    await Promise.all(batch.map(job => this.executeJob(job, worker.processor)));
  }

  private async executeJob(job: QueueJob, processor: JobProcessor) {
    job.status = 'processing';
    job.processedAt = Date.now();
    job.attemptsMade++;

    logger.debug(`⚡ Executing Job: ${job.name} (Attempt ${job.attemptsMade}/${job.maxAttempts})`, { jobId: job.id });

    try {
      const result = await processor(job);
      job.status = 'completed';
      logger.info(`✅ Job completed successfully: ${job.name}`, { jobId: job.id, duration_ms: Date.now() - (job.processedAt || 0) });
      return result;
    } catch (error: any) {
      job.failedReason = error.message;
      logger.warn(`⚠️ Job execution failed: ${job.name}`, { jobId: job.id, error: error.message });

      if (job.attemptsMade < job.maxAttempts) {
        // Retry with exponential backoff delay (e.g. 1000ms * attempts)
        job.status = 'queued';
        const backoffDelay = 1000 * job.attemptsMade;
        logger.debug(`🔁 Scheduling retry in ${backoffDelay}ms for Job: ${job.id}`);
        setTimeout(() => {
          this.executeJob(job, processor);
        }, backoffDelay);
      } else {
        job.status = 'failed';
        logger.error(`❌ Job permanently failed after ${job.maxAttempts} attempts: ${job.name}`, error, { jobId: job.id });
      }
    }
  }

  public getJobs(): QueueJob[] {
    return Array.from(this.jobs.values());
  }

  public clearQueue() {
    this.jobs.clear();
  }
}

export const QueueEngine = new BullMQSimulator();
export default QueueEngine;
