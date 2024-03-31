# dpwm-queue

A simple array-backed queue with parallel worker-based consumption. It is useful for io-bound tasks that can be parallelised, such as parallel downloads using p workers.


## Usage

### Putting items into the queue

Items are put in either at construction:

```javascript
import { Queue } from "dpwm-queue";
const q = new Queue([1, 2, 3]);
```

or using push:

```javascript
import { Queue } from "dpwm-queue";
const q = new Queue();
q.push(1);
q.push(2);
```

### Iterating over the queue

Items are never removed; they are designed to be iterated over using pForEach.

pForEach is a parallel forEach. It takes an async function as a callback.

Warning: this does not free up memory as items are consumed. 

```javascript
import { Queue } from "dpwm-queue";
const q = new Queue([1, 2, 3]);
q.close(); // The queue can be left open, which can be useful.

await q.pForEach(
    async (x, n) => {},
    2 // Number of workers. Default is 1.
    );
```

