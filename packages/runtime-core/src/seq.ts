export default function getSequence(nums) {
  const len = nums.length;
  const result = [0];
  const p = [0];
  for (let i = 0; i < len; i++) {
    const num = nums[i];
    if (num !== 0) {
      const resultLastIndex = result[result.length - 1];
      if (nums[resultLastIndex] < num) {
        p[i] = resultLastIndex;
        result.push(i);
      } else {
        let left = 0;
        let right = result.length - 1;
        while (left <= right) {
          const mid = Math.floor((left + right) / 2);
          if (nums[result[mid]] < num) left = mid + 1;
          else right = mid - 1;
        }
        if (num < nums[result[left]]) {
          p[i] = result[left - 1];
          result[left] = i;
        }
      }
    }
  }
  let m = result.length;
  let last = result[m - 1];
  for (let i = m - 1; i >= 0; i--) {
    result[i] = last;
    last = p[last];
  }
  return result;
}
