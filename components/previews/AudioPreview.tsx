import { FunctionComponent, useState } from 'react'
import ReactPlayer from 'react-player'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import DownloadBtn from '../DownloadBtn'

enum PlayerState {
  Loading,
  Ready,
  Playing,
  Paused,
}

export const AudioPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const [playerStatus, setPlayerStatus] = useState(PlayerState.Loading)

  return (
    <>
      <div className="dark:bg-gray-900 dark:text-white w-full p-3 bg-white rounded shadow">
        <div className="md:flex-row md:space-x-4 flex flex-col space-y-4">
          <div className="dark:bg-gray-700 h-72 md:w-40 md:h-36 flex items-center justify-center w-full transition-all duration-75 bg-gray-100 rounded">
            {playerStatus === PlayerState.Loading ? (
              <div>
                <svg
                  className="animate-spin w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : (
              <FontAwesomeIcon
                className={`h-5 w-5 ${playerStatus === PlayerState.Playing ? 'animate-spin' : ''}`}
                icon="music"
                size="2x"
              />
            )}
          </div>
          <div className="flex flex-col w-full space-y-2">
            <div>{file.name}</div>
            <div className="pb-4 text-sm text-gray-500">
              Last modified:{' '}
              {new Date(file.updated_at).toLocaleString(undefined, {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </div>
            <ReactPlayer
              url={file['url']}
              controls
              width="100%"
              height="48px"
              config={{ file: { forceAudio: true } }}
              onReady={() => {
                setPlayerStatus(PlayerState.Ready)
              }}
              onPlay={() => {
                setPlayerStatus(PlayerState.Playing)
              }}
              onPause={() => {
                setPlayerStatus(PlayerState.Paused)
              }}
              onError={() => setPlayerStatus(PlayerState.Paused)}
              onEnded={() => setPlayerStatus(PlayerState.Paused)}
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
