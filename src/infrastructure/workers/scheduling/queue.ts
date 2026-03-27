import PQueue from 'p-queue';

const queue = new PQueue({
    concurrency: 1,
    timeout: 60000,
});

export default queue;
