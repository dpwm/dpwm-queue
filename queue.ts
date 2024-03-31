interface IQueue<T> {
  done: boolean,
  items: T[],

  push(T): void,
  close(T): void,
  pForEach(f: (T, number) => Promise<void>, p?: number, retries?: number, onError?: any ): Promise<void>,
}

export class Queue<T> implements IQueue<T> {
  done = false;
  items;
  private resolvers = [];

  constructor(items: T[] = []) {
    this.items = items;
  }

  private resolve() {
    this.resolvers.forEach(f => f());
    this.resolvers = [];
  }

  push(x) {
    if (this.done) {
      throw new Error("Queue closed");
    }
    this.items.push(x);
    this.resolve();
  }

  close() {
    this.done = true;
    this.resolve();
  }

  pForEach(f, p=1, retries=10, onError=(x,n,errors) => {console.log(x, n, errors)}) {
    // Parallel forEach that minimises wasted time and automatically retries on failure
    const self = this;
    let n = 0;

    async function worker() {
      while (true) {
        if (n >= self.items.length && self.done) return;
        if (n >= self.items.length) {
          // wait for more entries
          await new Promise((r) => self.resolvers.push(r));
          continue;
        };
        const y = n++;
        let i;
        let errors = [];

        for (i=0; i<retries; i++) {
          try {
            await f(self.items[y], y);
            break;
          } catch (e) {
            errors.push(e);
          }
        }

        if (errors.length) {
          onError(self.items[y], y, errors);
        }
      }
    }

    return Promise.all(Array.from(new Array(p), worker)).then(_ => undefined);
  }
}
