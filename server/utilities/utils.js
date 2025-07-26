import chalk from "chalk";

const styledLogs = ({ loggerType, message }) => {
  const logStyles = {
    roomStatus: {
      title: chalk.bgHex("#00560a").hex("#e1e1e1")(loggerType),
      message: chalk.bgHex("#008710").hex("#e1e1e1")(message),
    },
  };

  //   console.log(logStyles[loggerType].title, logStyles[loggerType].message);
};

export default styledLogs;
