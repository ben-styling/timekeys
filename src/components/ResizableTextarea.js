import React, { useState, useEffect, useRef } from 'react'
const ResizableTextarea = (props) => {
    const { value, setValue, onBlur, minRows = 1, maxRows = 15, className, submit } = props
    const [rows, setRows] = useState(1)
    const textarea = useRef(null)
    const handleChange = event => {
        const target = event.target ? event.target : event.current
        const lineHeightInPx = getComputedStyle(target)['line-height']
        const textareaLineHeight = parseInt(lineHeightInPx, 10)

        const previousRows = target.rows
        target.rows = minRows

        const currentRows = ~~(target.scrollHeight / textareaLineHeight)

        if (currentRows === previousRows) {
            target.rows = currentRows
        }

        if (currentRows >= maxRows) {
            target.rows = maxRows
            target.scrollTop = target.scrollHeight
        }

        setValue(target.value)
        setRows(currentRows < maxRows ? currentRows : maxRows)
    }
    const handleOnBlur = event => {
        if (onBlur) {
            onBlur(event)
        }
    }

    const handleKeyPress = (e) => {
        if(e.key === 'Enter' && e.shiftKey) {
            if(typeof submit === 'function') {
                submit()
            }
        }
    }

    useEffect(() => {
        handleChange(textarea)
    }, [value])

    return (
        <textarea
            ref={textarea}
            className={className}
            rows={rows}
            value={value}
            placeholder={'description...'}
            onChange={handleChange}
            onBlur={handleOnBlur}
            onKeyPress={(e) => handleKeyPress(e)}
        />
    )
}

export default ResizableTextarea
