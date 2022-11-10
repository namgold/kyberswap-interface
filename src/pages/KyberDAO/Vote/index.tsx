import { Trans, t } from '@lingui/macro'
import dayjs from 'dayjs'
import RelativeTime from 'dayjs/plugin/relativeTime'
import { transparentize } from 'polished'
import { Clock } from 'react-feather'
import { Box, Text } from 'rebass'
import styled, { css } from 'styled-components'

import bgimg from 'assets/images/about_background.png'
import { ButtonLight, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import InfoHelper from 'components/InfoHelper'
import { AutoRow, RowBetween } from 'components/Row'
import { useActiveWeb3React } from 'hooks'
import { useStakingInfo, useVotingInfo } from 'hooks/kyberdao'
import useTheme from 'hooks/useTheme'
import { useKNCPrice } from 'state/application/hooks'
import { formattedNumLong } from 'utils'
import { getFullDisplayBalance } from 'utils/formatBalance'

import ProposalListComponent from './ProposalListComponent'

dayjs.extend(RelativeTime)

const Wrapper = styled.div`
  width: 100%;
  background-image: url(${bgimg}), url(${bgimg});
  background-size: cover, cover;
  background-repeat: no-repeat, no-repeat;
  z-index: 1;
  background-color: transparent, transparent;
  background-position: top, bottom;
`

const Container = styled.div`
  width: 1224px;
  margin: auto;
  min-height: 1200px;
  padding: 48px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Card = styled.div`
  padding: 20px 24px;
  border-radius: 20px;
  ${({ theme }) => css`
    background-color: ${transparentize(0.3, theme.buttonGray)};
    flex: 1;
  `}
`

export default function Vote() {
  const theme = useTheme()
  const { account } = useActiveWeb3React()
  const { daoInfo } = useVotingInfo()
  const { stakedBalance } = useStakingInfo()
  const kncPrice = useKNCPrice()
  return (
    <Wrapper>
      <Container>
        <Text fontSize={36} lineHeight="42px" marginBottom={36}>
          <Trans>
            <span style={{ color: theme.primary }}>Vote</span> - Earn Rewards
          </Trans>
        </Text>
        <RowBetween width={'100%'} gap="24px" marginBottom="12px">
          <Card>
            <AutoColumn>
              <Text color={theme.subText} marginBottom="20px">
                <Trans>Total Staked KNC</Trans>
              </Text>
              <Text fontSize={20} marginBottom="8px">
                {daoInfo ? formattedNumLong(Math.floor(daoInfo.total_staked)) + ' KNC' : '--'}
              </Text>
              <Text fontSize={12} color={theme.subText}>
                {daoInfo && kncPrice
                  ? '~ ' + formattedNumLong(parseFloat(kncPrice) * Math.floor(daoInfo.total_staked)) + ' USD'
                  : ''}
              </Text>
            </AutoColumn>
          </Card>
          <Card>
            <AutoColumn>
              <Text color={theme.subText} marginBottom="20px">
                <Trans>Total Voting Rewards</Trans>
              </Text>
              <Text fontSize={20} marginBottom="8px">
                30,164 KNC
              </Text>
              <Text fontSize={12} color={theme.subText}>
                ~ 128,508 USD
              </Text>
            </AutoColumn>
          </Card>
          <Card>
            <AutoColumn>
              <Text color={theme.subText} marginBottom="20px">
                <Trans>
                  Your Voting Power{' '}
                  <InfoHelper
                    text={t`Your voting power is calculated by
[Your Staked KNC] / [Total Staked KNC] * 100%`}
                  />
                </Trans>
              </Text>
              <Text fontSize={20} marginBottom="8px">
                {stakedBalance && daoInfo?.total_staked
                  ? parseFloat(
                      ((parseFloat(getFullDisplayBalance(stakedBalance)) / daoInfo.total_staked) * 100).toFixed(6),
                    ) + ' %'
                  : '--'}
              </Text>
              <Text fontSize={12} color={theme.subText}>
                {stakedBalance ? getFullDisplayBalance(stakedBalance) + ' KNC Staked' : '--'}
              </Text>
            </AutoColumn>
          </Card>
          <Card>
            <AutoColumn justify="space-between">
              <Text color={theme.subText} marginBottom={20}>
                <Trans>Your Voting Reward</Trans>
              </Text>
              {account ? (
                <ButtonPrimary>
                  <Trans>Claim</Trans>
                </ButtonPrimary>
              ) : (
                <ButtonLight>
                  <Trans>Connect Your Wallet</Trans>
                </ButtonLight>
              )}
            </AutoColumn>
          </Card>
        </RowBetween>
        <AutoRow fontSize={12}>
          <Text>
            <Trans>In Progress: Epoch {daoInfo ? daoInfo.current_epoch : '--'}</Trans>
          </Text>
          <Box
            backgroundColor={transparentize(0.8, theme.primary)}
            color={theme.primary}
            padding="2px 8px"
            margin="0px 4px"
            style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <Clock size="12px" />{' '}
            {daoInfo
              ? dayjs(
                  (daoInfo.first_epoch_start_timestamp + daoInfo.current_epoch * daoInfo.epoch_period_in_seconds) *
                    1000,
                ).fromNow(true) + ' left'
              : '--:--:--'}
          </Box>
          <Text>
            <Trans>Vote on current epoch proposals to get your full reward.</Trans>
          </Text>
        </AutoRow>
        <Text color={theme.subText} fontStyle="italic" fontSize={12}>
          <Trans>Note: Voting on KyberDAO is only available on Ethereum chain</Trans>
        </Text>
        <ProposalListComponent />
      </Container>
    </Wrapper>
  )
}
