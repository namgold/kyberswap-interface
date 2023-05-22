import { Trans } from '@lingui/macro'
import React, { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { useMedia } from 'react-use'
import { Text } from 'rebass'
import styled, { css } from 'styled-components'

import Icon from 'components/Icons/Icon'
import Row, { RowBetween, RowFit } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import useTheme from 'hooks/useTheme'
import { MEDIA_WIDTHS } from 'theme'

import { ChartTab } from '../types'
import KyberAIShareModal from './KyberAIShareModal'

export const StyledSectionWrapper = styled.div<{ show?: boolean }>`
  display: ${({ show }) => (show ?? 'auto' ? 'auto' : 'none !important')};
  content-visibility: auto;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  /* ${({ theme }) => `background-color: ${theme.background};`} */
  background: ${({ theme }) =>
    theme.darkMode
      ? `linear-gradient(332deg, rgb(32 32 32) 0%, rgba(15, 15, 15, 1) 80%)`
      : `linear-gradient(34.68deg, rgba(193, 193, 193, 0.1) 9.77%, rgba(255, 255, 255, 0) 108.92%);`};
  margin-bottom: 36px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 580px;
`

export const SectionTitle = styled.div`
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
  margin: 0px -16px;
  padding: 0px 16px 16px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border + '80'};
  color: ${({ theme }) => theme.text};
`
export const SectionDescription = styled.div<{ show?: boolean }>`
  font-size: 14px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  flex: 1;
  color: ${({ theme }) => theme.subText};
  ${({ show }) =>
    show &&
    css`
      white-space: initial;
    `}
`

const ButtonWrapper = styled.div`
  color: ${({ theme }) => theme.subText};
  height: 24px;
  width: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  :hover {
    background-color: ${({ theme }) => theme.border + '33'};
  }
`
export const FullscreenButton = React.memo(function FCButton({ element }: { element?: HTMLDivElement | null }) {
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      element?.requestFullscreen()
    }
  }

  return (
    <ButtonWrapper onClick={toggleFullscreen}>
      <Icon id="fullscreen" size={16} />
    </ButtonWrapper>
  )
})

export const ShareButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <ButtonWrapper onClick={onClick}>
      <Icon id="share" size={16} />
    </ButtonWrapper>
  )
}

export const SectionWrapper = ({
  show,
  title,
  subTitle,
  description,
  id,
  shareButton,
  shareContent,
  fullscreenButton,
  tabs,
  activeTab,
  onTabClick,
  onShareClick,
  children,
  style,
}: {
  show?: boolean
  title?: string
  subTitle?: string | ReactNode
  description?: ReactNode
  id?: string
  shareButton?: boolean
  shareContent?: ReactNode
  fullscreenButton?: boolean
  tabs?: string[]
  activeTab?: ChartTab
  onTabClick?: (tab: ChartTab) => void
  onShareClick?: () => void
  children?: React.ReactNode
  style?: React.CSSProperties
}) => {
  const theme = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const above768 = useMedia(`(min-width:${MEDIA_WIDTHS.upToSmall}px)`)
  const [showText, setShowText] = useState(true)
  const [showShare, setShowShare] = useState(false)

  const [isTextExceeded, setIsTexExceeded] = useState(false)
  const descriptionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    setIsTexExceeded(
      (description &&
        descriptionRef.current &&
        descriptionRef.current?.clientWidth <= descriptionRef.current?.scrollWidth) ||
        false,
    )
  }, [description])

  return (
    <StyledSectionWrapper show={show} ref={ref} id={id} style={style}>
      {above768 ? (
        <>
          {/* DESKTOP */}
          <SectionTitle>
            <RowBetween style={{ height: '16px' }}>
              <RowFit
                style={{
                  margin: '-16px',
                }}
              >
                {tabs ? (
                  tabs.map((item, index) => {
                    return (
                      <TabButton
                        key={item}
                        text={item}
                        active={activeTab === index}
                        onClick={() => onTabClick?.(index)}
                        style={{ padding: '16px', fontSize: '16px', lineHeight: '16px', height: '48px' }}
                      />
                    )
                  })
                ) : (
                  <Text marginLeft="16px">{title}</Text>
                )}
              </RowFit>
              <RowFit color={theme.subText} gap="12px">
                {subTitle && (
                  <Text fontStyle="italic" fontSize="12px" lineHeight="16px" color={theme.subText}>
                    {subTitle}
                  </Text>
                )}
                {shareButton && (
                  <ShareButton
                    onClick={() => {
                      onShareClick?.()
                      setShowShare(true)
                    }}
                  />
                )}
                {fullscreenButton && <FullscreenButton element={ref.current} />}
              </RowFit>
            </RowBetween>
          </SectionTitle>
          {tabs && activeTab !== undefined && title && (
            <Row>
              <Text fontSize="16px" lineHeight="20px" color={theme.text} fontWeight={500}>
                {tabs[activeTab] + ' ' + title}
              </Text>
            </Row>
          )}
          <Row gap="4px" align="center" style={{ marginBottom: '4px' }}>
            <SectionDescription show={showText} ref={descriptionRef}>
              {description}
              {showText && isTextExceeded && (
                <Text
                  as="span"
                  fontSize="14px"
                  color={theme.primary}
                  width="fit-content"
                  style={{ cursor: 'pointer', flexBasis: 'fit-content', whiteSpace: 'nowrap' }}
                  onClick={() => setShowText(prev => !prev)}
                >
                  {' '}
                  <Trans>Hide</Trans>
                </Text>
              )}
            </SectionDescription>
            {!showText && isTextExceeded && (
              <Text
                as="span"
                fontSize="14px"
                lineHeight="21px"
                color={theme.primary}
                width="fit-content"
                style={{ cursor: 'pointer', flexBasis: 'fit-content', whiteSpace: 'nowrap' }}
                onClick={() => setShowText(prev => !prev)}
              >
                <Trans>Show more</Trans>
              </Text>
            )}
          </Row>
          {children || <></>}
        </>
      ) : (
        <>
          {/* MOBILE */}
          <SectionTitle>
            <Row
              style={{
                width: 'calc(100% + 32px)',
                margin: '-16px -16px 16px -16px',
              }}
            >
              {tabs &&
                tabs.map((item, index) => {
                  return (
                    <TabButton
                      key={item}
                      text={item}
                      active={activeTab === index}
                      onClick={() => onTabClick?.(index)}
                      style={{ flex: 1 }}
                    />
                  )
                })}
            </Row>
            <RowBetween>
              <MouseoverTooltip text={description}>
                <Text
                  style={{
                    fontSize: '12px',
                    textDecoration: `underline dotted ${theme.subText}`,
                    textUnderlineOffset: '6px',
                  }}
                >
                  {(tabs ? tabs[activeTab || 0] + ' ' : '') + title}
                </Text>
              </MouseoverTooltip>
              <RowFit color={theme.subText} gap="12px">
                {shareButton && <ShareButton onClick={() => setShowShare(true)} />}
                {fullscreenButton && <FullscreenButton element={ref.current} />}
              </RowFit>
            </RowBetween>
          </SectionTitle>
          {children || <></>}
        </>
      )}
      <KyberAIShareModal
        title={tabs && activeTab !== undefined && title ? tabs[activeTab] + ' ' + title : title}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        content={shareContent}
      />
    </StyledSectionWrapper>
  )
}

const StyledMobileTabButton = styled.div<{ active?: boolean }>`
  font-size: 12px;
  line-height: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  flex: 1;
  box-sizing: border-box;
  cursor: pointer;
  ${({ theme, active }) =>
    active
      ? css`
          color: ${theme.primary};
          background-color: ${theme.primary + '40'};
          box-shadow: inset 0 -2px 0 0 ${theme.primary};
        `
      : css`
          color: ${theme.subText};
          background-color: ${theme.background};
        `}

  :hover {
    filter: brightness(1.2);
  }
`

export const TabButton = ({
  text,
  active,
  onClick,
  style,
}: {
  text?: string
  active?: boolean
  onClick?: () => void
  style?: CSSProperties
}) => {
  const above768 = useMedia(`(min-width: ${MEDIA_WIDTHS.upToSmall}px)`)

  return (
    <>
      {above768 ? (
        <StyledMobileTabButton active={active} onClick={onClick} style={style}>
          {text}
        </StyledMobileTabButton>
      ) : (
        <StyledMobileTabButton active={active} onClick={onClick} style={style}>
          {text}
        </StyledMobileTabButton>
      )}
    </>
  )
}
