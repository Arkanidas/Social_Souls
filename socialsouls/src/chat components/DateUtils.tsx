
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

export const formatLastSeen = (seconds: number) => {
  const diff = Date.now() / 1000 - seconds;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;

  return `${Math.floor(diff / 86400)} days ago`;
};