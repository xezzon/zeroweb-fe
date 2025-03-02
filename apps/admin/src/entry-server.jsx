import { StrictMode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import App from './App'

/**
 * @param {string} _url
 */
export function render(_url) {
  const {
    TITLE,
    BASE,
    ZEROWEB_SERVICE_ADMIN,
    ZEROWEB_SERVICE_OPEN,
  } = process.env
  /**
   * @type {RuntimeEnvironmentVariable} 
   */
  const runtimeEnv = {
    ZEROWEB_SERVICE_ADMIN,
    ZEROWEB_SERVICE_OPEN,
  }

  const head = renderToString(
    <>
      <title>{TITLE}</title>
      <base href={BASE ?? ''} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__ENV__ = ${JSON.stringify(runtimeEnv)}`
        }}
      />
    </>
  )
  const html = renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  return { head, html }
}
