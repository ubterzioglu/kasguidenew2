export class BudgetExceededError extends Error {
  constructor(public readonly costTotalUsd: number, public readonly hardCapUsd: number) {
    super(`Bütçe siniri asildi: $${costTotalUsd.toFixed(4)} / $${hardCapUsd.toFixed(4)}`)
    this.name = 'BudgetExceededError'
  }
}

const ESTIMATED_COST_USD = {
  search: 0.005,
  extract: 0.008,
  classify_cheap: 0.002,
  classify_full: 0.01,
} as const

export function estimateCost(
  kind: 'search' | 'extract' | 'classify',
  opts: { cheapMode?: boolean } = {},
): number {
  if (kind === 'search') return ESTIMATED_COST_USD.search
  if (kind === 'extract') return ESTIMATED_COST_USD.extract
  return opts.cheapMode ? ESTIMATED_COST_USD.classify_cheap : ESTIMATED_COST_USD.classify_full
}

export class CostLedger {
  private total = 0

  constructor(
    private readonly softCapUsd: number,
    private readonly hardCapUsd: number,
  ) {}

  get totalUsd(): number {
    return this.total
  }

  get isCheapMode(): boolean {
    return this.total >= this.softCapUsd
  }

  add(amountUsd: number): void {
    const next = this.total + amountUsd

    if (next > this.hardCapUsd) {
      this.total = next
      throw new BudgetExceededError(next, this.hardCapUsd)
    }

    this.total = next
  }
}
