import { render } from 'preact'
import FileInput from '~/content-script/components/FileInput'
import '../base.css'
import './styles.scss'
import { config } from './website-configs'
// import { useMemo } from 'react';

let nextindex = 0
const SUMMARY_SELECTOR =
  'body > div > div.row.view-animate.ng-scope > history-tabs > div > div:nth-child(2) > div > history-tab:nth-child(3) > div > div > div > history-tabs > div > div.col-md-9 > div > history-tab:nth-child({x}) > div > div > editable-field:nth-child(1) > div > div > div > textarea'
const DESCRIPTION_SELECTOR = '#formly_2_textarea_description_1'

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

let files: any[]
const allTFBs = []
let desc = ''
const getEnglishDesc = () => {
  const leftpaneindex = allTFBs.indexOf('English')
  console.log('found en at:', leftpaneindex)
  const en: HTMLElement = document.querySelectorAll('#extensionListTable tbody')[0] as HTMLElement
  const leftPaneRowEle = en.children[leftpaneindex]

  let promise = Promise.resolve()
  promise = promise.then(function () {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        leftPaneRowEle.scrollIntoView()
        // document.querySelector('#extensionListTable > tbody > tr:nth-child(2)').children[5].
        leftPaneRowEle.children[5].children[0].children[0].click()
        console.log('downloadBtn clicked for', leftPaneRowEle)
        resolve()
      }, 4000)
    })
  })

  promise = promise.then(function () {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        desc = document.querySelector(DESCRIPTION_SELECTOR).value
        resolve()
      }, 4000)
    })
  })

  promise = promise.then(function () {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        console.log('desc', desc)
        resolve()
      }, 4000)
    })
  })

  promise = promise.then(function () {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        document.querySelector('.close-button').click()
        resolve()
      }, 4000)
    })
  })

  return promise
}

async function mountUploadLocalesButton(appendContainer: object, containerid?: string) {
  const handleFileChange = (event) => {
    console.log(event)
    files = event.target.files
    console.log(files)
    console.log(files.length)
    waitForElm('#extensionListTable tbody').then((elm) => {
      console.log('outer elm:')
      console.log(elm)
      const countLocales = elm.children.length
      console.log('count=', countLocales)
      const reqdLocaleElems = elm.children
      for (let i = 0; i < countLocales; i++) {
        try {
          console.log(reqdLocaleElems[i].children[0].children[0].innerText) //.split(' ').slice(-1)[0]
          allTFBs.push(
            reqdLocaleElems[i].children[0].children[0].innerText,
            // .split(' ')
            // .slice(-1)[0] /*.replace("(", "").replace(")", "")*/,
          )
        } catch (err: Error) {
          console.log(err)
        }
      }
      console.log('allTFBs:', allTFBs)

      let promise = getEnglishDesc()
      promise = promise.then(function () {
        return new Promise((resolve, reject) => {
          setTimeout(function () {
            const container = document.createElement('div')
            container.className = 'locales-upload-container'
            waitForElm(siteConfig.inputQuery[0]).then((appendContainer) => {
              console.log(siteConfig.inputQuery[0], 'Element is ready')
              console.log('appendContainer', appendContainer)
              appendContainer.appendChild(container)
              render(
                <>
                  <FileInput
                    onChange={(e) => handleFileChange(e)}
                    buttonId={containerid}
                    buttonSize="small"
                    displayText="Upload Locales"
                    webkitdirectory
                    directory
                    multiple
                  />
                  <button onClick={() => handleNextIndex()}> Next </button>
                </>,
                container,
              )
            })
            resolve()
          }, 4000)
        })
      })
    })

    event.preventDefault()
  }

  const handleNextIndex = () => {
    console.log('mountNextButton:handleNextIndex', nextindex, desc)
    if (nextindex >= files.length) {
      alert('Done for all files')
      return
    }

    if (files) {
      const file = files[nextindex]
      const reader = new FileReader()
      reader.fileName = file.name
      reader.webkitRelativePath = file.webkitRelativePath
      reader.onload = (event) => {
        const fileName = event.target.fileName
        const webkitRelativePath = event.target.webkitRelativePath
        const content = JSON.parse(event.target.result)
        console.log('webkitRelativePath:', webkitRelativePath)
        // console.log('fileName:', fileName)
        // console.log(content)
        //     const searchElem = '(' + webkitRelativePath.split('/')[1].replace('_', '-') + ')'
        //     const leftpaneindex = allTFBs.indexOf(searchElem)
        //     console.log('mountNextButton:found at leftpaneindex:', leftpaneindex)
        //     const en: HTMLElement = document.getElementsByClassName('nav-stacked')[0] as HTMLElement
        //     const leftPaneRowEle = en.children[leftpaneindex]
        //     console.log('mountNextButton:reqdLocaleElems', leftPaneRowEle)

        //     setTimeout(() => {
        //       leftPaneRowEle.scrollIntoView()
        //       setTimeout(() => {
        //         leftPaneRowEle.children[0].click()
        //         setTimeout(() => {
        //           const summ = document.querySelector(
        //             SUMMARY_SELECTOR.replace('{x}', leftpaneindex + 1),
        //           ).value
        //           const desc = document.querySelector(
        //             DESCRIPTION_SELECTOR.replace('{x}', leftpaneindex + 1),
        //           ).value
        //           console.log('summ:', summ)
        //           console.log('desc:', desc)
        //           if (summ.length <= 2) {
        //             // document.querySelector(SUMMARY_SELECTOR.replace('{x}', leftpaneindex + 1)).value = 'TODO'
        //           }
        //           if (desc.length <= 2) {
        //             document.querySelector(
        //               DESCRIPTION_SELECTOR.replace('{x}', leftpaneindex + 1),
        //             ).value = content.appDesc.message
        //           }
        //           window.scrollTo({ top: 0, behavior: 'smooth' })
        //           console.log('=====x====', nextindex + 1, 'files Done =====')
        nextindex++
        //         }, 4000)
        //       }, 4000)
        //     }, 4000)
      }
      reader.readAsText(file)
    }
  }

  const container = document.createElement('div')
  container.className = 'locales-upload-container'
  appendContainer.appendChild(container)
  render(
    <>
      <FileInput
        onChange={(e) => handleFileChange(e)}
        buttonId={containerid}
        buttonSize="small"
        displayText="Upload Locales"
        webkitdirectory
        directory
        multiple
      />
      <button onClick={() => handleNextIndex()}> Next </button>
    </>,
    container,
  )
}

waitForElm(siteConfig.inputQuery[0]).then((elm) => {
  console.log(siteConfig.inputQuery[0], 'Element is ready')
  console.log('elm', elm)
  mountUploadLocalesButton(elm)
})
