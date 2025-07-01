import { useState, useEffect } from "react"
import { useDebouncedCallback, isChrome } from "../shared"

const languageOptions = ["en", "de", "fr"]

export default function TranslatorDemo() {
    const [input, setInput] = useState("")
    const [inputLanguage, setInputLanguage] = useState("en")
    const [output, setOutput] = useState("")
    const [outputLanguage, setOutputLanguage] = useState("de")
    const [isTranslating, setIsTranslating] = useState(false)
    const [modelDownloadProcess, setModelDownloadProcess] = useState(100)
    const [showChromeWarning, setShowChromeWarning] = useState(false)

    useEffect(() => {
        if (!isChrome()) {
            setShowChromeWarning(true)
        }
    }, [])

    const debouncedTranslate = useDebouncedCallback((value: string) => {
        doTranslate(value)
    }, 500)

    const doTranslate = async (
        text?: string,
        sourceLanguage = inputLanguage,
        targetLanguage = outputLanguage
    ) => {
        if (isTranslating) return
        setIsTranslating(true)
        try {
            if (!("Translator" in self)) {
                alert(
                    "Dein Browser unterstützt diese API nicht. Probiere die neueste Version von Chrome."
                )
                return
            }

            // @ts-expect-error
            const translator = await Translator.create({
                sourceLanguage,
                targetLanguage,
                monitor(m: any) {
                    m.addEventListener("downloadprogress", (e: any) => {
                        setModelDownloadProcess(e.loaded * 100)
                        console.log(`Downloaded ${e.loaded * 100}%`)
                    })
                }
            })

            const result = await translator.translate(text ?? input)
            console.log(result)
            setOutput(result)
        } finally {
            setIsTranslating(false)
        }
    }

    const handleInputChange = ({
        target
    }: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = target.value
        setInput(value)
        setOutput("")
        if (!value) return
        debouncedTranslate(value)
    }

    return (
        <>
            <h2 className="mt-4 mb-3">Translator</h2>

            {showChromeWarning && (
                <div className="alert alert-warning mb-3" role="alert">
                    <strong>Achtung:</strong> Diese Funktion funktioniert nur in
                    Google Chrome. Du verwendest derzeit einen anderen Browser.
                    Bitte lade Google Chrome herunter, um die AI-APIs zu nutzen.
                </div>
            )}

            <p>
                The Language Detector and Translator APIs work on desktop only
                in Chrome.
            </p>

            {modelDownloadProcess < 100 && (
                <div
                    className={"progress mb-3"}
                    role="progressbar"
                    aria-label="Translate model download"
                    aria-valuenow={modelDownloadProcess}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <div
                        className="progress-bar"
                        style={{ width: `${modelDownloadProcess}%` }}
                    >
                        {modelDownloadProcess}%
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col-md">
                    <div className="d-flex gap-1 mb-1">
                        {languageOptions.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={`btn blue-btn-plain-secondary ${
                                    inputLanguage === option ? "active" : ""
                                }`}
                                aria-current={inputLanguage === option}
                                onClick={() => {
                                    setInputLanguage(option)
                                    doTranslate(input, option)
                                }}
                                role="checkbox"
                                disabled={showChromeWarning}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    <div className="form-floating mb-3">
                        <textarea
                            className="form-control"
                            placeholder="Enter your text here"
                            id="translateInput"
                            style={{ height: "100px" }}
                            onChange={handleInputChange}
                            value={input}
                            disabled={showChromeWarning}
                        ></textarea>
                        <label htmlFor="translateInput">
                            Enter your text here
                        </label>
                    </div>
                </div>
                <div className="col-md">
                    <div className="d-flex gap-1 mb-1">
                        {languageOptions.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={`btn blue-btn-plain-secondary ${
                                    outputLanguage === option ? "active" : ""
                                }`}
                                aria-current={outputLanguage === option}
                                onClick={() => {
                                    setOutputLanguage(option)
                                    doTranslate(input, undefined, option)
                                }}
                                role="checkbox"
                                disabled={showChromeWarning}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    <div aria-live="polite">
                        {output || (
                            <span className="text-secondary" aria-hidden="true">
                                Output will appear here.
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
