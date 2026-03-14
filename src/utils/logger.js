export const emitLog = (message, isError = false) => {
  const event = new CustomEvent("system-log", {
    detail: { message, error: isError, timestamp: new Date().toISOString() }
  });
  window.dispatchEvent(event);
  
  if (isError) console.error(message);
  else console.log(message);
};
