import type {Job} from "../../shared/types/Job.type";
import {jobs as eNabavkiJobs} from "../../modules/eNabavki/jobs";

export const jobs: Job[] = [
    ...eNabavkiJobs,
]