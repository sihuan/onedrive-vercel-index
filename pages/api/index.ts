import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { posix as pathPosix } from 'path'

import apiConfig from '../../config/api.json'
import siteConfig from '../../config/site.json'
import { compareHashedToken } from '../../utils/tools'
import redis from '../../utils/redis'

const basePath = pathPosix.resolve('/', apiConfig.base)

const wrapPath = (path: string) => {
  let wrappedPath = pathPosix.join(basePath, pathPosix.resolve('/', path))
  if (wrappedPath === '/' || wrappedPath === '') {
    return ''
  }
  return wrappedPath.replace(/\/$/, '')
}

// Store access token in memory, cuz Vercel doesn't provide key-value storage natively
const getAccessToken = async() =>{
  const access_token = await redis.get('access_token')
  if(access_token){
      return access_token
  }
  const refresh_token = await redis.get('refresh_token')
  const resp = await axios.post(apiConfig.authApi, JSON.stringify({
      'refresh_token': refresh_token,
      'grant_type': 'refresh_token'
  }), {
      headers: {
          'Content-Type': 'application/json',
      },
  })
  if(resp.data.access_token){
      await redis.set('access_token', resp.data.access_token)
      await redis.expire('access_token', resp.data.expires_in)
      await redis.set('refresh_token', resp.data.refresh_token)
      return resp.data.access_token
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path = '/', raw = false, next = '' } = req.query
  if (path === '[...path]') {
    res.status(400).json({ error: 'No path specified.' })
    return
  }

  if (typeof path === 'string') {
    const accessToken = await getAccessToken()

    // Handle authentication through .password
    const protectedRoutes = siteConfig.protectedRoutes
    let authTokenPath = ''
    for (const r of protectedRoutes) {
      if (path.startsWith(r)) {
        authTokenPath = `${r}/.password`
        break
      }
    }

    // Fetch password from remote file content
    if (authTokenPath !== '') {
      try {
        const token = await axios.post(`${apiConfig.driveApi}/get_by_path`, JSON.stringify({
          'drive_id': apiConfig.driveId,
          'file_path': wrapPath(authTokenPath),
        }), {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        // Handle request and check for header 'od-protected-token'
        const odProtectedToken = await axios.get(token.data['url'])
        // console.log(req.headers['od-protected-token'], odProtectedToken.data.trim())

        if (!compareHashedToken(req.headers['od-protected-token'] as string, odProtectedToken.data)) {
          res.status(401).json({ error: 'Password required for this folder.' })
          return
        }
      } catch (error: any) {
        // Password file not found, fallback to 404
        if (error.response.status === 404) {
          res.status(404).json({ error: "You didn't set a password for your protected folder." })
        }
        res.status(500).end()
        return
      }
    }

    const requestPath = wrapPath(path)
    // Whether path is root, which requires some special treatment
    const isRoot = requestPath === ''

    // Go for file raw download link and query with only temporary link parameter
    if (raw) {
      if (isRoot) {
        res.status(400).json({ error: "Folders doesn't have raw download urls." })
        return
      }
      const { data } = await axios.post(`${apiConfig.driveApi}/get_by_path`, JSON.stringify({
        'drive_id': apiConfig.driveId,
        'file_path': requestPath
      }), {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (data['type'] == 'folder') {
        res.status(400).json({ error: "Folders doesn't have raw download urls." })
        return
      }
      if (data['type'] == 'file') {
        res.redirect(data['download_url'])
        return
      }
    }

    // Querying current path identity (file or folder) and follow up query childrens in folder
    // console.log(accessToken)
    let identityData = {};
    if (isRoot) {
      identityData = {
        'type': 'folder',
        'file_id': 'root',
      }
    } else {
      ({ data: identityData } = await axios.post(`${apiConfig.driveApi}/get_by_path`, JSON.stringify({
        'drive_id': apiConfig.driveId,
        'file_path': requestPath
      }), {
        headers: { Authorization: `Bearer ${accessToken}` },
      }))
    }

    if (identityData['type'] == 'folder') {
      const { data: folderData } = await axios.post(`${apiConfig.driveApi}/list`, JSON.stringify({
        'drive_id': apiConfig.driveId,
        'parent_file_id': identityData['file_id'],
        'limit': siteConfig.maxItems,
        'marker': next,
        'order_by': 'name',
        'order_direction': 'ASC',
      }), {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      // Return paging token if specified
      if (folderData['next_marker']) {
        res.status(200).json({ folder: folderData, next: folderData['next_marker'] })
      } else {
        res.status(200).json({ folder: folderData })
      }
      return
    }
    res.status(200).json({ file: identityData })
    return
  }

  res.status(404).json({ error: 'Path query invalid.' })
  return
}
