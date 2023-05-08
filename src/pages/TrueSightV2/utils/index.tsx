import { t } from '@lingui/macro'
import { commify } from 'ethers/lib/utils'
import { DefaultTheme } from 'styled-components'

export const calculateValueToColor = (value: number, theme: DefaultTheme) => {
  if (value === 0) return theme.darkMode ? theme.subText : theme.border
  if (value < 20) {
    return theme.red
  }
  if (value < 40) {
    return '#FFA7C3'
  }
  if (value < 60) {
    return theme.darkMode ? theme.text : theme.border
  }
  if (value < 80) {
    return '#8DE1C7'
  }
  return theme.primary
}

export const formatShortNum = (num: number, fixed = 1): string => {
  const negative = num < 0
  const absNum = Math.abs(num)
  let formattedNum = ''
  if (absNum > 1000000000) {
    formattedNum = (+(absNum / 1000000000).toFixed(fixed)).toString() + 'B'
  } else if (absNum > 1000000) {
    formattedNum = (+(absNum / 1000000).toFixed(fixed)).toString() + 'M'
  } else if (absNum > 1000) {
    formattedNum = (+(absNum / 1000).toFixed(fixed)).toString() + 'K'
  } else {
    formattedNum = (+absNum.toFixed(fixed)).toString()
  }

  return (negative ? '-' : '') + formattedNum
}

export const formatLocaleStringNum = (num: number, fixed?: number): string => {
  if (num === 0) return '--'
  const negative = num < 0
  const absNum = Math.abs(num)
  let formattedNum = ''
  if (absNum > 100000) {
    formattedNum = commify(+absNum.toFixed(fixed || 0))
  } else if (absNum > 100) {
    formattedNum = commify(+absNum.toFixed(fixed || 2))
  } else {
    formattedNum = commify(+absNum.toFixed(fixed || 4))
  }
  return (negative ? '-' : '') + formattedNum
}

export const formatTokenPrice = (num: number, fixed?: number): string => {
  if (num > 1000) {
    return commify(num.toFixed(2))
  } else if (num > 1) {
    return num.toFixed(fixed || 6)
  } else {
    return num.toPrecision(fixed || 6)
  }
}

export const isReferrerCodeInvalid = (error: any) => error?.data?.code === 4040

export const getErrorMessage = (error: any) => {
  const mapErr: { [key: number]: string } = {
    4004: t`OTP wrong or expired. Please try again.`,
    4040: t`Referral code is invalid`,
    4090: t`This email address is already registered`,
  }
  const code = error?.data?.code
  return mapErr[code] || t`Error occur, please try again`
}