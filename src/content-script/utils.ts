import Browser from 'webextension-polyfill'

export function getPossibleElementByQuerySelector<T extends Element>(
  queryArray: string[],
): T | undefined {
  for (const query of queryArray) {
    const element = document.querySelector(query)
    if (element) {
      return element as T
    }
  }
}

export function endsWithQuestionMark(question: string) {
  return (
    question.endsWith('?') || // ASCII
    question.endsWith('？') || // Chinese/Japanese
    question.endsWith('؟') || // Arabic
    question.endsWith('⸮') // Arabic
  )
}

export function isBraveBrowser() {
  return (navigator as any).brave?.isBrave()
}

export async function usedForMins() {
  const { usedForMins = 0 } = await Browser.storage.local.get('usedForMins')
  if (ratingTipShowTimes >= 5) {
    return false
  }
  await Browser.storage.local.set({ totalTime: totalTime + (Date.now() - startTime) })
  return ratingTipShowTimes >= 2
}

export async function shouldShowRatingTip() {
  const { ratingTipShowTimes = 0 } = await Browser.storage.local.get('ratingTipShowTimes')
  if (ratingTipShowTimes >= 5) {
    return false
  }
  await Browser.storage.local.set({ ratingTipShowTimes: ratingTipShowTimes + 1 })
  return ratingTipShowTimes >= 2
}

export function isValidHttpUrl(string: string) {
  let url
  try {
    url = new URL(string)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}

export const extractFirstAndLastSentence = (inputString) => {
  const sentenceMatch = inputString.match(/[^-=:.!?]+[-=:.!?]/);
  if (sentenceMatch) {
    const firstSentence = sentenceMatch[0].trim();
    const lastSentence = sentenceMatch[sentenceMatch.length - 1].trim();
    return [firstSentence, lastSentence];
  } else {
    return [inputString.trim(), inputString.trim()];
  }
}

export const containsAnyWord = (inputString, wordArray) => {
  for (const word of wordArray) {
    if (inputString.includes(word)) {
      return true;
    } else {
      console.log(word, "NOT FOUND in", inputString, typeof(word), typeof(inputString))
    }
  }
  return false;
}
