import { randomUUID } from 'crypto';

export type JobStatus = 'pending' | 'running' | 'done' | 'failed';

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: {
    inserted: number;
    skipped: number;
    errors: string[];
  };
  error?: string;
}

// In-memory store — jobs are lost on server restart, which is fine
// for one-off imports. Replace with Redis later if needed.
const jobs = new Map<string, Job>();

export function createJob(type: string): Job {
  const job: Job = {
    id: randomUUID(),
    type,
    status: 'pending',
    createdAt: new Date(),
  };
  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, updates: Partial<Job>): void {
  const job = jobs.get(id);
  if (job) {
    jobs.set(id, { ...job, ...updates });
  }
}

export function listJobs(): Job[] {
  return Array.from(jobs.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 50); // keep last 50 jobs
}
