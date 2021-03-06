import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Modal from 'react-modal'

import uuidv4 from 'uuid'

import Styled from 'styled-components/macro'

import getAllProjects from 'api/getAllProjects'
import getTasks from 'api/getTasks'

import Select from 'react-select'

import ResizableTextarea from 'components/ResizableTextarea'

import {
    ModalContainer,
    ModalTitle,
    ModalContent,
    ButtonContainer,
    ActionButton,
    selectStyles,
    Loader,
    Label,
    FormGroup
} from 'components/styles/modal'

Modal.setAppElement('#root')

const TimerModalContainer = ({ children, modalOpen, modalType, timer, closeTimerModal, submitTimerModal }) => {
    const projects = useSelector(state => state.projects)
    const timers = useSelector(state => state.timers)
    const user = useSelector(state => state.user)
    const defaultProject =
        projects[
            Object.keys(projects).filter(key => {
                return projects[key].timerIds.includes(timer.id)
            })
        ]

    useEffect(() => {
        handleLoadProjects()
        return () => {
            setSelectedProject(false)
            setSelectedTask(false)
            setTaskOptions([])
        }
    }, [])

    const [loadingProjects, setLoadingProjects] = useState(false)
    const [projectOptions, setProjectOptions] = useState([])
    const [selectedProject, setSelectedProject] = useState(defaultProject)

    const [loadingTasks, setLoadingTasks] = useState(false)
    const [taskOptions, setTaskOptions] = useState([])
    const [selectedTask, setSelectedTask] = useState(timer.task)
    const [description, setDescription] = useState(timer.description || '')

    const { hours, minutes } = secondsToHMS(timer.elapsedTime)
    const [time, setTime] = useState({
        hours: hours | 0,
        minutes: minutes | 0
    })

    const [isBillable, setIsBillable] = useState(timer.settings.isBillable || false)
    const [keepTimer, setKeepTimer] = useState(timer.settings.keepTimer || false)
    const [markAsComplete, setMarkAsComplete] = useState(timer.settings.markAsComplete || false)

    const handleLoadProjects = async () => {
        //2do: set current projects in memory as the available options first.
        setLoadingProjects(true)
        const result = await getAllProjects()
        const options = result.projects
        setProjectOptions(options)
        // setSelectedProject(project)
        setLoadingProjects(false)
        handleLoadTasks(selectedProject)
    }
    const handleSelectProject = project => {
        setSelectedProject(project)
        handleLoadTasks(project, true)
    }

    const handleLoadTasks = async (project, dirtyProjects = false) => {
        setLoadingTasks(true)
        const result = await getTasks({ projectId: project.id })
        const unassignedTask = { content: 'Unassigned task', id: uuidv4(), unassignedTask: true }
        const options = result['todo-items'].filter(current =>
            Object.keys(timers).reduce((acc, curr) => {
                if (
                    (!acc && timers[curr].task && timers[curr].task.id !== current.id) ||
                    (!acc && timer.task.id === current.id)
                ) {
                    acc = true
                }
                return acc
            }, true)
        )
        setTaskOptions([unassignedTask, ...options])
        if (dirtyProjects) {
            setSelectedTask(unassignedTask)
        } else {
            // setSelectedTask(
            //     options.find(option => {
            //         return option.id === timer.task.id
            //     }) || timer.task
            // )
        }
        setLoadingTasks(false)
    }
    const handleSelectTask = task => {
        setSelectedTask(task)
    }

    const handleTimeOnChange = e => {
        if (
            (e && e.target.name) 
            && (Number(e.target.value) || Number(e.target.value) === 0 || e.target.value === '')
        ) {
            setTime({
                ...time,
                [e.target.name]: e.target.value
            })
        }
    }

    const handleCloseModal = () => {
        setSelectedProject(false)
        closeTimerModal()
    }

    const handleSubmitModal = () => {
        const options = {
            selectedProject: selectedProject,
            selectedTask: selectedTask,
            description: description,
            elapsedTime: HoursAndMinutesToSeconds(time),
            tags: tags,
            settings: {
                isBillable: isBillable,
                keepTimer: keepTimer,
                markAsComplete: markAsComplete
            }
        }

        submitTimerModal({ timerId: timer.id, options })

        setSelectedProject(false)
        setSelectedTask(false)
        closeTimerModal()
    }

    const [tags, setTags] = useState(timer.tags ? timer.tags : [])

    const toggleTag = tag => {
        setTags(existingTags => {
            if (existingTags.find(t => t.id === tag.id)) {
                return existingTags.filter(t => t.id !== tag.id)
            }
            return existingTags.concat(tag)
        })
    }

    return (
        <ModalOuterContainer
            isOpen={modalOpen}
            onRequestClose={handleCloseModal}
            style={{ overlay: { backgroundColor: 'hsla(0, 0%, 0%, 0.33)' } }}
        >
            <ModalTitle>
                {modalType === 'edit' && 'Edit timer'}
                {modalType === 'log' && 'Log timer'}
            </ModalTitle>
            <ModalContent>
                <FormGroup>
                    <Label>Select Project {loadingProjects ? <Loader title="Loading..." /> : null}</Label>
                    <Select
                        styles={selectStyles}
                        getOptionLabel={option => option.name}
                        getOptionValue={option => option.id}
                        options={projectOptions}
                        onChange={handleSelectProject}
                        value={selectedProject}
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Select Task {loadingTasks ? <Loader title="Loading..." /> : null}</Label>
                    {selectedProject ? (
                        <Select
                            styles={selectStyles}
                            getOptionLabel={option => option.content}
                            getOptionValue={option => option.id}
                            options={taskOptions}
                            onChange={handleSelectTask}
                            value={selectedTask}
                        />
                    ) : (
                        <Select styles={selectStyles} isDisabled={true} />
                    )}
                </FormGroup>

                <FormGroup>
                    <Label>Timer description</Label>
                    <DescriptionTextarea isEmpty={!description} value={description} setValue={setDescription} submit={handleSubmitModal} />
                </FormGroup>

                <TimeInputContainer>
                    <TimeInputGroup>
                        <Label>Hours</Label>
                        <TimeInput type="text" value={time.hours} onChange={handleTimeOnChange} name="hours" />
                    </TimeInputGroup>
                    <TimeInputGroup>
                        <Label>Minutes</Label>
                        <TimeInput type="text" value={time.minutes} onChange={handleTimeOnChange} name="minutes" />
                    </TimeInputGroup>
                </TimeInputContainer>

                <Label>Settings</Label>
                <TimeInputContainer>
                    <CheckboxInput htmlFor={`is-billable-${timer.id}`}>
                        <input
                            type="checkbox"
                            checked={isBillable}
                            value="isBillable"
                            name="isBillable"
                            onChange={() => setIsBillable(value => !value)}
                            id={`is-billable-${timer.id}`}
                        />
                        <CheckboxInputHelper />
                        <div>Billable?</div>
                    </CheckboxInput>
                    <CheckboxInput htmlFor={`keep-timer-${timer.id}`}>
                        <input
                            id={`keep-timer-${timer.id}`}
                            type="checkbox"
                            checked={keepTimer}
                            value="keepTimer"
                            name="keepTimer"
                            onChange={() => setKeepTimer(value => !value)}
                        />
                        <CheckboxInputHelper />
                        <div>Keep timer?</div>
                    </CheckboxInput>
                    {!timer.task.unassignedTask && (
                        <CheckboxInput htmlFor={`mark-as-complete-${timer.id}`}>
                            <input
                                id={`mark-as-complete-${timer.id}`}
                                type="checkbox"
                                checked={markAsComplete}
                                value="markAsComplete"
                                name="markAsComplete"
                                onChange={() => setMarkAsComplete(value => !value)}
                            />
                            <CheckboxInputHelper />
                            <div>Mark as complete?</div>
                        </CheckboxInput>
                    )}
                </TimeInputContainer>
                {user.tags && user.tags.length > 0 && (
                    <>
                        <Label>Tags</Label>
                        <TimeInputContainer>
                            {user.tags.map(tag => (
                                <CheckboxInput htmlFor={`tag-${tag.id}`} key={`tag-${tag.id}`}>
                                    <input
                                        id={`tag-${tag.id}`}
                                        type="checkbox"
                                        checked={tags.find(t => t.id === tag.id) ? true : false}
                                        value={`tag-${tag.id}`}
                                        name={`tag-${tag.id}`}
                                        onChange={() => toggleTag(tag)}
                                    />
                                    <CheckboxInputHelper />
                                    <div>{tag.name}</div>
                                </CheckboxInput>
                            ))}
                        </TimeInputContainer>
                    </>
                )}
            </ModalContent>
            <ButtonContainer>
                <ActionButton onClick={handleCloseModal}>Cancel</ActionButton>
                <ActionButton onClick={handleSubmitModal}>
                    {modalType === 'edit' && 'Edit timer'}
                    {modalType === 'log' && 'Log timer'}
                </ActionButton>
            </ButtonContainer>
        </ModalOuterContainer>
    )
}

export default TimerModalContainer

const HoursAndMinutesToSeconds = ({ hours, minutes }) => {
    const hourSeconds = hours * 3600
    const minuteSeconds = minutes * 60
    return hourSeconds + minuteSeconds
}
function secondsToHMS(seconds) {
    return {
        hours: (seconds / 3600) | 0,
        minutes: ((seconds % 3600) / 60) | 0,
        seconds: seconds % 60 | 0
    }
}

const ModalOuterContainer = Styled(ModalContainer)`
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    width: 440px;
    max-width: 100%;
    margin: auto;
    border: none;
    background: ${props => props.theme.backgroundColor};;
    overflow: auto;
    border-radius: 10px;
    overflow: hidden;
    outline: none;
    display: flex;
    flex-direction: column;
    min-height: 550px;

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
    border-bottom: 1px solid ${props => props.theme.foregroundColor};
    &:focus {
        outline: none;
        border-bottom: 1px solid ${props => props.theme.primaryAccentColor};
    }
	&::placeholder {
		color: ${props => props.theme.textColor}a1;
    }
    // background-color: ${props => props.theme.backgroundAugment2};
    padding: 9px 9px;
    border: 1px solid ${props => props.theme.primaryAccentColor};
`

const TimeInputContainer = Styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
`
const TimeInputGroup = Styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-right: 24px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    ${props =>
        props.horizontal &&
        `
        align-items: center;
        flex-direction: row;
        ${Label} {
            margin-bottom: 0;
        }
        ${CheckboxInput} {
            margin-right: 12px;
        }
    `}
`
const TimeInput = Styled.input`
    width: 70px;
    background-color: ${props => props.theme.backgroundColor};
    border: none;
    box-shadow: none;
    line-height: 18px;
    height: 18px;
    border: 1px solid ${props => props.theme.primaryAccentColor};
    color: ${props => props.theme.textColor};
    height: 35px;
    padding: 4px 12px;
    text-align: center;
`

const CheckboxInputHelper = Styled.div`
    width: 22px;
    height: 22px;
    border: 1px solid ${props => props.theme.primaryAccentColor};
    // background-color: ${props => props.theme.backgroundAugment2};
    margin-right: 8px;
    position: relative;
    flex-shrink: 0;
    &::before {
        content: "";
        position: absolute;
        top: 0; left: 0; right:0; bottom: 0;
        width: 40%;
        height: 25%;
        border-left: 2px solid ${props => props.theme.primaryAccentColor};
        border-bottom: 2px solid ${props => props.theme.primaryAccentColor};
        margin: auto;
        transform: translateY(-21%) translateX(6%) skew(-10deg, 0deg) rotate(-54deg);
        display: none;
    }
`

const CheckboxInput = Styled.label`
    margin-right: 16px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    color: ${props => props.theme.textColor};
    font-size: 14px;
    &:hover {
        input:not(:checked) {
            ~ ${CheckboxInputHelper} {
                &::before {
                    display: block;
                    opacity: 0.4;
                }
            }
        }
    }
    input {
        display: none;
        &:checked {
            ~ ${CheckboxInputHelper} {
                &::before {
                    display: block;
                }
            }
        }
    }
`
