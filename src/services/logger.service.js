import chalk from 'chalk';

export function LoggerService(verbose) {
  const verboseLog = (...message) => {
    if (verbose) {
      console.log(chalk.grey(...message));
    }
  };

  const systemLog = (...message) => {
    console.log(chalk.bold(...message));
  };

  const errorLog = (...message) => {
    console.log(chalk.red(...message));
  };

  return {
    verboseLog,
    systemLog,
    errorLog
  };
}
