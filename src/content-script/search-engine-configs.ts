export interface SearchEngine {
  inputQuery: string[]
  bodyQuery: string[]
  sidebarContainerQuery: string[]
  appendContainerQuery: string[]
  watchRouteChange?: (callback: () => void) => void
}

export const config: Record<string, SearchEngine> = {
  whatsapp: {
    inputQuery: ['form textarea'],
    bodyQuery: ['form textarea'],
    sidebarContainerQuery: ['#pane-side'],
    appendContainerQuery: ['#hard_expire_time'],
  },
}
