export const titleCase = (str: string): string =>
  str.split(' ').map(firstUpper).join(' ')

export const firstUpper = (str: string): string =>
  str[0].toUpperCase() + str.slice(1).toLowerCase()
