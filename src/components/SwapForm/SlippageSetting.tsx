import { Trans, t } from '@lingui/macro'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as DropdownSVG } from 'assets/svg/down.svg'
import QuestionHelper from 'components/QuestionHelper'
import SlippageControl from 'components/swapv2/SlippageControl'
import useTheme from 'hooks/useTheme'
import { useAppSelector } from 'state/hooks'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { formatSlippage } from 'utils/slippage'

const DropdownIcon = styled(DropdownSVG)`
  cursor: pointer;

  transition: transform 300ms;
  color: ${({ theme }) => theme.subText};
  &[data-flip='true'] {
    transform: rotate(180deg);
  }
`

const SlippageSetting: React.FC = () => {
  const theme = useTheme()
  const [rawSlippage] = useUserSlippageTolerance()

  const [expanded, setExpanded] = useState(false)

  const isSlippageControlPinned = useAppSelector(state => state.swap.isSlippageControlPinned)

  if (!isSlippageControlPinned) {
    return null
  }

  return (
    <Flex
      sx={{
        flexDirection: 'column',
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          color: theme.subText,
          gap: '4px',
        }}
      >
        <Flex
          sx={{
            alignItems: 'center',
            color: theme.subText,
            fontSize: isMobile ? '14px' : '12px',
            fontWeight: 500,
            lineHeight: '1',
          }}
        >
          <Text as="span">
            <Trans>Max Slippage</Trans>
          </Text>
          <QuestionHelper
            placement="top"
            text={t`Transaction will revert if there is an adverse rate change that is higher than this %. You can hide this control in Settings.`}
          />
          <Text as="span" marginLeft="4px">
            :
          </Text>
        </Flex>

        <Text
          sx={{
            fontSize: isMobile ? '16px' : '14px',
            fontWeight: 500,
            lineHeight: '1',
            color: theme.text,
          }}
        >
          {formatSlippage(rawSlippage, true)}
        </Text>

        <DropdownIcon data-flip={expanded} onClick={() => setExpanded(e => !e)} />
      </Flex>

      <Flex
        sx={{
          transition: 'all 100ms linear',
          paddingTop: expanded ? '8px' : '0px',
          height: expanded ? '36px' : '0px',
          overflow: 'hidden',
        }}
      >
        <SlippageControl />
      </Flex>
    </Flex>
  )
}

export default SlippageSetting