export function repairLegacyText(input: string) {
  const value = input.trim()

  if (!/[ÃÅÄâ]/.test(value)) {
    return value
  }

  return Buffer.from(value, 'latin1').toString('utf8').trim()
}
