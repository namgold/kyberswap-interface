import { Trans, t } from '@lingui/macro'
import { createContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { ButtonPrimary } from 'components/Button'
import Icon from 'components/Icons/Icon'
import Row, { RowFit } from 'components/Row'
import { useTokenAnalysisSettings } from 'state/user/hooks'

import { SectionWrapper } from '../components'
import CexRekt from '../components/CexRekt'
import { LiquidOnCentralizedExchanges, Prochart } from '../components/chart'
import { FundingRateTable, LiveDEXTrades, SupportResistanceLevel } from '../components/table'
import { useChartingDataQuery } from '../hooks/useTruesightV2Data'
import { ChartTab, ISRLevel, OHLCData } from '../types'

const Wrapper = styled.div`
  padding: 20px 0;
  width: 100%;
`

type TechnicalAnalysisContextProps = {
  resolution?: string
  setResolution?: (r: string) => void
  SRLevels?: ISRLevel[]
  currentPrice?: number
}

function isSupport(arr: OHLCData[], i: number) {
  if (!arr[i + 1] || !arr[i + 2] || !arr[i - 1] || !arr[i - 2]) {
    return false
  }
  return (
    arr[i].low < arr[i + 1].low &&
    arr[i + 1].low < arr[i + 2].low &&
    arr[i].low < arr[i - 1].low &&
    arr[i - 1].low < arr[i - 2].low
  )
}
function isResistance(arr: OHLCData[], i: number) {
  if (!arr[i + 1] || !arr[i + 2] || !arr[i - 1] || !arr[i - 2]) {
    return false
  }
  return (
    arr[i].high > arr[i + 1].high &&
    arr[i + 1].high > arr[i + 2].high &&
    arr[i].high > arr[i - 1].high &&
    arr[i - 1].high > arr[i - 2].high
  )
}
function getAverageCandleSize(arr: OHLCData[]): number {
  let sum = 0
  for (let i = 0; i < 100; i++) {
    if (arr[i]) sum += arr[i].high - arr[i].low
  }
  return sum / 100
}

function closeToExistedValue(newvalue: number, arr: any[], range: number) {
  return arr.findIndex(v => Math.abs(v.value - newvalue) < range)
}

export const TechnicalAnalysisContext = createContext<TechnicalAnalysisContextProps>({})

export default function TechnicalAnalysis() {
  const theme = useTheme()

  const [liveChartTab, setLiveChartTab] = useState(ChartTab.First)
  const navigate = useNavigate()
  const [priceChartResolution, setPriceChartResolution] = useState('1h')
  const now = Math.floor(Date.now() / 60000) * 60
  const { data, isLoading } = useChartingDataQuery({
    from: now - ({ '1h': 1080000, '4h': 4320000, '1d': 12960000 }[priceChartResolution] || 1080000),
    to: now,
    candleSize: priceChartResolution,
    currency: liveChartTab === ChartTab.First ? 'USD' : 'BTC',
  })

  const SRLevels: ISRLevel[] = useMemo(() => {
    if (isLoading && !data) return []
    const levels: ISRLevel[] = []
    const average = getAverageCandleSize(data || [])
    data?.forEach((v, i, arr) => {
      if (isSupport(arr, i)) {
        let newValue = Math.min(v.open, v.close)
        const closeIndex = closeToExistedValue(newValue, levels, 2 * average)
        if (closeIndex > -1) {
          newValue = (newValue + levels[closeIndex].value) / 2
          levels.splice(closeIndex, 1)
        }
        levels.push({ timestamp: v.timestamp, value: newValue })
      } else if (isResistance(arr, i)) {
        let newValue = Math.max(v.open, v.close)
        const closeIndex = closeToExistedValue(newValue, levels, 2 * average)

        if (closeIndex > -1) {
          newValue = (newValue + levels[closeIndex].value) / 2
          levels.splice(closeIndex, 1)
        }
        levels.push({ timestamp: v.timestamp, value: newValue })
      }
    })
    return levels.slice(0, 8)
  }, [data, isLoading])

  const tokenAnalysisSettings = useTokenAnalysisSettings()
  console.log(
    '🚀 ~ file: TechnicalAnalysis.tsx:109 ~ TechnicalAnalysis ~ tokenAnalysisSettings:',
    tokenAnalysisSettings,
  )

  return (
    <TechnicalAnalysisContext.Provider
      value={{
        resolution: priceChartResolution,
        setResolution: setPriceChartResolution,
        SRLevels,
        currentPrice: data?.[0].close,
      }}
    >
      <Wrapper>
        <SectionWrapper
          show={tokenAnalysisSettings?.liveCharts}
          fullscreenButton
          tabs={[`BTC/USD`, `BTC/BTC`]}
          activeTab={liveChartTab}
          onTabClick={setLiveChartTab}
          style={{ height: '800px' }}
        >
          <Prochart isBTC={liveChartTab === ChartTab.Second} />
        </SectionWrapper>
        <SectionWrapper
          show={tokenAnalysisSettings?.supportResistanceLevels}
          title={t`Support & Resistance Levels`}
          description={
            <Trans>
              <Text as="span" color={theme.primary}>
                Support level
              </Text>{' '}
              is where the price of a token normally stops falling and bounces back from.{' '}
              <Text as="span" color={theme.red}>
                Resistance level
              </Text>{' '}
              is where the price of a token normally stops rising and dips back down.{' '}
              <Text as="span" color={theme.primary}>
                Support
              </Text>{' '}
              and{' '}
              <Text as="span" color={theme.red}>
                Resistance
              </Text>{' '}
              levels may vary depending on the timeframe you&apos;re looking at.
            </Trans>
          }
          style={{ height: 'fit-content' }}
        >
          <SupportResistanceLevel />
          <Row justify="flex-end">
            <ButtonPrimary width="fit-content" onClick={() => navigate('/limit/ethereum/wbtc-to-usdt')}>
              <Text color={theme.textReverse} fontSize="14px" lineHeight="20px">
                <RowFit gap="4px">
                  <Icon id="chart" size={16} /> Place Limit Order
                </RowFit>
              </Text>
            </ButtonPrimary>
          </Row>
        </SectionWrapper>
        <SectionWrapper
          show={tokenAnalysisSettings?.liveDEXTrades}
          title={t`Live Trades`}
          style={{ height: 'fit-content' }}
        >
          <LiveDEXTrades />
        </SectionWrapper>
        <SectionWrapper
          show={tokenAnalysisSettings?.fundingRateOnCEX}
          id={'fundingrate'}
          title={t`Funding Rate on Centralized Exchanges`}
          description={
            <Trans>
              Funding rate is useful in identifying short-term trends.
              <Text as="span" color={theme.primary}>
                Positive funding rates
              </Text>{' '}
              suggests traders are{' '}
              <Text as="span" color={theme.primary}>
                bullish
              </Text>{' '}
              . Extremely positive funding rates may result in long positions getting squeezed.{' '}
              <Text as="span" color={theme.red}>
                Negative funding rates
              </Text>{' '}
              suggests traders are{' '}
              <Text as="span" color={theme.red}>
                bearish
              </Text>{' '}
              . Extremely negative funding rates may result in short positions getting squeezed.
            </Trans>
          }
          style={{ height: 'fit-content' }}
        >
          <FundingRateTable />
        </SectionWrapper>
        <SectionWrapper
          show={tokenAnalysisSettings?.liquidationsOnCEX}
          title={t`Liquidations on Centralized Exchanges`}
          description={`Liquidations describe the forced closing of a trader&apos;s futures position due to the partial or total loss
          of their collateral. This happens when a trader has insufficient funds to keep a leveraged trade
          open.Leverated trading is high risk & high reward. The higher the leverage, the easier it is for a trader to
          get liquidated. An abrupt change in price of a token can cause large liquidations. Traders may buy / sell the
          token after large liquidations.`}
          style={{ height: '600px' }}
        >
          <LiquidOnCentralizedExchanges />
          <CexRekt />
        </SectionWrapper>
      </Wrapper>
    </TechnicalAnalysisContext.Provider>
  )
}