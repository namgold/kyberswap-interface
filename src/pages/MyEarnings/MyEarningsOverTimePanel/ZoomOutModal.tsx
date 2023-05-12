import styled from 'styled-components'

import Modal from 'components/Modal'
import { EarningStatsTick } from 'types/myEarnings'

import BasePanel from './BasePanel'

const Panel = styled(BasePanel)`
  border: none;
`

type Props = {
  isOpen: boolean
  toggleOpen: () => void
  isLoading: boolean | undefined
  ticks: EarningStatsTick[] | undefined
  isContainerSmall?: boolean
}
const ZoomOutModal: React.FC<Props> = ({ ticks, isLoading, isOpen, toggleOpen, isContainerSmall }) => {
  return (
    <Modal isOpen={isOpen} onDismiss={toggleOpen} maxWidth="calc(100vw - 32px)" width="100%" height="100%">
      <Panel
        isZoomed
        isLoading={isLoading}
        ticks={ticks}
        toggleModal={toggleOpen}
        isContainerSmall={isContainerSmall}
      />
    </Modal>
  )
}

export default ZoomOutModal
