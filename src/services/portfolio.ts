import { ChainId } from '@kyberswap/ks-sdk-core'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { RTK_QUERY_TAGS } from 'constants/index'
import {
  Portfolio,
  PortfolioSetting,
  PortfolioWallet,
  PortfolioWalletBalance,
  PortfolioWalletBalanceResponse,
  TokenAllowAnceResponse,
  TransactionHistoryResponse,
} from 'pages/NotificationCenter/Portfolio/type'

const KRYSTAL_API = 'https://api.krystal.app/all/v1'
const portfolioApi = createApi({
  reducerPath: 'portfolioApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://portfolio-service-api.dev.kyberengineering.io/api' }),
  tagTypes: [
    RTK_QUERY_TAGS.GET_LIST_PORTFOLIO,
    RTK_QUERY_TAGS.GET_LIST_WALLET_PORTFOLIO,
    RTK_QUERY_TAGS.GET_SETTING_PORTFOLIO,
  ],
  endpoints: builder => ({
    getPortfolios: builder.query<Portfolio[], void>({
      query: () => ({
        url: '/v1/portfolios',
        params: { identityId: window.identityId }, // todo
      }),
      transformResponse: (data: any) => data?.data?.portfolios,
      providesTags: [RTK_QUERY_TAGS.GET_LIST_PORTFOLIO],
    }),
    searchPortfolios: builder.query<Portfolio, { id: string }>({
      query: ({ id }) => ({
        url: `/v1/portfolios/${id}`,
      }),
      transformResponse: (data: any) => data?.data,
    }),
    createPortfolio: builder.mutation<void, { name: string }>({
      query: body => ({
        url: '/v1/portfolios',
        method: 'POST',
        body,
        params: { identityId: window.identityId }, // todo
      }),
      invalidatesTags: [RTK_QUERY_TAGS.GET_LIST_PORTFOLIO],
    }),
    clonePortfolio: builder.mutation<void, { name: string; portfolioId: string }>({
      query: body => ({
        url: '/v1/portfolios/clone',
        method: 'POST',
        body,
        params: { identityId: window.identityId }, // todo
      }),
      invalidatesTags: [RTK_QUERY_TAGS.GET_LIST_PORTFOLIO],
    }),
    updatePortfolio: builder.mutation<Portfolio, { name: string; id: string }>({
      query: ({ id, ...body }) => ({
        url: `/v1/portfolios/${id}`,
        method: 'PUT',
        body,
        params: { identityId: window.identityId }, // todo
      }),
      invalidatesTags: [RTK_QUERY_TAGS.GET_LIST_PORTFOLIO],
    }),
    deletePortfolio: builder.mutation<Portfolio, string>({
      query: id => ({
        url: `/v1/portfolios/${id}`,
        method: 'DELETE',
        params: { identityId: window.identityId }, // todo
      }),
      invalidatesTags: [RTK_QUERY_TAGS.GET_LIST_PORTFOLIO],
    }),
    // setting
    getPortfoliosSettings: builder.query<PortfolioSetting, void>({
      query: () => ({
        url: '/v1/settings',
        params: { identityId: window.identityId }, // todo
      }),
      transformResponse: (data: any) => data?.data,
      providesTags: [RTK_QUERY_TAGS.GET_SETTING_PORTFOLIO],
    }),
    updatePortfoliosSettings: builder.mutation<PortfolioSetting, PortfolioSetting>({
      query: body => ({
        url: `/v1/settings`,
        method: 'PUT',
        body,
        params: { identityId: window.identityId }, // todo
      }),
      invalidatesTags: [RTK_QUERY_TAGS.GET_SETTING_PORTFOLIO],
    }),
    // wallets
    getWalletsPortfolios: builder.query<PortfolioWallet[], { portfolioId: string }>({
      query: ({ portfolioId }) => ({
        url: `/v1/portfolios/${portfolioId}/wallets`,
        params: { identityId: window.identityId }, // todo
      }),
      transformResponse: (data: any) => data?.data?.wallets,
      providesTags: [RTK_QUERY_TAGS.GET_LIST_WALLET_PORTFOLIO],
    }),
    addWalletToPortfolio: builder.mutation<Portfolio, { portfolioId: string; walletAddress: string; nickName: string }>(
      {
        query: ({ portfolioId, ...body }) => ({
          url: `/v1/portfolios/${portfolioId}/wallets`,
          method: 'POST',
          body,
          params: { identityId: window.identityId }, // todo
        }),
        invalidatesTags: [RTK_QUERY_TAGS.GET_LIST_WALLET_PORTFOLIO],
      },
    ),
    updateWalletToPortfolio: builder.mutation<
      Portfolio,
      { portfolioId: string; walletAddress: string; nickName: string }
    >({
      query: ({ portfolioId, walletAddress, ...body }) => ({
        url: `/v1/portfolios/${portfolioId}/wallets/${walletAddress}`,
        method: 'PUT',
        body,
        params: { identityId: window.identityId }, // todo
      }),
      invalidatesTags: [RTK_QUERY_TAGS.GET_LIST_WALLET_PORTFOLIO],
    }),
    removeWalletFromPortfolio: builder.mutation<Portfolio, { portfolioId: string; walletAddress: string }>({
      query: ({ portfolioId, walletAddress }) => ({
        url: `/v1/portfolios/${portfolioId}/wallets/${walletAddress}`,
        method: 'DELETE',
        params: { identityId: window.identityId }, // todo
      }),
      invalidatesTags: [RTK_QUERY_TAGS.GET_LIST_WALLET_PORTFOLIO],
    }),
    // metadata
    getRealtimeBalance: builder.query<PortfolioWalletBalanceResponse, { query: string; chainIds?: ChainId[] }>({
      query: ({ query, chainIds }) => ({
        url: `/v1/real-time-data/${query}`,
        params: { chainIds: chainIds?.join(',') },
      }),
      transformResponse: (data: any) => {
        const balances = data?.data?.balances
        if (balances)
          Object.keys(balances).forEach(wallet => {
            data.data.balances[wallet] = balances[wallet].map((el: PortfolioWalletBalance) => ({
              ...el,
              walletAddress: wallet,
              chainId: +el.chainId,
            }))
          })
        return data?.data
      },
    }),
    getTokenApproval: builder.query<TokenAllowAnceResponse, { address: string; chainIds?: ChainId[] }>({
      query: ({ address, chainIds }) => ({
        url: `${KRYSTAL_API}/approval/list`,
        params: { address, chainIds: chainIds?.join(',') },
      }),
      transformResponse: (data: any) => data?.data,
    }),
    getTransactions: builder.query<
      TransactionHistoryResponse,
      {
        walletAddress: string
        chainIds?: ChainId[]
        limit: number
        endTime: number
        tokenAddress?: string
        tokenSymbol?: string
      }
    >({
      query: ({ chainIds, ...params }) => ({
        url: `${KRYSTAL_API}/txHistory/getHistory`,
        params: { ...params, chainIds: chainIds?.join(',') },
      }),
    }),
  }),
})

export const {
  useGetPortfoliosQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useGetRealtimeBalanceQuery,
  useGetTokenApprovalQuery,
  useGetTransactionsQuery,
  useDeletePortfolioMutation,
  useAddWalletToPortfolioMutation,
  useGetWalletsPortfoliosQuery,
  useRemoveWalletFromPortfolioMutation,
  useUpdateWalletToPortfolioMutation,
  useSearchPortfoliosQuery,
  useClonePortfolioMutation,
  useGetPortfoliosSettingsQuery,
  useUpdatePortfoliosSettingsMutation,
} = portfolioApi

export default portfolioApi
