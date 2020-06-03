import chalk from 'chalk';

export function Logger(verbose) {
  const verboseLog = (...message) => {
    if (verbose) {
      console.log(chalk.grey(...message));
    }
  };

  const systemLog = (...message) => {
    console.log(chalk.bold.green(...message));
  };

  return {
    verboseLog,
    systemLog
  };
}
