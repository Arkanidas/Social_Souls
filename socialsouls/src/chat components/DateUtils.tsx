export const formatChatTimestamp = (seconds: number) => {
  const date = new Date(seconds * 1000);
  const now = new Date();

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSameDay(date, now)) {
    return `Today at ${time}`;
  }

  if (isSameDay(date, yesterday)) {
    return `Yesterday at ${time}`;
  }

  const fullDate = date.toISOString().slice(0, 10); 

  return `${fullDate}, ${time}`;
};
