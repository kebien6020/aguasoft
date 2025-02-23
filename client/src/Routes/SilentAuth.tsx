// This view will be loaded inside an invisible iframe and is expected
// to post the message back to the parent window

const SilentAuth = () => {
  const hash = window.location.hash
  window.parent.postMessage(hash, '*')

  return <p>Error: Esta página debería ser invisible</p>
}

export default SilentAuth
