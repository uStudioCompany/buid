import chalk from 'chalk';

export class LoggerService {
  constructor(verbose) {
    this.verbose = verbose;
  }

  verboseLog = (...message) => {
    if (this.verboseLog) {
      console.log(chalk.grey(...message));
    }
  };

  systemLog = (...message) => {
    console.log(chalk.bold(...message));
  };

  errorLog = (...message) => {
    console.log(chalk.red(...message));
  };
}
