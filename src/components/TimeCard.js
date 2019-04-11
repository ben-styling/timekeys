//todo: extract logic from here, and SIMPLIFY!!!

import React, { useState } from 'react'
import ContentEditable from 'react-contenteditable'
// import TimeLogger from './TimeLogger'
import useInterval from '../hooks/useInterval'
import SquareButton from '../components/SquareButton'

function TimeCard({timer, provided, startTimer, stopTimer, commitTimer}) {
    const [clock, setClock] = useState(timer.elapsedTime)

    useInterval(() => {
        const newClock = clock + 1
        //Commit time every 10 minutes
        if((newClock) % 600 === 0) {
            commitTimer({
                id: timer.id,
                elapsedTime: newClock
            })
        }
        setClock(newClock)
    }, [timer.running ? 1000 : null, () => {
        return setClock(countingSeconds => {
            commitTimer({
                id: timer.id,
                elapsedTime: countingSeconds
            })
            return countingSeconds
        })
    }])

    const handleStartTimer = () => {
        startTimer({
            id: timer.id,
            startedTime: Date.now()
        })
    }
    const handleStopTimer = () => {
        stopTimer({
            id: timer.id
        })
    }


    return (
        <div className={`time-card ${timer.running && 'time-card--active'}`} {...provided.dragHandleProps}>
            <h3>
                {timer.task.content}
            </h3>
            <div className="time-actions">
            {timer.running && (
                <SquareButton
                    icon="pause"
                    className="time-button time-button--stop"
                    title="Stop timer"
                    clickHandler={handleStopTimer}
                />
            )}
            {!timer.running && (
                <SquareButton
                    icon="play"
                    className="time-button"
                    title="Start timer"
                    clickHandler={handleStartTimer}
                />
            )}
            <div className="time-total">
                {secondsToHMS(clock).hours}:{secondsToHMS(clock).minutes}:
                {secondsToHMS(clock).seconds}
            </div>

                <SquareButton
                    icon="cog"
                    disabled={!timer.elapsedTime}
                    className="time-button"
                    title="Share with TeamWork (Log time)"
                    style={{ marginLeft: 'auto' }}
                    // clickHandler={() => logTimer(timerName)}
                />
            </div>
            <div className="time-actions">

                {/* <SquareButton
                    icon="trash"
                    disabled={!timer.elapsedTime}
                    className="time-button"
                    title="Delete saved time"
                    // clickHandler={() => resetTimer(timerName)}
                /> */}

                
            </div>
        </div>
    )

    // const { logTimer, editTimerDescription } = functions
    // const secondsElapsed = totalTime(data.entries)
    // const timeExists = secondsElapsed > 0

    // const [countingSeconds, setcountingSeconds] = useState(0)

    // const editDescription = event => {
    //     editTimerDescription(timerName, event.target.value)
    // }

    // const existingTime = totalTime(data.entries) + countingSeconds

    // useInterval(() => {
    //     setcountingSeconds(countingSeconds => countingSeconds + 1)
    // }, [running ? 1000 : null, () => setcountingSeconds(0)])

    // const startTimer = timerName => {
    //     functions.startTimer(timerName)
    // }
    // const stopTimer = timerName => {
    //     functions.stopTimer(timerName)
    //     setcountingSeconds(0)
    // }
    // const resetTimer = timerName => {
    //     functions.resetTimer(timerName)
    //     setcountingSeconds(0)
    // }

    // return (
    //     <div className={`time-card ${running && 'time-card--active'}`}>
    //         <ContentEditable
    //             className="time-description"
    //             html={data.description} // innerHTML of the editable div
    //             disabled={false} // use true to disable edition
    //             onChange={editDescription} // handle innerHTML change
    //         />

    //         <div className="time-actions">
    //             <SquareButton
    //                 icon="trash"
    //                 disabled={!timeExists}
    //                 className="time-button"
    //                 title="Delete saved time"
    //                 clickHandler={() => resetTimer(timerName)}
    //             />

    //             <SquareButton
    //                 icon="cog"
    //                 disabled={!timeExists || !account}
    //                 className="time-button"
    //                 title="Share with TeamWork (Log time)"
    //                 clickHandler={() => logTimer(timerName)}
    //             />

    //             <div className="time-total">
    //                 {secondsToHMS(existingTime).hours}:{secondsToHMS(existingTime).minutes}:
    //                 {secondsToHMS(existingTime).seconds}
    //             </div>

    //             {running && (
    //                 <SquareButton
    //                     icon="pause"
    //                     className="time-button time-button--stop"
    //                     title="Stop timer"
    //                     clickHandler={() => stopTimer(timerName)}
    //                 />
    //             )}
    //             {!running && (
    //                 <SquareButton
    //                     icon="play"
    //                     className="time-button"
    //                     title="Start timer"
    //                     clickHandler={() => startTimer(timerName)}
    //                 />
    //             )}
    //         </div>
    //     </div>
    // )
}

export default TimeCard

const totalTime = entries => {
    return entries.reduce((acc, curr) => {
        if (curr.end) {
            acc = acc + (curr.end / 1000 - curr.start / 1000)
        }
        return Math.round(acc)
    }, 0)
}

function secondsToHMS(seconds) {
    const pad = n => (n < 10 ? '0' : '') + n
    return {
        hours: pad((seconds / 3600) | 0),
        minutes: pad(((seconds % 3600) / 60) | 0),
        seconds: pad(seconds % 60 | 0)
    }
}
