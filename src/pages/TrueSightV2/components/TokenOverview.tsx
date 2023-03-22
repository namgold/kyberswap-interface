import { Trans, t } from '@lingui/macro'
import { rgba } from 'polished'
import { ReactNode, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Text } from 'rebass'
import styled, { css } from 'styled-components'

import Column from 'components/Column'
import DropdownIcon from 'components/Icons/DropdownIcon'
import { DotsLoader } from 'components/Loader/DotsLoader'
import Row, { RowBetween, RowFit } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import useTheme from 'hooks/useTheme'
import { MEDIA_WIDTHS } from 'theme'

import { TOKEN_DETAIL } from '../hooks/sampleData'
import { useTokenDetailQuery } from '../hooks/useTruesightV2Data'
import { testParams } from '../pages/SingleToken'
import KyberScoreMeter from './KyberScoreMeter'
import PriceRange from './PriceRange'

const CardWrapper = styled.div<{ gap?: string }>`
  border-radius: 20px;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border};
  ${({ theme, gap }) => css`
    background-color: ${theme.background};
    gap: ${gap || '0px'};
  `}
  > * {
    flex: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 16px;
  `}
`

const ExpandableBox = styled.div<{ expanded?: boolean; height?: number }>`
  height: 0px;
  overflow: hidden;
  transition: all 0.2s ease;
  flex: unset;
  ${({ expanded, height }) => (expanded ? `height: ${height}px;` : ``)}
`

const ExternalLinkWrapper = styled.a`
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  transition: color 0.2s ease;
  :hover {
    color: ${({ theme }) => theme.primary};
  }
`
const ExternalLink = ({ href, className, children }: { href: string; className?: string; children?: ReactNode }) => {
  return (
    <ExternalLinkWrapper className={className} href={href} target="_blank" rel="noreferrer">
      {children} ↗
    </ExternalLinkWrapper>
  )
}

const formatMoneyWithSign = (amount: number): string => {
  const isNegative = amount < 0
  return (isNegative ? '-' : '') + '$' + Math.abs(amount).toLocaleString()
}

export const TokenOverview = () => {
  const theme = useTheme()
  const { address } = useParams()
  const above768 = useMedia(`(min-width:${MEDIA_WIDTHS.upToSmall}px)`)
  const { data: apiData, isLoading } = useTokenDetailQuery(testParams.address)
  const data = address ? apiData : TOKEN_DETAIL
  const [expanded, setExpanded] = useState(false)
  const ref1 = useRef<HTMLDivElement>(null)
  const ref2 = useRef<HTMLDivElement>(null)

  return (
    <>
      {above768 ? (
        <Row align="stretch" gap="24px" marginBottom="38px" flexDirection={above768 ? 'row' : 'column'}>
          <CardWrapper style={{ justifyContent: 'space-between' }}>
            <Text color={theme.text} fontSize="14px" lineHeight="20px" marginBottom="24px">
              <Trans>Price</Trans>
            </Text>
            <RowFit gap="8px">
              <Text fontSize={28} lineHeight="32px" color={theme.text}>
                {isLoading ? <DotsLoader /> : '$' + (+(data?.price || 0)).toLocaleString()}
              </Text>
              <Text
                color={theme.red}
                fontSize="12px"
                backgroundColor={rgba(theme.red, 0.2)}
                display="inline"
                padding="4px 8px"
                style={{ borderRadius: '16px' }}
              >
                {data?.price24hChangePercent ? data?.price24hChangePercent.toFixed(2) : 0}%
              </Text>
            </RowFit>
            <Text color={theme.red} fontSize={12} lineHeight="16px">
              {data && formatMoneyWithSign(data?.price24hChangePercent * +data?.price || 0)}
            </Text>
            <PriceRange
              title={t`Daily Range`}
              high={data?.['24hHigh'] || 0}
              low={data?.['24hLow'] || 0}
              current={+(data?.price || 0)}
            />
            <PriceRange
              title={t`1Y Range`}
              high={data?.['1yHigh'] || 0}
              low={data?.['1yLow'] || 0}
              current={data?.price ? +data.price : 0}
            />
          </CardWrapper>
          <CardWrapper style={{ fontSize: '12px' }} gap="10px">
            <Text color={theme.text} marginBottom="4px">
              Key Stats
            </Text>
            <RowBetween>
              <Text color={theme.subText}>
                <Trans>All Time Low</Trans>
              </Text>
              <Text color={theme.text}>{data?.atl && formatMoneyWithSign(data?.atl)}</Text>
            </RowBetween>
            <RowBetween>
              <Text color={theme.subText}>
                <Trans>All Time High</Trans>
              </Text>
              <Text color={theme.text}>{data?.ath && formatMoneyWithSign(data?.ath)}</Text>
            </RowBetween>
            <RowBetween>
              <Text color={theme.subText}>
                <Trans>24H Volume</Trans>
              </Text>
              <Text color={theme.text}>{data?.['24hVolume'] && formatMoneyWithSign(data?.['24hVolume'])}</Text>
            </RowBetween>
            <RowBetween>
              <Text color={theme.subText}>
                <Trans>Circulating Supply</Trans>
              </Text>
              <Text color={theme.text}>{data && data.circulatingSupply + ' ' + data.symbol}</Text>
            </RowBetween>
            <RowBetween>
              <Text color={theme.subText}>
                <Trans>Market Cap</Trans>
              </Text>
              <Text color={theme.text}>{data?.marketCap && formatMoneyWithSign(data?.marketCap)}</Text>
            </RowBetween>
            <RowBetween>
              <Text color={theme.subText}>
                <Trans>Holders (On-chain)</Trans>
              </Text>
              <Text color={theme.text}>{data?.numberOfHolders}</Text>
            </RowBetween>
            <RowBetween>
              <Text color={theme.subText}>
                <Trans>Website</Trans>
              </Text>
              {data?.webs?.[0] && <ExternalLink href={data.webs[0] || ''}>{data?.webs[0]}</ExternalLink>}
            </RowBetween>
            <RowBetween>
              <Text color={theme.subText}>
                <Trans>Community</Trans>
              </Text>
              {data?.communities?.[0] && (
                <ExternalLink href={data.communities[0].value || ''}>{data.communities[0].key}</ExternalLink>
              )}
            </RowBetween>
            <RowBetween>
              <Text color={theme.subText}>
                <Trans>Address</Trans>
              </Text>
              <Text color={theme.subText}>0x394...5e3</Text>
            </RowBetween>
          </CardWrapper>
          <CardWrapper style={{ alignItems: 'center' }}>
            <Row marginBottom="4px">
              <MouseoverTooltip
                text={t`KyberScore algorithm measures the current trend of a token by taking into account multiple on-chain and off-chain indicators. The score ranges from 0 to 100. Higher the score, more bullish the token`}
                placement="top"
                width="350px"
              >
                <Text style={{ borderBottom: `1px dotted ${theme.text}` }} color={theme.text}>
                  KyberScore
                </Text>
              </MouseoverTooltip>
            </Row>
            <RowFit style={{ alignSelf: 'flex-start' }} marginBottom="8px">
              <Text fontSize="10px" lineHeight="12px">
                Calculated at 08:00 PM when price was $1
              </Text>
            </RowFit>
            <KyberScoreMeter value={data?.kyberScore?.score} />
            <Text fontSize={24} fontWeight={500} color={theme.primary} marginBottom="12px">
              {data?.kyberScore?.label}
            </Text>
            <Text
              fontSize={14}
              lineHeight="20px"
              fontWeight={500}
              color={theme.text}
              textAlign="center"
              marginBottom="12px"
            >
              $BTC seems to be a <span style={{ color: theme.primary }}>{data?.kyberScore?.label}</span> with a
              KyberScore of <span style={{ color: theme.primary }}>{data?.kyberScore?.score}</span>/100
            </Text>
            <Text fontSize={10} lineHeight="12px" fontStyle="italic">
              <Trans>This should not be considered as financial advice</Trans>
            </Text>
          </CardWrapper>
        </Row>
      ) : (
        <CardWrapper style={{ marginBottom: '16px' }}>
          <RowFit gap="8px">
            <Text fontSize={28} lineHeight="32px" fontWeight={500} color={theme.text}>
              {isLoading ? <DotsLoader /> : '$' + (+(data?.price || 0)).toLocaleString()}
            </Text>
            <Text
              color={theme.red}
              fontSize="12px"
              backgroundColor={rgba(theme.red, 0.2)}
              display="inline"
              padding="4px 8px"
              style={{ borderRadius: '16px' }}
            >
              {data?.price24hChangePercent ? data?.price24hChangePercent.toFixed(2) : 0}%
            </Text>
          </RowFit>
          <ExpandableBox expanded={expanded} height={ref1?.current?.scrollHeight} ref={ref1}>
            <PriceRange
              title={t`Daily Range`}
              high={data?.['24hHigh'] || 0}
              low={data?.['24hLow'] || 0}
              current={+(data?.price || 0)}
              style={{ marginBottom: '16px' }}
            />
            <PriceRange
              title={t`1Y Range`}
              high={data?.['1yHigh'] || 0}
              low={data?.['1yLow'] || 0}
              current={data?.price ? +data.price : 0}
            />
          </ExpandableBox>
          <Row style={{ borderBottom: `1px solid ${theme.border}`, margin: '16px 0' }} />
          <Row marginBottom="8px">
            <MouseoverTooltip
              text={t`KyberScore is an algorithm created by us that takes into account multiple on-chain and off-chain indicators to measure the current trend of a token. The score ranges from 0 to 100.`}
              placement="top"
              width="350px"
            >
              <Text
                fontSize="14px"
                fontWeight={500}
                style={{ borderBottom: `1px dotted ${theme.text}` }}
                color={theme.text}
              >
                KyberScore
              </Text>
            </MouseoverTooltip>
          </Row>
          <Row justify="center" marginBottom="12px">
            <KyberScoreMeter value={data?.kyberScore?.score} />
          </Row>
          <Row marginBottom="16px" justify="center">
            <Text fontSize="24px" lineHeight="28px" fontWeight={500} color={theme.primary}>
              Very Bullish
            </Text>
          </Row>
          <ExpandableBox expanded={expanded} height={ref2?.current?.scrollHeight} ref={ref2}>
            <Row style={{ borderBottom: `1px solid ${theme.border}`, marginBottom: '16px' }} />
            <Column gap="10px" style={{ fontSize: '12px', lineHeight: '16px' }}>
              <Text fontSize="14px" lineHeight="20px" color={theme.text} marginBottom="4px">
                Key Stats
              </Text>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>All Time Low</Trans>
                </Text>
                <Text color={theme.text}>{data?.atl && formatMoneyWithSign(data?.atl)}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>All Time High</Trans>
                </Text>
                <Text color={theme.text}>{data?.ath && formatMoneyWithSign(data?.ath)}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>24H Volume</Trans>
                </Text>
                <Text color={theme.text}>{data?.['24hVolume'] && formatMoneyWithSign(data?.['24hVolume'])}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Circulating Supply</Trans>
                </Text>
                <Text color={theme.text}>{data && data.circulatingSupply + ' ' + data.symbol}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Market Cap</Trans>
                </Text>
                <Text color={theme.text}>{data?.marketCap && formatMoneyWithSign(data?.marketCap)}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Holders (On-chain)</Trans>
                </Text>
                <Text color={theme.text}>{data?.numberOfHolders}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Website</Trans>
                </Text>
                {data?.webs?.[0] && <ExternalLink href={data.webs[0] || ''}>{data?.webs[0]}</ExternalLink>}
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Community</Trans>
                </Text>
                {data?.communities?.[0] && (
                  <ExternalLink href={data.communities[0].value || ''}>{data.communities[0].key}</ExternalLink>
                )}
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Address</Trans>
                </Text>
                <Text color={theme.subText}>0x394...5e3</Text>
              </RowBetween>
            </Column>
          </ExpandableBox>

          <Row justify="center" onClick={() => setExpanded(p => !p)}>
            <div style={{ transform: expanded ? 'rotate(180deg)' : '', transition: 'all 0.2s ease' }}>
              <DropdownIcon />
            </div>
            <Text fontSize="12px" lineHeight="16px" fontWeight={500}>
              {expanded ? <Trans>View Less Stats</Trans> : <Trans>View More Stats</Trans>}
            </Text>
          </Row>
        </CardWrapper>
      )}
    </>
  )
}