import KyberOauth2, { AnonymousAccount, LoginMethod } from '@kybernetwork/oauth2'
import { t } from '@lingui/macro'
import { captureException } from '@sentry/react'
import { useCallback, useEffect, useRef } from 'react'
import { useConnectWalletToProfileMutation, useGetOrCreateProfileMutation } from 'services/identity'

import { NotificationType } from 'components/Announcement/type'
import { useShowConfirm } from 'components/ConfirmModal'
import { ENV_KEY, OAUTH_CLIENT_ID } from 'constants/env'
import { APP_PATHS } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { useNotify, useWalletModalToggle } from 'state/application/hooks'
import {
  KEY_GUEST_DEFAULT,
  useAllProfileInfo,
  useSaveUserProfile,
  useSetPendingAuthentication,
  useSignedAccount,
} from 'state/authen/hooks'
import { filterTruthy, isAddress } from 'utils'
import getShortenAddress from 'utils/getShortenAddress'
import { getConnectedProfile } from 'utils/profile'
import { setLoginRedirectUrl } from 'utils/redirectUponLogin'
import { isEmailValid, shortString } from 'utils/string'

KyberOauth2.initialize({
  clientId: OAUTH_CLIENT_ID,
  redirectUri: `${window.location.protocol}//${window.location.host}${APP_PATHS.VERIFY_AUTH}`,
  mode: ENV_KEY,
})

let needSignInAfterConnectWallet = false
let accountSignAfterConnectedWallet: string | undefined
const useLogin = (autoLogin = false) => {
  const { account, chainId } = useActiveWeb3React()
  const [createProfile] = useGetOrCreateProfileMutation()
  const [connectWalletToProfile] = useConnectWalletToProfileMutation()
  const notify = useNotify()
  const toggleWalletModal = useWalletModalToggle()
  const [signedAccount, saveSignedAccount] = useSignedAccount()
  const { removeProfile, removeAllProfile } = useAllProfileInfo()
  const showConfirm = useShowConfirm()
  const qs = useParsedQueryString()
  const setLoading = useSetPendingAuthentication()
  const setProfile = useSaveUserProfile()

  const getProfile = useCallback(
    async ({
      walletAddress,
      isAnonymous,
      session,
      account,
    }: {
      walletAddress: string | undefined
      isAnonymous: boolean
      account: string
      session: any
    }) => {
      try {
        const profile = await createProfile().unwrap()
        if (walletAddress && isAddress(chainId, walletAddress)) {
          await connectWalletToProfile({ walletAddress })
        }

        const formatProfile = { ...profile }
        if (isEmailValid(account) && session) {
          // sign in with google
          formatProfile.avatarUrl = session?.picture ?? ''
          formatProfile.email = session?.email ?? ''
          formatProfile.nickname = filterTruthy([session?.first_name, session?.last_name]).join(' ')
        }
        setProfile({ profile: formatProfile, isAnonymous, account })
      } catch (error) {
        const e = new Error('createProfile Error', { cause: error })
        e.name = 'createProfile Error'
        captureException(e, { extra: { walletAddress, account } })
        setProfile({ profile: undefined, isAnonymous, account })
      }
    },
    [connectWalletToProfile, createProfile, setProfile, chainId],
  )

  const showSignInSuccess = useCallback(
    (desireAccount: string | undefined, guest = false) =>
      !autoLogin &&
      notify(
        {
          type: NotificationType.SUCCESS,
          title: t`Signed in successfully`,
          summary:
            desireAccount?.toLowerCase() === account?.toLowerCase()
              ? t`Signed in successfully with the current wallet address`
              : t`Signed in successfully with ${
                  isEmailValid(desireAccount)
                    ? `email ${desireAccount}`
                    : guest
                    ? `guest account ${desireAccount === KEY_GUEST_DEFAULT ? '' : shortString(desireAccount, 25)}`
                    : `wallet ${getShortenAddress(desireAccount ?? '')}`
                }`,
        },
        10_000,
      ),
    [account, notify, autoLogin],
  )

  const signInAnonymous = useCallback(
    async (guestAccountParam?: string) => {
      let userInfo
      const guestAccount = guestAccountParam || KEY_GUEST_DEFAULT
      try {
        setLoading(true)
        const resp = await KyberOauth2.loginAnonymous(guestAccount === KEY_GUEST_DEFAULT ? undefined : guestAccount)
        userInfo = resp.userInfo
        saveSignedAccount({ account: guestAccount, method: LoginMethod.ANONYMOUS })
      } catch (error) {
        console.log('sign in anonymous err', error)
      } finally {
        setLoading(false)
        await getProfile({ walletAddress: account, isAnonymous: true, account: guestAccount, session: userInfo })
        showSignInSuccess(guestAccount, true)
      }
    },
    [getProfile, setLoading, account, saveSignedAccount, showSignInSuccess],
  )

  // check session when sign in eth/email
  const checkSessionSignIn = useCallback(
    async (desireAccount: string | undefined, loginAnonymousIfFailed = true) => {
      try {
        setLoading(true)
        const { loginMethod, userInfo } = await KyberOauth2.getSession(
          isEmailValid(desireAccount ?? '') || !desireAccount
            ? { account: desireAccount }
            : { method: LoginMethod.ETH, account: desireAccount },
        )
        const respAccount = userInfo.email || userInfo.wallet_address || desireAccount
        saveSignedAccount({ account: respAccount, method: loginMethod })
        await getProfile({
          walletAddress: respAccount,
          isAnonymous: false,
          session: userInfo,
          account: respAccount,
        })
        showSignInSuccess(respAccount)
      } catch (error) {
        console.log('sdk get session err:', desireAccount, error.message)
        if (loginAnonymousIfFailed) {
          await signInAnonymous()
        }
      } finally {
        setLoading(false)
      }
    },
    [setLoading, signInAnonymous, getProfile, saveSignedAccount, showSignInSuccess],
  )

  // check account info and redirect if needed
  const signIn = useCallback(
    async (desireAccount?: string, showSessionExpired = false) => {
      const isAddAccount = !desireAccount
      const isSelectAccount = !!desireAccount

      if (isAddAccount && !account) {
        toggleWalletModal()
        needSignInAfterConnectWallet = true
        accountSignAfterConnectedWallet = desireAccount
        return
      }
      needSignInAfterConnectWallet = false

      const connectedAccounts = KyberOauth2.getConnectedAccounts()
      const isTokenExist = connectedAccounts.includes(desireAccount?.toLowerCase() || '')
      if (isSelectAccount && isTokenExist) {
        await checkSessionSignIn(desireAccount, false)
        return
      }

      const redirectSignIn = () => {
        KyberOauth2.authenticate() // navigate to login page
        setLoginRedirectUrl()
      }
      if (showSessionExpired && isSelectAccount && !isTokenExist) {
        showConfirm({
          isOpen: true,
          content: t`Your session has expired. Please sign-in to continue.`,
          title: t`Session Expired`,
          confirmText: t`Sign-in`,
          onConfirm: () => redirectSignIn(),
          cancelText: t`Cancel`,
        })
        return
      }
      redirectSignIn()
    },
    [account, checkSessionSignIn, toggleWalletModal, showConfirm],
  )

  const signOut = useCallback(
    (desireAccount?: string) => {
      if (!desireAccount || desireAccount?.toLowerCase() === signedAccount?.toLowerCase()) {
        setLoginRedirectUrl()
        removeProfile(desireAccount)
        KyberOauth2.logout()
        return
      }
      KyberOauth2.removeConnectedAccount(desireAccount)
      notify(
        {
          type: NotificationType.SUCCESS,
          title: t`Signed out successfully`,
          summary: t`You had successfully signed out`,
        },
        10_000,
      )
      removeProfile(desireAccount)
    },
    [signedAccount, notify, removeProfile],
  )

  const signOutAll = useCallback(() => {
    let needRedirect = false
    KyberOauth2.getConnectedAccounts().forEach(acc => {
      if (acc?.toLowerCase() === signedAccount?.toLowerCase()) {
        needRedirect = true
        return
      }
      KyberOauth2.removeConnectedAccount(acc)
    })
    KyberOauth2.getConnectedAnonymousAccounts().forEach(e => KyberOauth2.removeAnonymousAccount(e))
    removeAllProfile()
    if (needRedirect) {
      signOut(signedAccount)
      return
    }
    notify(
      {
        type: NotificationType.SUCCESS,
        title: t`Signed out all accounts successfully`,
        summary: t`You had successfully signed out`,
      },
      10_000,
    )
  }, [notify, removeAllProfile, signedAccount, signOut])

  const signOutAnonymous = useCallback(
    (guestAccount: string | undefined) => {
      if (!guestAccount || guestAccount === KEY_GUEST_DEFAULT) return
      signInAnonymous()
      KyberOauth2.removeAnonymousAccount(guestAccount)
      removeProfile(guestAccount, true)
    },
    [signInAnonymous, removeProfile],
  )

  const importGuestAccount = useCallback(
    async (accountInfo: AnonymousAccount) => {
      const accountId = accountInfo.username
      KyberOauth2.importAnonymousAccount(accountInfo)
      return signInAnonymous(accountId)
    },
    [signInAnonymous],
  )

  const signOutWrapped = useCallback(
    (desireAccount: string | undefined, isGuest: boolean) => {
      return isGuest ? signOutAnonymous(desireAccount) : signOut(desireAccount)
    },
    [signOutAnonymous, signOut],
  )

  const signInWrapped = useCallback(
    (desireAccount: string | undefined = undefined, isGuest = false, showSessionExpired = false) => {
      return isGuest ? signInAnonymous(desireAccount) : signIn(desireAccount, showSessionExpired)
    },
    [signInAnonymous, signIn],
  )

  // auto try sign in when the first visit app, call once
  const isInit = useRef(false)
  useEffect(() => {
    if (!autoLogin || isInit.current) return
    isInit.current = true
    const { connectedMethod } = getConnectedProfile()
    if (qs.code) {
      // redirect from server
      checkSessionSignIn(undefined)
      return
    }
    if (connectedMethod === LoginMethod.ANONYMOUS) {
      signInAnonymous(signedAccount)
      return
    }
    checkSessionSignIn(signedAccount || undefined)
  }, [checkSessionSignIn, autoLogin, signedAccount, signInAnonymous, qs.code])

  // auto sign in after connect wallet
  useEffect(() => {
    if (autoLogin || !account || !needSignInAfterConnectWallet) return
    signIn(accountSignAfterConnectedWallet)
    needSignInAfterConnectWallet = false
  }, [account, signIn, autoLogin])

  return { signOut: signOutWrapped, signIn: signInWrapped, signOutAll, importGuestAccount }
}

export default useLogin
