# dpwm-queue

A simple array-backed queue with parallel worker-based consumption. It is useful for io-bound tasks that can be parallelised, such as parallel downloads using p workers.


## Usage

### Putting items into the queue

Items are put in either at construction or using push.


### Iterating over the queue

Items are never removed; they are designed to be iterated over using pForEach.

pForEach is a parallel forEach. It takes an async function as a callback.

Warning: this does not free up memory as items are consumed. 
