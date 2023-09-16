export interface SearchEngine {
  inputQuery: string[]
  sidebarContainerQuery: string[]
  appendContainerQuery: string[]
  watchRouteChange?: (callback: () => void) => void
}

export const config: Record<string, SearchEngine> = {
  whatsapp: {
    inputQuery: ['#app div.os-mac div div header'],
    // #app > div > div > div._2Ts6i._3RGKj > header > div._3WByx > div
    sidebarContainerQuery: ['#pane-side'],
    appendContainerQuery: ['#hard_expire_time'],
  },
}
