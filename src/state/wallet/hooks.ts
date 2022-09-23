import { Currency, CurrencyAmount, Token, TokenAmount } from '@namgold/ks-sdk-core'
import JSBI from 'jsbi'
import { useMemo } from 'react'

import ERC20_INTERFACE from 'constants/abis/erc20'
import { EMPTY_ARRAY, EMPTY_OBJECT } from 'constants/index'
import { isEVM } from 'constants/networks'
import { NativeCurrencies } from 'constants/tokens'
import { useActiveWeb3React } from 'hooks'
import { useAllTokens } from 'hooks/Tokens'
import { useMulticallContract } from 'hooks/useContract'
import { useMultipleContractSingleData, useSingleCallResult } from 'state/multicall/hooks'
import { isAddress } from 'utils'

import { useSOLBalance } from './solanaHooks'

export function useNativeBalance(uncheckedAddress?: string): CurrencyAmount<Currency> | undefined {
  const { chainId } = useActiveWeb3React()
  const userEthBalance = useETHBalance(uncheckedAddress)
  const userSolBalance = useSOLBalance(uncheckedAddress)
  return isEVM(chainId) ? userEthBalance : userSolBalance
}

function useETHBalance(uncheckedAddress?: string): CurrencyAmount<Currency> | undefined {
  const multicallContract = useMulticallContract()
  const { chainId } = useActiveWeb3React()

  const addressParam: string[] = useMemo(
    () => (uncheckedAddress && isAddress(chainId, uncheckedAddress) ? [uncheckedAddress] || EMPTY_ARRAY : EMPTY_ARRAY),
    [chainId, uncheckedAddress],
  )

  const result = useSingleCallResult(multicallContract, 'getEthBalance', addressParam)

  return useMemo(() => {
    const value = result?.result?.[0]
    if (value) return CurrencyAmount.fromRawAmount(NativeCurrencies[chainId], JSBI.BigInt(value.toString()))
    return undefined
  }, [result, chainId])
}

const stringifyBalance = (balanceMap: { [key: string]: TokenAmount }) => {
  return Object.keys(balanceMap)
    .map(key => key + balanceMap[key].toExact())
    .join(',')
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () =>
      tokens?.filter((token?: Token): token is Token => !!token && isAddress(token.chainId, token.address) !== false) ??
      [],
    [tokens],
  )

  const validatedTokenAddresses = useMemo(() => validatedTokens.map(vt => vt.address), [validatedTokens])

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address])

  const anyLoading: boolean = useMemo(() => balances.some(callState => callState.loading), [balances])

  const balanceResult: { [key: string]: TokenAmount } = useMemo(
    () =>
      address && validatedTokens.length > 0
        ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
            const value = balances?.[i]?.result?.[0]
            const amount = value ? JSBI.BigInt(value.toString()) : undefined
            if (amount) {
              memo[token.address] = TokenAmount.fromRawAmount(token, amount)
            }
            return memo
          }, {})
        : EMPTY_OBJECT,
    [address, validatedTokens, balances],
  )

  // `balanceResult` was calculated base on `balances`, when `balances` changes, `balanceResult` recalculated
  // again and return new instance of the result.
  // But sometimes (most time likely), new result and old result are same, but have different instance.
  // Below we are going to cache it, so if new result deep equals to old result, old result's instance will be use instead
  // This cache helps hooks which calling this hooks and depend on this result don't have to calculating again with new dependency changed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const balanceResultCached = useMemo(() => balanceResult, [stringifyBalance(balanceResult)])

  return [balanceResultCached, anyLoading]
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[],
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token])
  if (!token) return undefined
  return tokenBalances[token.address]
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[],
): (CurrencyAmount<Currency> | undefined)[] {
  const tokens = useMemo(() => {
    const result = currencies?.filter((currency): currency is Token => currency?.isToken ?? false)
    return result?.length ? result : EMPTY_ARRAY
  }, [currencies])

  const tokenBalances = useTokenBalances(account, tokens)
  const ethBalance = useNativeBalance(account)

  return useMemo(
    () =>
      currencies?.map(currency => {
        if (!account || !currency) return undefined
        if (currency?.isNative) return ethBalance
        return tokenBalances[currency.address]
      }) ?? EMPTY_ARRAY,
    [account, currencies, ethBalance, tokenBalances],
  )
}

export function useCurrencyBalance(account?: string, currency?: Currency): CurrencyAmount<Currency> | undefined {
  return useCurrencyBalances(
    account,
    useMemo(() => [currency], [currency]),
  )[0]
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
  const { account } = useActiveWeb3React()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  return useTokenBalances(account ?? undefined, allTokensArray) ?? EMPTY_OBJECT
}
