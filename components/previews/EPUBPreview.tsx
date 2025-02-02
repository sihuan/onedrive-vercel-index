import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { ReactReader } from 'react-reader'
import type { Rendition } from 'epubjs'

import Loading from '../Loading'
import DownloadBtn from '../DownloadBtn'

const EPUBPreview: FunctionComponent<{file: any}> = ({ file }) => {
  const [epubContainerWidth, setEpubContainerWidth] = useState(400)
  const epubContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEpubContainerWidth(epubContainer.current ? epubContainer.current.offsetWidth : 400)
  }, [])

  const [location, setLocation] = useState<string>()
  const onLocationChange = (cfiStr: string) => setLocation(cfiStr)

  // Fix for not valid epub files according to
  // https://github.com/gerhardsletten/react-reader/issues/33#issuecomment-673964947
  const fixEpub = (rendition: Rendition) => {
    const spineGet = rendition.book.spine.get.bind(rendition.book.spine)
    rendition.book.spine.get = function (target) {
      const targetStr = target as string
      let t = spineGet(target)
      while (t == null && targetStr.startsWith('../')) {
        target = targetStr.substring(3)
        t = spineGet(target)
      }
      return t
    }
  }

  return (
    <>
      <div
        className="dark:bg-gray-900 md:p-3 no-scrollbar flex flex-col w-full overflow-scroll bg-white rounded shadow"
        style={{ maxHeight: '90vh' }}
      >
        <div className="no-scrollbar flex-1 w-full overflow-scroll" ref={epubContainer} style={{ minHeight: '70vh' }}>
          <div style={{ position: 'absolute', width: epubContainerWidth, height: '70vh' }}>
            <ReactReader
              url={file['url']}
              getRendition={(rendition) => fixEpub(rendition)}
              loadingView={<Loading loadingText="Loading EPUB ..." />}
              location={location}
              locationChanged={onLocationChange}
              epubInitOptions={{ openAs: 'epub' }}
              epubOptions={{ flow: 'scrolled' }}
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <DownloadBtn downloadUrl={file['download_url']} />
      </div>
    </>
  )
}

export default EPUBPreview
