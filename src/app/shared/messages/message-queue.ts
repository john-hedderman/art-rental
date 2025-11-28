import * as Const from '../../constants';

function _sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MessageQueue {
  output!: any;
  delay = Const.STD_DELAY;
  queue: string[] = [];
  isProcessing = false;

  constructor(outputFunction: any, delay = Const.STD_DELAY) {
    this.output = outputFunction;
    this.delay = delay;
    this.queue = [];
    this.isProcessing = false;
  }

  addMessage(message: string) {
    this.queue.push(message);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      this.output(message);
      await _sleep(this.delay);
    }
    this.isProcessing = false;
  }
}
