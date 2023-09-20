import { render } from 'preact'
import FileInput from '~/content-script/components/FileInput'
import '../base.css'
import './styles.scss'
import { config } from './website-configs'
// import { useMemo } from 'react';

const SUMMARY_SELECTOR =
  'body > div > div.row.view-animate.ng-scope > history-tabs > div > div:nth-child(2) > div > history-tab:nth-child(3) > div > div > div > history-tabs > div > div.col-md-9 > div > history-tab:nth-child({x}) > div > div > editable-field:nth-child(1) > div > div > div > textarea'
const DESCRIPTION_SELECTOR =
  'body > div > div.row.view-animate.ng-scope > history-tabs > div > div:nth-child(2) > div > history-tab:nth-child(3) > div > div > div > history-tabs > div > div.col-md-9 > div > history-tab:nth-child({x}) > div > div > editable-field:nth-child(2) > div > div:nth-child(3) > div > textarea'

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

let files: any[]
const allTFBs = []

// const getEnglish = useMemo(() => {
//   const leftpaneindex = allTFBs.indexOf('(en)');
//   console.log("found en at:", leftpaneindex);
//   let en: HTMLElement = document.getElementsByClassName('nav-stacked')[0] as HTMLElement;
//   let leftPaneRowEle = en.children[leftpaneindex]
//   setTimeout(() => { leftPaneRowEle.scrollIntoView() }, 2000);
//   setTimeout(() => {
//     leftPaneRowEle.children[0].click()
//   }, 2000);
//   const summ = document.querySelector(SUMMARY_SELECTOR.replace('{x}', leftpaneindex + 1)).value
//   const desc = document.querySelector(DESCRIPTION_SELECTOR.replace('{x}', leftpaneindex + 1)).value
//   setTimeout(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }, 2000);
//   return [summ, desc];
// });
// const [summary, description] = getEnglish();

async function mountUploadLocalesButton(appendContainer: object, containerid?: string) {
  const handleFileChange = (event) => {
    console.log(event)
    files = event.target.files
    console.log(files)
    console.log(files.length)
    document
      .querySelector(
        'body > div > div.row.view-animate.ng-scope > history-tabs > div > div.margin-bottom-10 > div > ul > li:nth-child(3) > a',
      )
      .click()

    waitForElm('ul.nav.nav-pills.nav-stacked').then((elm) => {
      console.log('outer elm:')
      console.log(elm)
      const countLocales = elm.children.length
      console.log('count=', countLocales)
      const reqdLocaleElems = elm.children
      for (let i = 0; i < countLocales; i++) {
        try {
          console.log(reqdLocaleElems[i].innerText.split(' ').slice(-1)[0])
          allTFBs.push(
            reqdLocaleElems[i].innerText
              .split(' ')
              .slice(-1)[0] /*.replace("(", "").replace(")", "")*/,
          )
        } catch (err: Error) {
          console.log(err)
        }
      }
      console.log('allTFBs:', allTFBs)

      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const reader = new FileReader()
          reader.fileName = file.name
          reader.fileName = file.name
          reader.webkitRelativePath = file.webkitRelativePath
          reader.onload = (event) => {
            const fileName = event.target.fileName
            const webkitRelativePath = event.target.webkitRelativePath
            const content = JSON.parse(event.target.result)
            console.log('webkitRelativePath:', webkitRelativePath)
            console.log('fileName:', fileName)
            console.log(content)
            const searchElem = '(' + webkitRelativePath.split('/')[1].replace('_', '-') + ')'
            const leftpaneindex = allTFBs.indexOf(searchElem)
            console.log('found at:', leftpaneindex)

            setTimeout(() => {
              reqdLocaleElems[leftpaneindex].scrollIntoView()
              setTimeout(() => {
                const element: HTMLElement = document.getElementsByClassName(
                  'nav-stacked',
                )[0] as HTMLElement
                element.children[leftpaneindex].children[0].click()
                setTimeout(() => {
                  const summ = document.querySelector(
                    SUMMARY_SELECTOR.replace('{x}', leftpaneindex + 1),
                  ).value
                  const desc = document.querySelector(
                    DESCRIPTION_SELECTOR.replace('{x}', leftpaneindex + 1),
                  ).value
                  console.log('summ:', summ)
                  console.log('desc:', desc)
                  if (summ.length <= 2) {
                    document.querySelector(
                      SUMMARY_SELECTOR.replace('{x}', leftpaneindex + 1),
                    ).value = 'TODO'
                  }
                  if (desc.length <= 2) {
                    document.querySelector(
                      DESCRIPTION_SELECTOR.replace('{x}', leftpaneindex + 1),
                    ).value = content.appDesc.message
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  console.log('=====x====', i + 1, 'files Done =====')
                }, 2000)
              }, 2000)
            }, 2000)
          }
          reader.readAsText(file)
          mountNextButton(appendContainer, 1)
          break
        }
      }
    })

    event.preventDefault()
  }
  const container = document.createElement('div')
  container.className = 'locales-upload-container'
  appendContainer.appendChild(container)
  render(
    <FileInput
      onChange={(e) => handleFileChange(e)}
      buttonId={containerid}
      buttonSize="small"
      displayText="Upload Locales"
      webkitdirectory
      directory
      multiple
    />,
    container,
  )
}

async function mountNextButton(appendContainer: object, nextindex: number, containerid?: string) {
  console.log('mountNextButton:files:', files)
  console.log('mountNextButton:allTFBs:', allTFBs)

  const handleNextIndex = () => {
    console.log('mountNextButton:handleNextIndex', nextindex)
    if (nextindex >= files.length) {
      alert('Done for all files')
      return
    }

    if (files) {
      const file = files[nextindex]
      const reader = new FileReader()
      reader.fileName = file.name
      reader.fileName = file.name
      reader.webkitRelativePath = file.webkitRelativePath
      reader.onload = (event) => {
        const fileName = event.target.fileName
        const webkitRelativePath = event.target.webkitRelativePath
        const content = JSON.parse(event.target.result)
        console.log('webkitRelativePath:', webkitRelativePath)
        console.log('fileName:', fileName)
        console.log(content)
        const searchElem = '(' + webkitRelativePath.split('/')[1].replace('_', '-') + ')'
        const leftpaneindex = allTFBs.indexOf(searchElem)
        console.log('mountNextButton:found at leftpaneindex:', leftpaneindex)
        const en: HTMLElement = document.getElementsByClassName('nav-stacked')[0] as HTMLElement
        const leftPaneRowEle = en.children[leftpaneindex]
        console.log('mountNextButton:reqdLocaleElems', leftPaneRowEle)

        setTimeout(() => {
          leftPaneRowEle.scrollIntoView()
          setTimeout(() => {
            leftPaneRowEle.children[0].click()
            setTimeout(() => {
              const summ = document.querySelector(
                SUMMARY_SELECTOR.replace('{x}', leftpaneindex + 1),
              ).value
              const desc = document.querySelector(
                DESCRIPTION_SELECTOR.replace('{x}', leftpaneindex + 1),
              ).value
              console.log('summ:', summ)
              console.log('desc:', desc)
              if (summ.length <= 2) {
                // document.querySelector(SUMMARY_SELECTOR.replace('{x}', leftpaneindex + 1)).value = 'TODO'
              }
              if (desc.length <= 2) {
                document.querySelector(
                  DESCRIPTION_SELECTOR.replace('{x}', leftpaneindex + 1),
                ).value = content.appDesc.message
              }
              window.scrollTo({ top: 0, behavior: 'smooth' })
              console.log('=====x====', nextindex + 1, 'files Done =====')
              nextindex++
            }, 2000)
          }, 2000)
        }, 2000)
      }
      reader.readAsText(file)
    }
  }

  const container = document.createElement('div')
  container.className = 'locales-upload-container'
  appendContainer.appendChild(container)

  render(<button onClick={() => handleNextIndex()}> Next </button>, container)
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

waitForElm(siteConfig.inputQuery[0]).then((elm) => {
  console.log(siteConfig.inputQuery[0], 'Element is ready')
  console.log('elm', elm)
  mountUploadLocalesButton(elm)
})
