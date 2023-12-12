import { ChainId } from '@kyberswap/ks-sdk-core'
import { Trans, t } from '@lingui/macro'
import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft } from 'react-feather'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Text } from 'rebass'
import {
  useGetMyPortfoliosQuery,
  useGetPortfolioByIdQuery,
  useGetPortfolioRealtimeBalanceQuery,
  useGetRealtimeBalanceQuery,
  useGetWalletsPortfoliosQuery,
} from 'services/portfolio'
import { SHARE_TYPE } from 'services/social'
import styled from 'styled-components'

import Column from 'components/Column'
import Wallet from 'components/Icons/Wallet'
import Row, { RowBetween, RowFit } from 'components/Row'
import Select from 'components/Select'
import MultipleChainSelect from 'components/Select/MultipleChainSelect'
import ShareImageModal from 'components/ShareModal/ShareImageModal'
import { APP_PATHS, CHAINS_SUPPORT_PORTFOLIO, EMPTY_ARRAY } from 'constants/index'
import useParsedQueryString from 'hooks/useParsedQueryString'
import useShowLoadingAtLeastTime from 'hooks/useShowLoadingAtLeastTime'
import useTheme from 'hooks/useTheme'
import AddressPanel, { PortfolioOption } from 'pages/NotificationCenter/Portfolio/PortfolioDetail/AddressPanel'
import Allowances from 'pages/NotificationCenter/Portfolio/PortfolioDetail/Allowances'
import Liquidity from 'pages/NotificationCenter/Portfolio/PortfolioDetail/Liquidity'
import ListTab from 'pages/NotificationCenter/Portfolio/PortfolioDetail/ListTab'
import Nft from 'pages/NotificationCenter/Portfolio/PortfolioDetail/Nft'
import Tokens from 'pages/NotificationCenter/Portfolio/PortfolioDetail/Tokens'
import TokenAllocation, {
  AllocationTab,
} from 'pages/NotificationCenter/Portfolio/PortfolioDetail/Tokens/TokenAllocation'
import Transactions from 'pages/NotificationCenter/Portfolio/PortfolioDetail/Transactions'
import { PORTFOLIO_POLLING_INTERVAL } from 'pages/NotificationCenter/Portfolio/const'
import {
  getPortfolioDetailUrl,
  useNavigateToPortfolioDetail,
  useParseWalletPortfolioParam,
} from 'pages/NotificationCenter/Portfolio/helpers'
import { Portfolio, PortfolioTab, PortfolioWallet } from 'pages/NotificationCenter/Portfolio/type'
import { MEDIA_WIDTHS } from 'theme'
import getShortenAddress from 'utils/getShortenAddress'
import { formatDisplayNumber } from 'utils/numbers'
import { isInEnum, shortString } from 'utils/string'

const useFetchPortfolio = (): {
  wallets: PortfolioWallet[]
  isLoading: boolean
  portfolio: Portfolio | undefined
  myPortfolios: Portfolio[]
  portfolioOptions: PortfolioOption[]
} => {
  const { portfolioId } = useParseWalletPortfolioParam()
  const { currentData: currentPortfolio, isFetching: isLoadingCurrentPortfolio } = useGetPortfolioByIdQuery(
    { id: portfolioId || '' },
    { skip: !portfolioId },
  )
  const { currentData: wallets = EMPTY_ARRAY, isFetching: isLoadingWallet } = useGetWalletsPortfoliosQuery(
    { portfolioId: currentPortfolio?.id || '' },
    { skip: !currentPortfolio?.id },
  )

  const { data: myPortfolios = EMPTY_ARRAY as Portfolio[], isFetching: isLoadingMyPortfolio } =
    useGetMyPortfoliosQuery()

  const ids = useMemo(() => myPortfolios.map(e => e.id), [myPortfolios])
  const { data: balances } = useGetPortfolioRealtimeBalanceQuery({ ids }, { skip: !ids.length })

  const portfolioOptions = useMemo(
    () =>
      myPortfolios.map(portfolio => ({
        portfolio,
        totalUsd: Number(balances?.find(e => e.portfolioId === portfolio.id)?.totalUsd) || 0,
        active: portfolio?.id === portfolioId,
      })),
    [myPortfolios, balances, portfolioId],
  )

  const isLoading = useShowLoadingAtLeastTime(isLoadingWallet || isLoadingMyPortfolio || isLoadingCurrentPortfolio, 500)
  return {
    // current portfolio by url
    portfolio: currentPortfolio,
    wallets,
    isLoading,
    // all my portfolio
    myPortfolios,
    portfolioOptions,
  }
}

const ChainWalletSelect = styled(Row)`
  gap: 12px;
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
      width: 100%;
      justify-content: space-between;
  `};
`

export default function PortfolioStat({ navigateToMyPortfolio }: { navigateToMyPortfolio: () => void }) {
  const upToSmall = useMedia(`(max-width: ${MEDIA_WIDTHS.upToSmall}px)`)
  const { tab = '', search } = useParsedQueryString<{ tab: string; search: string }>()
  const [activeTab, setTab] = useState(isInEnum(tab, PortfolioTab) ? tab : PortfolioTab.TOKEN)
  const [showShare, setShowShare] = useState(false)

  const [, setSearchParams] = useSearchParams()
  const onChangeTab = (tab: PortfolioTab) => {
    const params = new URLSearchParams()
    params.set('tab', tab)
    setSearchParams(params) // reset params
    setTab(tab)
  }

  const { wallet, portfolioId } = useParseWalletPortfolioParam()
  const { portfolio, myPortfolios, wallets, isLoading: isLoadingPortfolio, portfolioOptions } = useFetchPortfolio()
  const walletsQuery: string[] = useMemo(
    () => (wallet ? [wallet] : wallets.length ? wallets.map(e => e.walletAddress) : EMPTY_ARRAY),
    [wallets, wallet],
  )

  const [chainIds, setChainIds] = useState<ChainId[]>([...CHAINS_SUPPORT_PORTFOLIO])
  const isAllChain = chainIds.length === CHAINS_SUPPORT_PORTFOLIO.length

  const { isLoading: isLoadingRealtimeData, data: currentData } = useGetRealtimeBalanceQuery(
    { walletAddresses: walletsQuery },
    { skip: !walletsQuery.length, refetchOnMountOrArgChange: true, pollingInterval: PORTFOLIO_POLLING_INTERVAL },
  )

  const totalUsd = currentData?.totalUsd || 0

  const isLoading: boolean = isLoadingPortfolio || isLoadingRealtimeData

  const handleChangeChains = (chainIds: ChainId[]) => {
    setChainIds(chainIds)
  }

  const { pathname } = useLocation()
  const isMyPortfolioPage = pathname.startsWith(APP_PATHS.MY_PORTFOLIO)
  const navigate = useNavigateToPortfolioDetail()
  const onChangeWallet = (wallet?: string) => {
    navigate({ myPortfolio: isMyPortfolioPage, wallet, portfolioId })
  }
  const theme = useTheme()
  const walletsOpts = useMemo(() => {
    const opt = wallets.map(wallet => ({
      label: wallet.nickName
        ? `${shortString(wallet.nickName, 20)} - ${getShortenAddress(wallet.walletAddress)}`
        : getShortenAddress(wallet.walletAddress),
      value: wallet.walletAddress,
    }))
    return activeTab === PortfolioTab.TRANSACTIONS ? opt : [{ label: t`All Wallets`, value: '' }, ...opt]
  }, [wallets, activeTab])

  const props = useMemo(() => {
    return {
      walletAddresses: walletsQuery,
      chainIds,
      mobile: upToSmall,
      isAllChain,
    }
  }, [walletsQuery, upToSmall, chainIds, isAllChain])

  const shareContents = useMemo(() => {
    return [
      (mobile: boolean | undefined) => (
        <TokenAllocation {...props} shareMode mobile={mobile} defaultTab={AllocationTab.TOKEN} totalUsd={totalUsd} />
      ),
      (mobile: boolean | undefined) => (
        <TokenAllocation {...props} shareMode mobile={mobile} defaultTab={AllocationTab.CHAIN} totalUsd={totalUsd} />
      ),
    ]
  }, [props, totalUsd])

  useEffect(() => {
    if (isMyPortfolioPage && !myPortfolios.some(e => e.id === portfolioId)) {
      navigateToMyPortfolio()
    }
  }, [isMyPortfolioPage, portfolioId, myPortfolios, navigateToMyPortfolio])

  const navigateRouter = useNavigate()

  return (
    <>
      {search && (
        <RowFit
          color={theme.primary}
          fontSize={'14px'}
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            navigateRouter(-1)
          }}
        >
          <ChevronLeft />
          <Trans>Back</Trans>
        </RowFit>
      )}

      <AddressPanel
        isLoading={isLoading}
        wallets={wallets}
        activePortfolio={portfolio}
        onShare={() => setShowShare(true)}
        data={currentData}
        portfolioOptions={portfolioOptions}
        onChangeWallet={onChangeWallet}
      />
      <RowBetween flexWrap={'wrap'} gap="16px">
        <ListTab activeTab={activeTab} setTab={onChangeTab} />
        <ChainWalletSelect>
          {portfolioId && walletsOpts.length && (
            <Select
              onChange={onChangeWallet}
              style={{ borderRadius: 24, background: theme.buttonGray, height: 36, minWidth: 150 }}
              options={walletsOpts}
              activeRender={item => (
                <Row gap="6px" fontSize={'14px'} fontWeight={'500'}>
                  <Wallet />
                  {item?.label}
                </Row>
              )}
            />
          )}
          <MultipleChainSelect
            chainIds={CHAINS_SUPPORT_PORTFOLIO}
            selectedChainIds={chainIds}
            handleChangeChains={handleChangeChains}
            style={{ height: '36px' }}
          />
        </ChainWalletSelect>
      </RowBetween>
      {activeTab === PortfolioTab.TOKEN && <Tokens {...props} totalUsd={totalUsd} />}
      {activeTab === PortfolioTab.LIQUIDITY && <Liquidity walletAddresses={walletsQuery} chainIds={chainIds} />}
      {activeTab === PortfolioTab.ALLOWANCES && <Allowances {...props} />}
      {activeTab === PortfolioTab.TRANSACTIONS && (
        <Transactions wallet={wallet || wallets?.[0]?.walletAddress} chainIds={chainIds} />
      )}
      {activeTab === PortfolioTab.NFT && <Nft {...props} />}
      <ShareImageModal
        redirectUrl={`${window.location.origin}${getPortfolioDetailUrl({ portfolioId, wallet, myPortfolio: false })}`}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        content={shareContents}
        shareType={SHARE_TYPE.PORTFOLIO}
        imageName={'portfolio.png'}
        leftLogo={
          <Column gap="8px">
            <Text fontSize={'20px'}>
              {isMyPortfolioPage ? (
                <Trans>My Portfolio</Trans>
              ) : (
                <Trans>Portfolio {portfolio?.name || portfolio?.id}</Trans>
              )}
            </Text>
            {currentData && (
              <Text fontSize={'28px'}>
                {formatDisplayNumber(currentData.totalUsd, { style: 'currency', fractionDigits: 2 })}
              </Text>
            )}
          </Column>
        }
        kyberswapLogoTitle={'Portfolio'}
      />
    </>
  )
}
