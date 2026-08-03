export function travel(args?: string): string {
  if (args?.trim() === 'random') {
    return '<travel-random>';
  }
  return '<travel-map>';
}
