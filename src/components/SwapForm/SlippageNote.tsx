import { rgba } from 'polished'
import { AlertTriangle } from 'react-feather'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { useCheckStablePairSwap } from 'state/swap/hooks'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { checkRangeSlippage } from 'utils/slippage'

const Wrapper = styled.div`
  padding: 12px 16px;

  display: flex;
  align-items: center;
  gap: 8px;

  border-radius: 999px;
  color: ${({ theme }) => theme.warning};
  background: ${({ theme }) => rgba(theme.warning, 0.2)};
  font-size: 12px;
`

const SlippageNote: React.FC = () => {
  const [rawSlippage] = useUserSlippageTolerance()
  const isStablePairSwap = useCheckStablePairSwap()
  const { isValid, message } = checkRangeSlippage(rawSlippage, isStablePairSwap)

  if (!isValid || !message) {
    return null
  }

  return (
    <Wrapper>
      <Flex flex="0 0 16px" height="16px" alignItems="center" justifyContent="center">
        <AlertTriangle size={16} />
      </Flex>
      {message}
    </Wrapper>
  )
}

export default SlippageNote