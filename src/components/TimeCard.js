//todo: extract logic from here, and SIMPLIFY!!!

import React, { useRef } from 'react'

import Styled from 'styled-components/macro'
import { ReactComponent as PlayIcon } from 'assets/play.svg'
import { ReactComponent as PauseIcon } from 'assets/pause.svg'
import ResizableTextarea from 'components/ResizableTextarea'

import { ContextMenuTrigger } from 'react-contextmenu'
import TimerContextMenu from 'components/TimerContextMenu'

const TimeCard = props => {
    const { provided, timer, state, methods } = props

    const {
        handleStopTimer,
        handleStartTimer,
        setDescription,
        handleUpdateDescription,
        handleResetTimer,
        handleRemoveTimer,
        handleEditTimer,
        handleLogTimer,
        handleToggleTimerSettings
    } = methods
    const { clock, description } = state

    let contextTrigger = useRef(null)

    const toggleContextMenu = e => {
        if (contextTrigger) {
            contextTrigger.handleContextClick(e)
        }
    }
    return (
        <Container {...provided.draggableProps} ref={provided.innerRef} isRunning={timer.running}>
            <ContextMenuTrigger id={timer.id} ref={c => (contextTrigger = c)}>
                <TimerContainer {...provided.dragHandleProps}>
                    <TimerActions>
                        {timer.running ? (
                            <PauseButton onClick={handleStopTimer}>
                                <PauseIcon />
                            </PauseButton>
                        ) : (
                            <PlayButton onClick={handleStartTimer}>
                                <PlayIcon />
                            </PlayButton>
                        )}
                        <TimerClock>
                            {secondsToHMS(clock).hours}:{secondsToHMS(clock).minutes}:
                            <Seconds>{secondsToHMS(clock).seconds}</Seconds>
                        </TimerClock>
                    </TimerActions>
                    <TimerInformation>
                        {timer.task['project-id'] && <TimerTitle>{timer.task.content}</TimerTitle>}
                        <DescriptionTextarea
                            isEmpty={!description}
                            value={description}
                            setValue={setDescription}
                            onBlur={handleUpdateDescription}
                            isUnassigned={!timer.task['project-id']}
                        />
                    </TimerInformation>
                    <div>
                        <TimerMenuButton onClick={toggleContextMenu}>
                            <DottedMenu />
                        </TimerMenuButton>
                    </div>
                </TimerContainer>
            </ContextMenuTrigger>
            <TimerContextMenu
                timer={timer}
                handleLogTimer={handleLogTimer}
                handleEditTimer={handleEditTimer}
                handleResetTimer={handleResetTimer}
                handleToggleTimerSettings={handleToggleTimerSettings}
                handleRemoveTimer={handleRemoveTimer}
            />
        </Container>
    )
}


export default TimeCard


function secondsToHMS(seconds) {
    const pad = n => (n < 10 ? '0' : '') + n
    return {
        hours: pad((seconds / 3600) | 0),
        minutes: pad(((seconds % 3600) / 60) | 0),
        seconds: pad(seconds % 60 | 0)
    }
}


const Container = Styled.div`
    margin-bottom: 12px;
    font-weight: 400;
    width: 100%;

    ${props =>
        props.isRunning
            ? `
                background: transparent;
                box-shadow: inset 0 0 0px 2px ${props.theme.foregroundColor};
            `
            : `
                background-color: ${props.theme.foregroundColor};
    `}
    
`

const TimerContainer = Styled.div`
    padding: 12px 12px 8px;
    display: flex;
`
const TimerActions = Styled.div`
    margin-right: 12px;
`
const TimerClock = Styled.div`
    flex-shrink: 0;
    text-align: center;
    font-size: 14px;
`
const Seconds = Styled.div`
    display: inline;
`
const PlayButton = Styled.button`
    display: flex;
    width: 48px;
    height: 48px;
    border: 1px solid transparent;
    background-color: ${props => props.theme.foregroundColorLight};
    border-radius: 50%;
    padding-left: 10px;
    margin: 0 auto 14px;
    &:focus {
        border-color: ${props => props.theme.secondaryAccentColor};
    }
    &:hover {
        background-color: ${props => props.theme.secondaryAccentColor};
    }
    svg {
        margin: auto;
        fill: white;
    }
`
const PauseButton = Styled.button`
    display: flex;
    width: 48px;
    height: 48px;
    border: 1px solid transparent;
    background-color: ${props => props.theme.secondaryAccentColor};
    border-radius: 50%;
    margin: 0 auto 14px;
    &:focus {
        border-color: ${props => props.theme.secondaryAccentColor};
    }
    &:hover {
        background-color: ${props => props.theme.secondaryAccentColor};
    }
    svg {
        margin: auto;
    }
`

const TimerTitle = Styled.h3`
    font-weight: 300;
    font-size: 15px;
    min-height: 54px;
    display: flex;
    align-items: center;
    margin: 0;
    line-height: 20px;
    padding-bottom: 4px;
    padding-right: 16px;
`
const DescriptionTextarea = Styled(ResizableTextarea)`
    background: none;
    color: ${props => props.theme.textColor};
    width: 100%;
    box-sizing: border-box;
	border: none;
	border-radius: 0;
	resize: none;
	font-size: 14px;
	line-height: 18px;
	overflow: auto;
	height: auto;
	padding: 6px 1px 2px;
    border-bottom: 1px solid transparent;
    font-weight: 400;
    &:focus {
        outline: none;
        border-bottom: 1px solid #738FDF;
    }
	&::placeholder {
		color: ${props => props.theme.textColor}a1;
    }
    ${props =>
        props.isUnassigned
            ? `
        background-color: ${props.theme.backgroundAugment};
        padding: 5px 6px 4px;
        margin-top: 11px;
        margin-bottom: 11px;
        width: calc(100% - 10px);
    `
            : ``}
`
const TimerMenuButton = Styled.button`
    width: 20px;
    height: 32px;
    border: none;
    background: none;
    box-shadow: none;
    display: flex;
    align-items: center;
    border-radius: 5px;
    padding: 0;
    margin-top: 9px;
    &:hover {
        background-color: ${props => props.theme.foregroundColorLight};
    }
`
const DottedMenu = Styled.div`
    position: relative;
    width: 4px;
    height: 4px;
    background-color: ${props => props.theme.primaryAccentColor};
    border-radius: 50%;
    margin: auto;
    &::before,
    &::after {
        left: 0; right: 0;
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: inherit;
        border-radius: 50%;
    }
    &::before {
        top: -7px;
    }
    &::after {
        bottom: -7px;
    }
`
const TimerInformation = Styled.div`
    flex-grow: 1;
`

