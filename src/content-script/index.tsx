import { render } from 'preact'
import FileInput from '~/content-script/components/FileInput'
import '../base.css'
import './styles.scss'
import { config } from './website-configs'
import Browser from 'webextension-polyfill'
import { toast, Zoom, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import  { extractFirstAndLastSentence, containsAnyWord } from './utils'
//Not required for chatGPT case
const locmap = {
  'am':'Amharic',
  'ar':'Arabic',
  'bg':'Bulgarian',
  'bn':'Bangla',
  'ca':'Catalan',
  'cs':'Czech',
  'da':'Danish',
  'de':'German',
  'el':'Greek',
  'en':'English',
  'en_AU':'English (Australia)',
  'en_GB':'English (United Kingdom)',
  'en_US':'English (United States)',
  'es':'Spanish',
  'es_419':'Spanish (Latin America and the Caribbean)',
  'et':'Estonian',
  'fa':'Persian',
  'fi':'Finnish',
  'fil':'Filipino',
  'fr':'French',
  'gu':'Gujarati',
  'he':'Hebrew',
  'hi':'Hindi',
  'hr':'Croatian',
  'hu':'Hungarian',
  'id':'Indonesian',
  'in':'Indonesian',
  'it':'Italian',
  'iw':'Hebrew (Modern)',
  'ja':'Japanese',
  'kn':'Kannada',
  'ko':'Korean',
  'lt':'Lithuanian',
  'lv':'Latvian',
  'ml':'Malayalam',
  'mr':'Marathi',
  'ms':'Malay',
  'nl':'Dutch',
  'no':'Norwegian',
  'pl':'Polish',
  'pt_BR':'Portuguese (Brazil)',
  'pt_PT':'Portuguese (Portugal)',
  'ro':'Romanian',
  'ru':'Russian',
  'sk':'Slovak',
  'sl':'Slovenian',
  'sr':'Serbian',
  'sv':'Swedish',
  'sw':'Kiswahili',
  'ta':'Tamil',
  'te':'Telugu',
  'th':'Thai',
  'tr':'Turkish',
  'uk':'Ukrainian',
  'vi':'Vietnamese',
  'zh_CN':'Chinese (China)',
  'zh_TW':'Chinese (Taiwan)'
}

//Not required for any case
const revlocmap = {
  'Chinese (China)':'zh_CN',
  'English':'en',
  'French':'fr',
  'German':'de',
  'Hebrew':'he',
  'Hungarian':'hu',
  'Korean':'ko',
  'Portuguese (Portugal)':'pt_PT',
  'Romanian':'ro',
  'Russian':'ru',
  'Spanish':'es',
  'Ukrainian':'uk'
}

let nextIndex = 0
let ans = ""
const DESCRIPTION_SELECTOR = 'textarea.form-control'
const firstSentenceSearchKeywords = [":", "translation", "translated", "translates", "here is the", "here's", "heres the", "Ishan", "Singularity Labs", "Certainly", "แปล"]
const lastSentenceSearchKeywords = ["translation", "translated", "translates", "here is the", "here's", "heres the", "Ishan", "Singularity Labs", "more questions", "hope this helps", "further assistance", "Mong rằng điều này hữu ích", "แปล"]

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

const set2RowsDesc = async (appendContainer: HTMLElement, leftpaneindexes:number[]) => {
  const f = (leftPaneRowEle,index) => {
    return new Promise(async (resolve, reject) => {
      leftPaneRowEle.scrollIntoView()
      leftPaneRowEle.children[5].children[0].children[0].click()
      console.log('downloadBtn clicked for', leftPaneRowEle)
      ans = ""
      const listener = (msg: any) => {
        // console.debug('frontend msg:', msg)
        try {
          if (msg.text) {
            ans = msg.text
          } else if (msg.error) {
            console.error('frontend msg.error:', msg.error)
            toast.error(msg.error, { position: 'bottom-right', transition: Zoom })
          } else if (msg.event === 'DONE') {
            if (ans) {
              const [firstSentence, lastSentence] = extractFirstAndLastSentence(ans)
              console.log("ans b4=", ans)
              console.log("firstSentence=", firstSentence)
              if (containsAnyWord(firstSentence, firstSentenceSearchKeywords)) {
                console.log("Replacing firstSentence=", firstSentence)
                ans = ans.replace(firstSentence, "")
              }
              if (containsAnyWord(firstSentence, firstSentenceSearchKeywords)) {
                console.log("Replacing firstSentence=", firstSentence)
                ans = ans.replace(firstSentence, "")
              }
              if (containsAnyWord(firstSentence, firstSentenceSearchKeywords)) {
                console.log("Replacing firstSentence=", firstSentence)
                ans = ans.replace(firstSentence, "")
              }
              console.log("lastSentence=", lastSentence)
              if (containsAnyWord(lastSentence, lastSentenceSearchKeywords)) {
                console.log("Replacing lastSentence=", lastSentence)
                ans = ans.replace(lastSentence, "")
              }
              console.log("ans Ar=", ans)
              document.querySelector(DESCRIPTION_SELECTOR).scrollIntoView()
              document.querySelector(DESCRIPTION_SELECTOR).focus()
              document.querySelector(DESCRIPTION_SELECTOR).value = ans.trim().replace(/['"]+/g, '');
              const event = new Event('input');
              document.querySelector(DESCRIPTION_SELECTOR).dispatchEvent(event);
            } else {
              document.querySelector(DESCRIPTION_SELECTOR).scrollIntoView()
            }
            setTimeout(function () {
              window.scrollTo({ top: 0, behavior: 'smooth' })
              document.querySelector('.he-button').shadowRoot.querySelector("button").click()
              setTimeout(function () {
                document.querySelector('.close-button').click()
                nextIndex = nextIndex + 1;
              }, 4000)
            }, 8000)
          }
        } catch (e) {
          console.log(e)
        }
      }

      const port = Browser.runtime.connect()
      port.onMessage.addListener((msg, sender) => {
        console.debug("BG page received message", msg, "from", sender);
        listener(msg)
      });

      port.onDisconnect.addListener(() => {
        console.log("Port disconnected");
        waitForElm(siteConfig.inputQuery[0]).then((appendContainer) => {
          console.log(siteConfig.inputQuery[0], 'Element is ready')
          const container = document.createElement('div')
          container.className = 'locales-upload-container'
          console.log('appendContainer', appendContainer)
          appendContainer.appendChild(container)
          render(
            <>
              <button class="bg-blue-500 text-white font-bold py-2 px-4 m-0.5 rounded opacity-50 cursor-not-allowed focus:outline-none disabled:opacity-25" disabled> Set All remaining Locales (Done:{nextIndex}/{allTFBs.length}) </button>
              <ToastContainer />
            </>,
            container,
          )
        })
        resolve(); // Resolve the Promise when the port disconnects
      });

      await port.postMessage({ question: "Can you translate the following into " + allTFBs[leftpaneindexes[index]] + ":" + desc });
    })
  }

  let en: HTMLElement;
  let leftPaneRowElei;

  for (let i = 0; i < leftpaneindexes.length; i++) {
    try {
      en = document.querySelectorAll('#extensionListTable tbody')[0] as HTMLElement
      if(en)
        leftPaneRowElei = en.children[leftpaneindexes[i]]
      if(leftPaneRowElei) {
        await f(leftPaneRowElei, i);
        const successMsg = (nextIndex - 1) + "-th(0-indexed)(ie " + allTFBs[nextIndex - 1] + ") Done"
        console.log(successMsg);
        toast.success(successMsg, { position: 'bottom-right', transition: Zoom })
      } else {
        const failureMsg = "Couldn't find " + (nextIndex - 1) + "-th(0-indexed)(ie " + allTFBs[nextIndex - 1] + ")"
        console.error(failureMsg);
        toast.error(failureMsg, { position: 'bottom-right', transition: Zoom })
      }
    } catch (err) {
      console.error(err)
      const failureMsg = "Unexpected Error selecting row " + (nextIndex - 1) + "-th(0-indexed)(ie " + allTFBs[nextIndex - 1] + ")"
      toast.error(failureMsg+err, { position: 'bottom-right', transition: Zoom })
    }
  }
}

async function mountUploadLocalesButton(appendContainer: HTMLElement, containerid?: string) {
  const handleFileChange = (event) => {
    nextIndex = 0
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
          console.log(reqdLocaleElems[i].children[0].children[0].innerText)
          allTFBs.push(
            reqdLocaleElems[i].children[0].children[0].innerText,
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
                  <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-0.5 border border-blue-700 rounded" onClick={() => handlenextIndex(appendContainer, 1)}> Set Next Locale (Done:{nextIndex}/{allTFBs.length}) </button>
                  <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-0.5 border border-blue-700 rounded" onClick={() => handlenextIndex(appendContainer, 2)}> Set Next 2 Locales (Done:{nextIndex}/{allTFBs.length}) </button>
                  <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-0.5 border border-blue-700 rounded" onClick={() => handlenextIndex(appendContainer, 3)}> Set Next 3 Locales (Done:{nextIndex}/{allTFBs.length}) </button>
                  <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-0.5 border border-blue-700 rounded" onClick={() => handlenextIndex(appendContainer)}> Set All remaining Locales (Done:{nextIndex}/{allTFBs.length}) </button>
                  <ToastContainer />
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

  const handlenextIndex = async (appendContainer: HTMLElement, repeatrows?: number) => {
    console.log('mountNextButton:handlenextIndex:nextIndex', nextIndex)
    if (allTFBs[nextIndex] === "English") {
      const info = "English is already set, moving on to " + allTFBs[nextIndex + 1]
      console.log(info);
      toast.info(info, { position: 'bottom-right', transition: Zoom })
      nextIndex = nextIndex + 1
    }
    if (nextIndex >= files.length) {
      const successMsg = "Done for all files"
      alert(successMsg)
      toast.success(successMsg, { position: 'bottom-right', transition: Zoom })
      return
    }
    if (desc.length > 0) {
      const rem = repeatrows ? repeatrows : allTFBs.length - nextIndex
      const array = [], start = nextIndex;
      let end = nextIndex + rem - 1, a = end - start + 1;
      while(a--) array[a] = end--;
      console.log(array)
      await set2RowsDesc(appendContainer, array);

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
              <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-0.5 border border-blue-700 rounded" onClick={() => handlenextIndex(appendContainer, 1)}> Set Next Locale (Done:{nextIndex}/{allTFBs.length}) </button>
              <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-0.5 border border-blue-700 rounded" onClick={() => handlenextIndex(appendContainer, 2)}> Set Next 2 Locales (Done:{nextIndex}/{allTFBs.length}) </button>
              <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-0.5 border border-blue-700 rounded" onClick={() => handlenextIndex(appendContainer, 3)}> Set Next 3 Locales (Done:{nextIndex}/{allTFBs.length}) </button>
              <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-0.5 border border-blue-700 rounded" onClick={() => handlenextIndex(appendContainer)}> Set All Remaining Locales (Done:{nextIndex}/{allTFBs.length}) </button>
              <ToastContainer />
            </>,
            container,
          )
        })
      }, 1000)

    } else {
      if (files) {
        const file = files[nextIndex]
        const reader = new FileReader()
        reader.fileName = file.name
        reader.webkitRelativePath = file.webkitRelativePath
        reader.onload = (event) => {
          const fileName = event.target.fileName
          const webkitRelativePath = event.target.webkitRelativePath
          const content = JSON.parse(event.target.result)
          console.log('webkitRelativePath:', webkitRelativePath)
          console.log('fileName:', fileName)
          console.log(content)
          const searchElem = locmap[webkitRelativePath.split('/')[1]]
          console.log('searchElem:', searchElem)
          const leftpaneindex = allTFBs.indexOf(searchElem)
          console.log('mountNextButton:found at leftpaneindex:', leftpaneindex)
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
          //           console.log('=====x====', nextIndex + 1, 'files Done =====')
          const successMsg = "Done for " + allTFBs[nextIndex]
          toast.success(successMsg, { position: 'bottom-right', transition: Zoom })
          nextIndex = nextIndex + 1;
          //         }, 4000)
          //       }, 4000)
          //     }, 4000)
        }
        reader.readAsText(file)
      }
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
      <button class="bg-blue-500 text-white font-bold py-2 px-4 m-0.5 rounded opacity-50 cursor-not-allowed focus:outline-none disabled:opacity-25" disabled> Set Next Locale (Done:{nextIndex}/{allTFBs.length}) </button>
      <button class="bg-blue-500 text-white font-bold py-2 px-4 m-0.5 rounded opacity-50 cursor-not-allowed focus:outline-none disabled:opacity-25" disabled> Set Next 2 Locales (Done:{nextIndex}/{allTFBs.length}) </button>
      <button class="bg-blue-500 text-white font-bold py-2 px-4 m-0.5 rounded opacity-50 cursor-not-allowed focus:outline-none disabled:opacity-25" disabled> Set Next 3 Locales (Done:{nextIndex}/{allTFBs.length}) </button>
      <button class="bg-blue-500 text-white font-bold py-2 px-4 m-0.5 rounded opacity-50 cursor-not-allowed focus:outline-none disabled:opacity-25" disabled> Set All remaining Locales (Done:{nextIndex}/{allTFBs.length}) </button>
      <ToastContainer />
    </>,
    container,
  )
}

waitForElm(siteConfig.inputQuery[0]).then((elm) => {
  console.log(siteConfig.inputQuery[0], 'Element is ready')
  console.log('elm', elm)
  mountUploadLocalesButton(elm)
})
