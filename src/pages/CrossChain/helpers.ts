import { RouteData } from '@0xsquid/sdk'

export const getRouInfo = (route: RouteData | undefined) => {
  const estimate = route?.estimate
  const priceImpact = estimate?.aggregatePriceImpact
  return {
    amountUsdOut: estimate?.toAmountUSD,
    amountUsdIn: estimate?.fromAmountUSD,
    outputAmount: estimate?.toAmount,
    inputAmount: estimate?.fromAmount,
    duration: estimate?.estimatedRouteDuration,
    minReceive: estimate?.toAmountMin,
    priceImpact: priceImpact ? Number(priceImpact) : undefined,
    exchangeRate: estimate?.exchangeRate,
    gasCosts: estimate?.gasCosts[0],
    feeCosts: estimate?.feeCosts[0],
    routeData: estimate?.route,
  }
}