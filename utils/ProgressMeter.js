import { percent } from './Math.js';
import _ from 'lodash';

const SPINNER_CHARACTERS = ['|', '/', '-', '\\'];

const SPINNER_INTERVAL = 250;

export class ProgressMeter {

  constructor(total, options) {

    options = {
      showSpinner: true
    };

    this.total = total;

    this.progress = 0;

    this.percentProgress = 0;

    Object.entries(options).forEach(([option, value]) => {
      this[option] = value;
    });

    if(this.showSpinner) {
      this.spinnerInterval = setInterval(() => this.print(), SPINNER_INTERVAL);
    }

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
      clearInterval(this.spinnerInterval);
    }
  }

  print() {
    console.log(`${this.percentProgress}%`);

    // _.debounce(this._print, 300, {
    //   trailing: true
    // });
  }

  _print() {
    console.log(`${this.percentProgress}%`);
  }

}