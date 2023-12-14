import { percent } from './Math.js';
import _ from 'lodash';
import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';
import { Readline } from 'node:readline/promises';

const SPINNER_CHARACTERS = ['|', '/', '-', '\\'];

const PRINT_INTERVAL = 150;

export class ProgressMeter {

  constructor(total, options) {

    options = {
      showSpinner: true
    };

    this.total = total;

    this.progress = 0;

    this.percentProgress = 0;

    this.printTick = 0;

    Object.entries(options).forEach(([option, value]) => {
      this[option] = value;
    });

    if(this.showSpinner) {
      this.spinnerInterval = setInterval(() => this.print(), PRINT_INTERVAL);
    }

    this.out = new Readline(stdout, {
      autoCommit: true
    });

    this.printTimeout = null;

    console.log('');

  }

  tickProgress() {
    this.addProgress(); 
  }

  addProgress(progress = 1) {
    this._setProgress(this.progress + progress);
  }

  _setProgress(progress, silent = false) {
    this.progress = Math.min(progress, this.total);
    const prevPercentProgress = this.percentProgress;
    this.percentProgress = percent(this.progress, this.total);

    if(!silent && this.percentProgress > prevPercentProgress) {
      this.print();
    }

    if(this.progress === this.total) {
      this.print.cancel();
      clearInterval(this.spinnerInterval);

      this._print();

      console.log('');
    }
  }

  

  _print() {
    ++this.printTick;


    const progressSegments = Math.floor(this.percentProgress / 5);

    const meter = `[${''.padEnd(progressSegments, '=')}>${''.padEnd(20 - progressSegments, ' ')}] ${this.percentProgress.toString().padStart(3, ' ')}%`;

    
    const currentSpinner = this.progress === this.total ? '✓' : SPINNER_CHARACTERS[this.printTick % SPINNER_CHARACTERS.length];

    const totalString = `${this.progress.toString().padStart(this.total.toString().length, ' ')} / ${this.total}`;

    const stats = `${totalString}${''.padEnd(meter.length - 1 - totalString.length)}${currentSpinner}`;

    readline.cursorTo(stdout, 0);
    readline.moveCursor(stdout, 0, -1);

    readline.clearScreenDown(stdout);

    stdout.write(stats);

    readline.cursorTo(stdout, 0);
    readline.moveCursor(stdout, 0, 1);

    stdout.write(meter)
  }

  print = _.throttle(this._print, PRINT_INTERVAL);

}