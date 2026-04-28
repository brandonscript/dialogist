/** Convert the first character of a string to uppercase. Leaves the rest of the string unchanged. */
export const upperFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
