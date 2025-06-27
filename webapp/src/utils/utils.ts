interface StyledLogsProps {
  loggerType: "webrtc" | "error" | "socket";
  message: string;
}

export const styledLogs = ({ loggerType, message }: StyledLogsProps) => {
  const logStyles = {
    webrtc: {
      title:
        "background: #0d3363; color: white; padding: 4px; border: 1px solid #0053b8;",
      message:
        "background: #0073ff; color: white; padding: 4px; border: 1px solid #0053b8; font-weight: bold;",
    },
    error: {
      title:
        "background: #8b0000; color: white; padding: 4px; border: 1px solid #8b0000;",
      message:
        "background: #ff0000; color: white; padding: 4px; border: 1px solid #ff0000; font-weight: bold;",
    },
    socket: {
      title:
        "background: #008b00; color: white; padding: 4px; border: 1px solid #008b009e;",
      message:
        "background: #00b400; color: white; padding: 4px; border: 1px solid rgba(1, 205, 1, 0.645); font-weight: bold;",
    },
  };

  const messageStyle = logStyles[loggerType];

  console.log(
    `%c ${loggerType}%c${message}`,
    messageStyle.title,
    messageStyle.message
  );
};
