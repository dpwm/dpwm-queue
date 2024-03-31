export class Queue<T> {
  done: boolean = false;
  items: T[];
  private resolvers:((value?: undefined) => void)[] = [];

  constructor(items: T[] = []) {
    this.items = items;
  }

  private resolve():void {
    this.resolvers.forEach(f => f());
    this.resolvers = [];
  }

  push(x: T): void {
    if (this.done) {
      throw new Error("Queue closed");
    }
    this.items.push(x);
    this.resolve();
  }

  close(): void {
    this.done = true;
    this.resolve();
  }

  pForEach(f: (x: T, n: number) => Promise<void>, p:number=1, retries:number=10, onError:any=(x:T,n:number,errors:Error[]) => {console.log(x, n, errors)}) {
    // Parallel forEach that minimises wasted time and automatically retries on failure
    const self = this;
    let n = 0;

    async function worker() {
      while (true) {
        if (n >= self.items.length && self.done) return;
        if (n >= self.items.length) {
          // wait for more entries
          await new Promise((r: (value?: undefined) => void) => self.resolvers.push(r));
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
