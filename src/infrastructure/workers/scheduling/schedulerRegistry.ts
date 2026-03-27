import { scheduledJobs as eNabavkiJobs } from '../../../modules/eNabavki/jobs.js';
import type { Job } from '../../../shared/types/Job.type.js';

export const jobs: Job[] = [...eNabavkiJobs];
