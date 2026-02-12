export function ellipseAddress(address: string = '', width: number = 6): string {
  if (!address) {
    return ''
  }
  return `${address.slice(0, width)}...${address.slice(-width)}`
}
