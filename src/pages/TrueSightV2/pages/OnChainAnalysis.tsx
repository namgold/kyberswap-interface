import { t } from '@lingui/macro'
import { useEffect } from 'react'
import styled from 'styled-components'

import { useTokenAnalysisSettings } from 'state/user/hooks'

import { SectionWrapper } from '../components'
import {
  HoldersChartWrapper,
  NetflowToCentralizedExchanges,
  NetflowToWhaleWallets,
  NumberofHolders,
  NumberofTradesChart,
  NumberofTransfers,
  TradingVolumeChart,
} from '../components/chart'
import { Top10HoldersTable } from '../components/table'

const Wrapper = styled.div`
  padding: 20px 0;
  width: 100%;
`

export default function OnChainAnalysis() {
  const tokenAnalysisSettings = useTokenAnalysisSettings()
  useEffect(() => {
    if (!window.location.hash) return
    document.getElementById(window.location.hash.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <Wrapper>
      <SectionWrapper
        show={tokenAnalysisSettings?.numberOfTrades}
        id="numberoftrades"
        title={t`Number of Trades / Type of Trade`}
        description={t`Indicates the number of trades and type of trades (buy or sell) over a time period. An increase in the
        number of trades may indicate more interest in the token and vice-versa. Similarly, more buy trades in a
        timeperiod can indicate that the token is bullish and vice-versa.`}
        shareButton
        fullscreenButton
      >
        <NumberofTradesChart />
      </SectionWrapper>
      <SectionWrapper
        show={tokenAnalysisSettings?.tradingVolume}
        id="tradingvolume"
        title={t`Trading Volume`}
        description={t`Indicates how many times a token changes hands in a given time frame. Its measured in $. Trading volume
      indicates interest in a token. The more people are buying and selling something, the higher the volume,
      which can drive even more interest in that token. Typically, high volume trading for a token can mean an
      increase in prices and low volume cryptocurrency could indicate prices falling.`}
        shareButton
        fullscreenButton
      >
        <TradingVolumeChart />
      </SectionWrapper>
      <SectionWrapper
        show={tokenAnalysisSettings?.netflowToWhaleWallets}
        id={'netflowwhalewallets'}
        title={t`Netflow to Whale Wallets`}
        description={t`Netflow (Inflow - Outflow) of token to whale wallets. <span color={theme.primary}>Positive</span> netflow
        generally means that whales are buying. <span color={theme.red}>Negative</span> netflow generally means that
        whales are selling.`}
        shareButton
        fullscreenButton
      >
        <NetflowToWhaleWallets />
      </SectionWrapper>
      <SectionWrapper
        show={tokenAnalysisSettings?.netflowToCEX}
        id={'netflowtocex'}
        title={t`Netflow to Centralized Exchanges`}
        description={t`Netflow (Inflow - Outflow) of token to centralized exchanges. <span color={theme.primary}>Positive</span> netflow means that more traders are depositing tokens than withdrawing, most likely for selling. <span color={theme.red}>Negative</span> netflow means that more traders are withdrawing tokens than depositing, most likely for holding or staking.`}
        shareButton
        fullscreenButton
      >
        <NetflowToCentralizedExchanges />
      </SectionWrapper>
      <SectionWrapper
        show={tokenAnalysisSettings?.volumeOfTransfers}
        title={t`Number & Volume of Transfers`}
        description={t`Indicates on-chain transfer activity between wallets. High transfer activity indicates that more traders are transferring the token between wallets. Token with high transfer activity and high transfer volume may indicate that traders are interested in it.`}
        id="numberoftransfers"
        shareButton
        fullscreenButton
      >
        <NumberofTransfers />
      </SectionWrapper>
      <SectionWrapper
        show={tokenAnalysisSettings?.numberOfHolders}
        title={t`Number of Holders`}
        description={t`Indicates the number of addresses that hold a token. An increase in the number of holders may indicate more interest in the token and vice-versa. Number of holders may also indicate the distribution of the token. High number of holders may reduce the impact an individual (like a whale) can have on the price.`}
        id="numberofholders"
        shareButton
        fullscreenButton
      >
        <NumberofHolders />
      </SectionWrapper>
      <SectionWrapper
        show={tokenAnalysisSettings?.top10Holders}
        title={t`Top 10 Holders`}
        id="top10holders"
        shareButton
      >
        <Top10HoldersTable />
      </SectionWrapper>
      <SectionWrapper
        show={tokenAnalysisSettings?.top25Holders}
        title={t`Top 25 Holders`}
        id="top25holders"
        shareButton
      >
        <HoldersChartWrapper />
      </SectionWrapper>
    </Wrapper>
  )
}