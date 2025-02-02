import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
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

  const head = renderToString(
    <>
      <title>{TITLE}</title>
      <base href={BASE ?? ''} />
    </>
  )
  const html = renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  return { head, html }
}
