export interface SearchEngine {
  inputQuery: string[]
  sidebarContainerQuery: string[]
  appendContainerQuery: string[]
  watchRouteChange?: (callback: () => void) => void
}

export const config: Record<string, SearchEngine> = {
  edge: {
    inputQuery: ['#pageMainContent > div.dropdown.aria-hidden-on-modalopen'],
    //'history-tabs > div > div > div > ul > li.uib-tab.nav-item.ng-isolate-scope.active'],
    // body > div > div.row.view-animate.ng-scope > history-tabs > div > div.margin-bottom-10 > div > ul > li.uib-tab.nav-item.ng-isolate-scope.active
    // sidebarContainerQuery: ['#pane-side'],
    // appendContainerQuery: ['#hard_expire_time'],
  },
}
