import { useState } from 'react'
import './App.css'
import CodeDisplay from './CodeDisplay'

type ApiResult<T = any> = {
  success: boolean
  data?: T
  message?: string
}

type Change = {
  lineStart: number
  lineEnd: number
  charStart: number
  charEnd: number
  oldCode: string
  newCode: string
  explanation: string
  comment: string
}

function App() {
  // hello world snippets for each language
  const helloSnippets: Record<string, string> = {
    python: "print('Hello, world!')\n",
    c: '#include <stdio.h>\nint main() {\n  printf("Hello, world!\\n");\n  return 0;\n}\n',
    java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, world!");\n  }\n}\n',
    cpp: '#include <iostream>\nint main() {\n  std::cout << "Hello, world!\\n\";\n  return 0;\n}\n',
  }

  const [code, setCode] = useState<string>(helloSnippets['python'])
  const [corrected, setCorrected] = useState<string>('')
  const [changes, setChanges] = useState<Change[]>([])
  const [language, setLanguage] = useState<string>('python')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isExplanation, setIsExplanation] = useState<boolean>(false)

  // terminal state
  const [terminalOutput, setTerminalOutput] = useState<string>('')
  const [terminalError, setTerminalError] = useState<string | null>(null)
  const [running, setRunning] = useState<boolean>(false)

  const postJSON = async (url: string, body: any) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  // change language and update code to the language's hello world if the editor is empty
  // or currently contains the previous hello-world snippet (so we don't overwrite user edits)
  const handleLanguageChange = (newLang: string) => {
    const currentIsHello =
      code.trim() === '' ||
      code.trim() === (helloSnippets[language] || '').trim()
    setLanguage(newLang)
    if (currentIsHello) {
      setCode(helloSnippets[newLang] ?? '')
    }
  }

  const handleFix = async () => {
    setLoading(true)
    setError(null)
    setIsExplanation(false)
    try {
      const res: ApiResult<{ fixedCode: string; explanation?: string; changes?: Change[] }> =
        await postJSON('/api/compiler/fix', { code, language, issue: '' })
      
      if (!res.success) {
        setError(res.message || 'AI fix failed')
      } else {
        setCorrected(res.data?.fixedCode ?? '')
        setChanges(res.data?.changes || [])
        setIsExplanation(false)
      }
    } catch (e: any) {
      console.error('❌ [DEBUG] Error in handleFix:', e)
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  // run / compile the code and display output in the terminal area
  const handleRun = async () => {
    setRunning(true)
    setTerminalError(null)
    setTerminalOutput('') // clear previous output
    try {
      const res: ApiResult<{ output?: string; error?: string; executionTime?: number }> =
        await postJSON('/api/compiler/compile', { code, language })
      if (!res.success) {
        setTerminalError(res.message || 'Run failed')
      } else {
        const out = res.data?.output ?? ''
        const err = res.data?.error ?? ''
        const time = res.data?.executionTime
        let combined = ''
        if (out) combined += out
        if (err) combined += (combined ? '\n\n' : '') + 'stderr:\n' + err
        if (time !== undefined) combined += (combined ? '\n\n' : '') + `Execution time: ${time}ms`
        setTerminalOutput(combined || '(no output)')
      }
    } catch (e: any) {
      setTerminalError(e?.message ?? String(e))
    } finally {
      setRunning(false)
    }
  }

  // copy corrected text to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(corrected)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to copy')
    }
  }

  // clear corrected / AI output
  const handleClear = () => {
    setCorrected('')
    setChanges([])
    setError(null)
    setIsExplanation(false)
  }

  // ask backend AI to explain the corrected code (or input code if corrected empty)
  const handleExplain = async () => {
    setLoading(true)
    setError(null)
    try {
      const payloadCode = corrected.trim() ? corrected : code
      const res: ApiResult<{ explanation: string }> =
        await postJSON('/api/ai/explain', { code: payloadCode, language })
      if (!res.success) {
        setError(res.message || 'Explain failed')
      } else {
        // place explanation into the corrected/AI output area
        setCorrected(res.data?.explanation ?? '')
        setChanges([]) // Clear changes when showing explanation
        setIsExplanation(true)
      }
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  const clearTerminal = () => {
    setTerminalOutput('')
    setTerminalError(null)
  }

  // updates code state
  const handleOpenFile = async () => {
    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: [{ description: 'Code files', accept: { 'text/plain': ['.txt', '.py', '.c', '.cpp', '.java'] } }],
      multiple: false
    });
    const file = await fileHandle.getFile();
    const text = await file.text();
    setCode(text);
  }

  // downloads what is currently in code
  const handleSaveFile = async () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div id="root">
      <header className="header">
        <h1>AI Compiler</h1>
        <div className="controls">
          <label>
            Language:&nbsp;
            <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
              <option value="python">Python</option>
              <option value="c">C</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              {/* add more languages here as backend support is added */}
            </select>
          </label>

          <button onClick={handleFix} disabled={loading} className="action">
            {loading ? 'Working…' : 'Fix (AI)'}
          </button>

          <button onClick={handleRun} disabled={running} className="action" title="Run code and show output in terminal">
            {running ? 'Running…' : 'Run'}
          </button>
        </div>
      </header>

      <main className="app-grid">
        <section className="panel left">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Your code</h2>
            <div className="right-controls">
              <button className="action" onClick={() => setCode('')}>New File</button>
              <button className="action" onClick={handleOpenFile}>Open</button>
              <button className="action" onClick={handleSaveFile}>Save</button>
            </div>
          </div>
          <textarea
            className="editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </section>

        <section className="panel right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Corrected / AI output</h2>
            <div className="right-controls">
              <button className="action" onClick={handleCopy} disabled={!corrected}>Copy</button>
              <button className="action" onClick={handleClear}>Clear</button>
              <button className="action" onClick={handleExplain} disabled={loading}>
                {loading ? 'Thinking…' : 'Explain code'}
              </button>
            </div>
          </div>

          {error ? (
            <pre className="error">{error}</pre>
          ) : corrected && changes.length > 0 && !isExplanation ? (
            <CodeDisplay code={corrected} changes={changes} />
          ) : (
            <textarea
              className="corrected"
              value={corrected}
              readOnly
              spellCheck={false}
            />
          )}
        </section>
      </main>

      {/* terminal area at the bottom, full width */}
      <footer className="terminal-panel">
        <div className="terminal-header">
          <div>Terminal</div>
          <div className="terminal-actions">
            <button className="control-btn" onClick={() => navigator.clipboard.writeText(terminalOutput)} disabled={!terminalOutput}>Copy</button>
            <button className="control-btn" onClick={clearTerminal} disabled={!terminalOutput && !terminalError}>Clear</button>
          </div>
        </div>

        <div className="terminal-output" role="log" aria-live="polite">
          {terminalError ? (
            <pre className="terminal-error">{terminalError}</pre>
          ) : (
            <pre className="terminal-text">{terminalOutput || '(no output)'}</pre>
          )}
        </div>
      </footer>
    </div>
  )
}

export default App