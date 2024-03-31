import { expect, test } from 'vitest'

import { Queue } from './queue'

const sum = (a, b) => a + b;

test('construction test', async () => {
  const q = new Queue();
  q.push(1);
  expect(q.items[0]).toBe(1)
})

test('iteration test', async () => {
  const q = new Queue([1,2,3,4,5]);
  let sum = 0;
  q.close()
  await q.pForEach(async (x) => {sum += x})
  expect(sum).toBe(15);
})

test('parallel iteration test', async () => {
  const q = new Queue([1,2,3,4,5]);
  const events = [];
  const sleep = (n) => new Promise((resolve) => {setTimeout(resolve, n)});
  await Promise.all([
    q.pForEach(async (x) => {events.push(x); await sleep(10); events.push(x)}, 4),
    sleep(50).then(() => {q.push(6); q.close()}),
  ]);
  expect(events).toStrictEqual([1,2,3,4,1,5,2,3,4,5,6,6]);
})

test('write to closed queue', async () => {
  const q = new Queue();
  q.close();
  expect(() => q.push(1)).toThrowError();
})
