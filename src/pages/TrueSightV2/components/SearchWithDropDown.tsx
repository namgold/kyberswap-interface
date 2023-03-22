import { Trans, t } from '@lingui/macro'
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'react-feather'
import { useMedia } from 'react-use'
import { Text } from 'rebass'
import styled, { css, keyframes } from 'styled-components'

import { ButtonEmpty } from 'components/Button'
import Column from 'components/Column'
import History from 'components/Icons/History'
import Icon from 'components/Icons/Icon'
import SearchIcon from 'components/Icons/Search'
import Row, { RowFit } from 'components/Row'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useTheme from 'hooks/useTheme'
import { MEDIA_WIDTHS } from 'theme'

const Wrapper = styled.div<{ wider?: boolean; expanded?: boolean }>`
  display: flex;
  position: relative;
  align-items: center;
  padding: 6px 12px;
  border-radius: 40px;
  transition: all 0.2s ease;
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  z-index: 10;

  cursor: pointer;
  :hover {
    filter: brightness(1.1);
  }

  * {
    transition: all 0.2s ease;
  }

  width: 600px;

  ${({ expanded, theme }) =>
    expanded &&
    css`
      border-radius: 8px 8px 0 0;
      border-color: transparent;
    `}
`
const Input = styled.input<{ expanded?: boolean }>`
  display: flex;
  align-items: center;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  flex: 1;
  transition: all 0.2s ease;
  z-index: 2;
  min-width: 0;
  cursor: pointer;
  ::placeholder {
    color: ${({ theme, expanded }) => (expanded ? theme.border : theme.subText)};
  }
  :focus {
    cursor: text;
  }
`

const DropdownWrapper = styled.div<{ expanded?: boolean; height?: number }>`
  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  padding-top: 36px;
  width: 100%;
  background-color: ${({ theme }) => theme.background};
  z-index: 1;

  ${({ expanded, height, theme }) =>
    expanded
      ? css`
          max-height: ${height}px;
          border-radius: 8px;
          background-color: ${theme.tableHeader};
        `
      : css`
          max-height: 0px;
          border-radius: 40px;
        `}
`

const DropdownSection = styled.table`
  border-top: 1px solid ${({ theme }) => theme.border};
  padding: 10px;
  width: 100%;
  border-spacing: 0;
  th {
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
  }
  td,
  th {
    padding: 4px 6px;
  }
`

const DropdownItem = styled.tr`
  padding: 6px;
  background-color: ${({ theme }) => theme.tableHeader};
  height: 28px;

  :hover {
    filter: brightness(1.3);
  }
`

interface SearchProps {
  searchValue: string
  onSearch: (newSearchValue: string) => void
  allowClear?: boolean
  minWidth?: string
  style?: React.CSSProperties
}

const SampleLogo = () => (
  <svg
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <rect x="0.00146484" width="16" height="16" fill="url(#pattern0)" />
    <defs>
      <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlinkHref="#image0_1735_1667" transform="scale(0.0078125)" />
      </pattern>
      <image
        id="image0_1735_1667"
        width="128"
        height="128"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
)

const SampleChainLogo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.03107 0L7.92383 0.364508V10.9417L8.03107 11.0487L12.9409 8.14657L8.03107 0Z" fill="white" />
    <path d="M8.03091 0L3.12109 8.14657L8.03091 11.0488V5.91494V0Z" fill="white" />
    <path d="M8.03065 11.9784L7.97021 12.0521V15.8199L8.03065 15.9964L12.9434 9.0777L8.03065 11.9784Z" fill="white" />
    <path d="M8.03091 15.9964V11.9784L3.12109 9.07764L8.03091 15.9964Z" fill="white" />
    <path d="M8.03076 11.0488L12.9405 8.14661L8.03076 5.91498V11.0488Z" fill="white" />
    <path d="M3.12109 8.14661L8.03083 11.0488V5.91498L3.12109 8.14661Z" fill="white" />
  </svg>
)

const MWrapper = styled.div<{ expanded?: boolean; wider?: boolean; width?: number }>`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  padding: 10px;
  background-color: ${({ theme }) => theme.tableHeader};
  position: relative;
  transition: all 0.5s ease;
  left: 0;
`
const HiddenWrapper = styled.div<{ expanded?: boolean; width?: number; left?: number; top?: number; height?: number }>`
  position: fixed;
  height: 36px;
  width: 36px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.tableHeader};
  left: ${({ left }) => left || 0}px;
  top: ${({ top }) => top || 0}px;
  z-index: 20;
  border-radius: 18px;
  visibility: hidden;
  transition: all 0.4s ease;
  transition-delay: 0.3s;

  ${({ expanded, width, height }) =>
    expanded &&
    css`
      width: ${width}px;
      height: ${height || 400}px;
      left: 0px;
      border-radius: 8px;
      visibility: visible;
    `}
`

const ripple = keyframes`
  to {
    transform: scale(500);
    opacity: 0;
  }
`

const AnimationOnFocus = styled.div`
  position: absolute;
  right: 40px;
  top: 15px;
  height: 5px;
  width: 5px;
  transform: scale(0);
  background-color: ${({ theme }) => theme.subText};
  z-index: 1;
  border-radius: 50%;
  opacity: 0.2;
  animation: ${ripple} 0.6s linear;
`

const MobileWrapper = ({
  expanded,
  onClick,
  children,
}: {
  expanded: boolean
  onClick: () => void
  children: ReactNode
}) => {
  const theme = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [top, setTop] = useState(0)
  const left = ref.current?.offsetLeft || 0
  useEffect(() => {
    setTop(ref.current?.getBoundingClientRect().top || 0)
    function updateTop() {
      setTop(ref.current?.getBoundingClientRect().top || 0)
    }
    window.addEventListener('scroll', updateTop)
    return () => window.removeEventListener('scroll', updateTop)
  }, [])

  const contentHeight = contentRef.current?.scrollHeight
  return (
    <MWrapper onClick={onClick} expanded={expanded} wider={expanded} ref={ref} width={window.innerWidth}>
      <RowFit>
        <SearchIcon color={theme.subText} size={16} />
      </RowFit>
      <HiddenWrapper
        ref={contentRef}
        expanded={expanded}
        width={window.innerWidth}
        left={left}
        top={top}
        height={contentHeight}
      >
        {children}
      </HiddenWrapper>
    </MWrapper>
  )
}

const SearchWithDropdown = ({ searchValue, onSearch }: SearchProps) => {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const above768 = useMedia(`(min-width:${MEDIA_WIDTHS.upToSmall}px)`)

  useOnClickOutside(wrapperRef, () => setExpanded(false))
  useEffect(() => {
    if (!inputRef.current) return
    const inputEl = inputRef.current
    const onFocus = () => {
      setTimeout(() => {
        setExpanded(true)
      }, 200)
    }
    inputEl.addEventListener('focusin', onFocus)
    return () => {
      inputEl.removeEventListener('focusin', onFocus)
    }
  }, [])

  const handleXClick = useCallback((e: any) => {
    setSearch('')
    e.stopPropagation()
  }, [])

  const SampleItem = ({ score }: { score?: number }) => (
    <DropdownItem onClick={() => setSearch('ETH')}>
      <td>
        <RowFit gap="4px">
          <SampleLogo />
          <Text fontSize="12px" color={theme.text}>
            ETH
          </Text>
          <SampleChainLogo />
        </RowFit>
      </td>
      <td style={{ textAlign: 'right' }}>
        <Text fontSize="12px" color={score && score < 50 ? theme.red : theme.primary}>
          {score || 80}
          <Text as="span" fontSize="10px" color={theme.subText}>
            /100
          </Text>
        </Text>
      </td>
      <td style={{ textAlign: 'right' }}>
        <RowFit>
          <Text fontSize="12px" color={theme.text}>
            $0.000000004234
          </Text>
        </RowFit>
      </td>
      <td style={{ textAlign: 'right' }}>
        <Text fontSize="12px" color={theme.primary}>
          +20%
        </Text>
      </td>
    </DropdownItem>
  )

  const DropdownContent = () => (
    <>
      <DropdownSection>
        <colgroup>
          <col style={{ width: 'auto' }} />
          <col style={{ width: '100px', minWidth: 'auto' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '40px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>
              <RowFit color={theme.subText} gap="4px">
                <History />
                <Text fontSize="12px">Search History</Text>
              </RowFit>
            </th>
            <th style={{ textAlign: 'right' }}>KyberScore</th>
            <th style={{ textAlign: 'right' }}>Price</th>
            <th style={{ textAlign: 'right' }}>24H</th>
          </tr>
        </thead>
        <tbody>
          <SampleItem />
          <SampleItem />
          <SampleItem />
        </tbody>
      </DropdownSection>
      <DropdownSection>
        <colgroup>
          <col style={{ width: 'auto' }} />
          <col style={{ width: '100px', minWidth: 'auto' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '40px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>
              <RowFit color={theme.subText} gap="4px">
                <History />
                <Text fontSize="12px">Search History</Text>
              </RowFit>
            </th>
            <th style={{ textAlign: 'right' }}>KyberScore</th>
            <th style={{ textAlign: 'right' }}>Price</th>
            <th style={{ textAlign: 'right' }}>24H</th>
          </tr>
        </thead>
        <tbody>
          <SampleItem />
          <SampleItem />
          <SampleItem />
        </tbody>
      </DropdownSection>
      <DropdownSection>
        <colgroup>
          <col style={{ width: 'auto' }} />
          <col style={{ width: '100px', minWidth: 'auto' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '40px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>
              <RowFit color={theme.subText} gap="4px">
                <History />
                <Text fontSize="12px">Search History</Text>
              </RowFit>
            </th>
            <th style={{ textAlign: 'right' }}>KyberScore</th>
            <th style={{ textAlign: 'right' }}>Price</th>
            <th style={{ textAlign: 'right' }}>24H</th>
          </tr>
        </thead>
        <tbody>
          <SampleItem score={20} />
          <SampleItem score={20} />
          <SampleItem score={20} />
        </tbody>
      </DropdownSection>
    </>
  )

  if (!above768) {
    return (
      <MobileWrapper expanded={expanded} onClick={() => setExpanded(true)}>
        <Row padding="10px" gap="4px">
          <SearchIcon color={expanded ? theme.border : theme.subText} size={16} />
          {expanded && (
            <>
              <Input
                type="text"
                placeholder={expanded ? t`Search by token name or contract address` : t`Search`}
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                }}
                expanded={expanded}
              />
              <ButtonEmpty onClick={handleXClick} style={{ padding: '2px 4px', width: 'max-content' }}>
                <X color={theme.subText} size={14} style={{ minWidth: '14px' }} />
              </ButtonEmpty>
            </>
          )}
        </Row>
        <Column>
          <DropdownContent />
        </Column>
      </MobileWrapper>
    )
  }
  return (
    <>
      <Wrapper ref={wrapperRef} onClick={() => inputRef.current?.focus()} expanded={expanded}>
        {above768 && (
          <Input
            type="text"
            placeholder={t`Search by token name or contract address`}
            value={search}
            onChange={e => {
              setSearch(e.target.value)
            }}
            ref={inputRef}
          />
        )}
        <RowFit style={{ zIndex: 2 }}>
          {search && (
            <ButtonEmpty onClick={handleXClick} style={{ padding: '2px 4px', width: 'max-content' }}>
              <X color={theme.subText} size={14} style={{ minWidth: '14px' }} />
            </ButtonEmpty>
          )}
          <RowFit fontSize="14px" lineHeight="20px" fontWeight={500} gap="4px">
            <Icon id="search" size={24} />
            <Trans>Ape Smart!</Trans>
          </RowFit>
        </RowFit>
        <DropdownWrapper expanded={expanded} ref={dropdownRef} height={dropdownRef.current?.scrollHeight}>
          <DropdownContent />
          {expanded && <AnimationOnFocus />}
        </DropdownWrapper>
      </Wrapper>
    </>
  )
}

export default React.memo(SearchWithDropdown)