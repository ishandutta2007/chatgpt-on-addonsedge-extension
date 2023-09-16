import { render } from 'preact'
import Switcher10 from '~/content-script/components/switcher10'
import '../base.css'
import { config } from './search-engine-configs'
import './styles.scss'

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        resolve(document.querySelector(selector))
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}

async function mountEnableButton(container: object, containerid: string) {
  container.className = 'chat-gpt-container'
  // #pane-side > div:nth-child(1) > div > div > div:nth-child(11) > div > div > div > div._8nE1Y > div.y_sn4 > div.Dvjym > span
  render(
    <Switcher10 buttonId={containerid} buttonSize="small" displayText="AutoReply" />,
    container,
  )
}

const siteRegex = new RegExp(Object.keys(config).join('|'))
let siteName
try {
  siteName = location.hostname.match(siteRegex)![0]
} catch (error) {
  siteName = location.pathname.match(siteRegex)![0]
}
const siteConfig = config[siteName]

console.log('siteConfig', siteConfig)

if (siteConfig.watchRouteChange) {
  siteConfig.watchRouteChange(run)
}

waitForElm(siteConfig.sidebarContainerQuery[0]).then((elm) => {
  console.log(siteConfig.sidebarContainerQuery[0], 'Element is ready')
  console.log('elm', elm)
  const chatlist = elm.querySelectorAll('[aria-label="Chat list"]')
  console.log('chatlist', chatlist)
  chatlist[0].childNodes.forEach(async function (chele, i) {
    console.log('%d: %s', i, chele.innerText)
    // const datespan = chele.querySelectorAll('div > div > div > div._8nE1Y > div.y_sn4 > div.Dvjym > span')
    const datespan = chele.querySelector('div span.aprpv14t')
    console.log(i, datespan)
    if (datespan) mountEnableButton(datespan, i + 1)
  })
})
