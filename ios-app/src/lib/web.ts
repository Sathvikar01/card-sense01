import * as WebBrowser from 'expo-web-browser'
import { colors } from '@/theme'
import { WEB_URL } from './env'

/** Opens a page of the CardSense website in an in-app Safari sheet. */
export function openWeb(path: string) {
  return WebBrowser.openBrowserAsync(`${WEB_URL}${path}`, {
    controlsColor: colors.pine,
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  })
}

export function openUrl(url: string) {
  return WebBrowser.openBrowserAsync(url, { controlsColor: colors.pine })
}
