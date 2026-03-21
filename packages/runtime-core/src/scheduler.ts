const queue = [];
let isFlashing = false;
const resolvePromise = Promise.resolve();

export function queueJob(job) {
  if (!queue.includes(job)) queue.push(job);
  if (!isFlashing) {
    isFlashing = true;
    resolvePromise.then(() => {
      isFlashing = false;
      const copy = queue.slice();
      queue.length = 0;
      copy.forEach((job) => job());
      copy.length = 0;
    });
  }
}
