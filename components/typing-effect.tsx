"use client"
import { useState, useEffect, useCallback, useRef } from "react"

export interface TypingAction {
  type: "type" | "delete" | "pause" | "command" | "mistake"
  text?: string
  count?: number // For delete: number of chars. For mistake: how many chars of 'text' are the mistake
  duration?: number
  speed?: number
  clearPrevious?: boolean
}

interface TypingEffectProps {
  sequences: TypingAction[][] // Array of sequences
  loop?: boolean
  defaultTypingSpeed?: number
  defaultDeleteSpeed?: number
  cursorClassName?: string
  giveUpChance?: number // Chance from 0 to 1 (e.g., 0.09 for 9%)
}

export default function TypingEffect({
  sequences,
  loop = true,
  defaultTypingSpeed = 100,
  defaultDeleteSpeed = 60,
  cursorClassName = "animate-pulse text-foreground",
  giveUpChance = 0, // Default to 0, no giving up
}: TypingEffectProps) {
  const [currentText, setCurrentText] = useState("")
  const [currentSequence, setCurrentSequence] = useState<TypingAction[]>(sequences[0])
  const [actionIndex, setActionIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0) // For typing: current char in action.text. For deleting: how many deleted so far.
  const [isCommandActive, setIsCommandActive] = useState(false)
  const [currentSegmentClass, setCurrentSegmentClass] = useState("text-accent-gray")
  const [hasGivenUp, setHasGivenUp] = useState(false)

  const actionIndexRef = useRef(actionIndex)
  const charIndexRef = useRef(charIndex)
  const currentTextRef = useRef(currentText)
  const currentSequenceRef = useRef(currentSequence)
  const loopRef = useRef(loop) // To control loop internally if "give up" happens

  useEffect(() => {
    loopRef.current = loop
  }, [loop])

  useEffect(() => {
    // Select a random sequence on mount
    const randomIndex = Math.floor(Math.random() * sequences.length)
    setCurrentSequence(sequences[randomIndex])
    // Determine if we "give up" this time
    if (Math.random() < giveUpChance) {
      setHasGivenUp(true)
    }
  }, [sequences, giveUpChance]) // Rerun if sequences or chance changes

  useEffect(() => {
    actionIndexRef.current = actionIndex
    charIndexRef.current = charIndex
    currentTextRef.current = currentText
    currentSequenceRef.current = currentSequence
  }, [actionIndex, charIndex, currentText, currentSequence])

  const resetForLoop = useCallback(() => {
    setCurrentText("")
    setActionIndex(0)
    setCharIndex(0)
    setIsCommandActive(false)
    setCurrentSegmentClass("text-accent-gray")
    // Potentially re-select sequence and re-roll giveUpChance if desired for each loop
    // For now, it sticks with the initial choice for the session unless page reloads.
  }, [])

  useEffect(() => {
    if (hasGivenUp && actionIndex > 0) {
      // Allow at least one action if it gives up immediately
      // If hasGivenUp is true, stop processing and don't loop.
      // The cursor will still show if loopRef.current is true initially.
      // We can set loopRef.current = false here to hide cursor after giving up.
      loopRef.current = false
      return
    }

    const currentAction = currentSequenceRef.current[actionIndexRef.current]

    if (!currentAction) {
      if (loopRef.current && !hasGivenUp) {
        resetForLoop()
      }
      return
    }

    let timeoutId: NodeJS.Timeout
    let delay = 0

    const typeChar = () => {
      if (currentAction.text && charIndexRef.current < currentAction.text.length) {
        setCurrentText((prev) => prev + currentAction.text![charIndexRef.current])
        setCharIndex((prev) => prev + 1)
      } else {
        if (currentAction.type === "command") setIsCommandActive(false)
        setCurrentSegmentClass("text-accent-gray")
        setActionIndex((prev) => prev + 1)
        setCharIndex(0)
      }
    }

    const deleteChars = () => {
      // For 'delete', currentAction.count is the total to delete.
      // charIndexRef.current tracks how many have been deleted so far.
      if (charIndexRef.current < (currentAction.count || 0) && currentTextRef.current.length > 0) {
        setCurrentText((prev) => prev.slice(0, -1))
        setCharIndex((prev) => prev + 1) // Increment count of deleted chars
      } else {
        // Finished deleting
        setCurrentSegmentClass("text-accent-gray")
        setActionIndex((prev) => prev + 1)
        setCharIndex(0) // Reset for next action
      }
    }

    switch (currentAction.type) {
      case "type":
      case "command":
      case "mistake":
        if (charIndexRef.current === 0) {
          if (currentAction.clearPrevious) setCurrentText("")
          if (currentAction.type === "command") {
            setIsCommandActive(true)
            setCurrentSegmentClass("text-accent-green")
          } else if (currentAction.type === "mistake") {
            setCurrentSegmentClass("text-destructive")
          } else {
            setIsCommandActive(false)
            setCurrentSegmentClass("text-accent-gray")
          }
        }
        delay = currentAction.speed || (currentAction.type === "mistake" ? 80 : defaultTypingSpeed)
        timeoutId = setTimeout(typeChar, delay)
        break

      case "delete":
        delay = currentAction.speed || defaultDeleteSpeed
        timeoutId = setTimeout(deleteChars, delay)
        break

      case "pause":
        delay = currentAction.duration || 1000
        timeoutId = setTimeout(() => {
          setActionIndex((prev) => prev + 1)
          setCharIndex(0)
        }, delay)
        break
    }

    return () => clearTimeout(timeoutId)
  }, [actionIndex, charIndex, resetForLoop, defaultTypingSpeed, defaultDeleteSpeed, hasGivenUp, currentSequence]) // Added currentSequence

  const displayPrefix = isCommandActive ? <span className="text-primary normal-case">$ </span> : null
  // Show cursor if looping is intended (and not given up) OR if actions are still pending.
  const showCursor = (loopRef.current && !hasGivenUp) || actionIndex < currentSequence.length

  return (
    <span className={`font-mono ${currentSegmentClass}`}>
      {displayPrefix}
      {currentText}
      {showCursor && <span className={cursorClassName}>_</span>}
    </span>
  )
}
