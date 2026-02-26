export function format(date: Date, formatStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  if (formatStr === 'MMM dd, yyyy') {
    return `${month} ${day < 10 ? '0' + day : day}, ${year}`;
  }
  
  return date.toLocaleDateString();
}
