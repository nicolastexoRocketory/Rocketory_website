import { continueRender, delayRender, staticFile } from 'remotion'
import { loadFont as loadDmSans } from '@remotion/google-fonts/DMSans'
import { loadFont as loadInstrument } from '@remotion/google-fonts/InstrumentSerif'

export const { fontFamily: fontSans } = loadDmSans('normal', {
  weights: ['400', '500', '700'],
  subsets: ['latin'],
})

loadInstrument('normal', {
  weights: ['400'],
  subsets: ['latin'],
})

export const { fontFamily: fontSerif } = loadInstrument('italic', {
  weights: ['400'],
  subsets: ['latin'],
})

export const fontDisplay = 'Rostex'

if (typeof document !== 'undefined') {
  const waitForRostex = delayRender('Rostex font')
  const rostex = new FontFace(
    fontDisplay,
    `url('${staticFile('assets/fonts/Rostex-Regular.otf')}') format('opentype')`,
  )

  void rostex
    .load()
    .then((face) => {
      document.fonts.add(face)
      continueRender(waitForRostex)
    })
    .catch((error) => {
      console.warn('Rostex konnte nicht geladen werden, Fallback greift.', error)
      continueRender(waitForRostex)
    })
}
