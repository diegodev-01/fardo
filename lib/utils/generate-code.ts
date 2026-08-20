export const getNextCode = (lastCode?: string): string => {
  if (!lastCode) return "A";

  const chars = lastCode.toUpperCase().split("");
  let i = chars.length - 1;
  while (i >= 0) {
    if (chars[i] === "Z") {
      chars[i] = "A";
      i--;
    } else {
      chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
      return chars.join("");
    }
  }

  return "A".repeat(lastCode.length + 1);
};
