import morgan from "morgan";

// Keep logs concise during development.
export const requestLogger = morgan("dev");
