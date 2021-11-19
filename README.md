<div align="center">
  <img src="./public/header.png" alt="alidrive-vercel-index" />
  <h3><a href="https://alidrive.vercel.app">alidrive-vercel-index</a></h3>
  <p><em>Yet another-another AliDrive index, powered by Vercel and Next.js</em></p>
  <img src="https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Vercel-black?style=flat&logo=Vercel&logoColor=white" alt="Vercel" />
</div>

---

<h5>This is <a href="https://github.com/spencerwooo/onedrive-vercel-index">onedrive-vercel-index</a>'s little brother, basically the same, but for alidrive.</h5>

## Features

🚧 **_This is currently a work in progress._**

- [x] File preview (PDF, markdown, code, plain text, ...)
- [x] Image preview in gallery mode
- [x] Video and audio preview (mp4, mp3, ...)
- [x] Office documents preview (docx, pptx, xlsx, ...)
- [x] `README.md` preview rendering
- [x] File permalink copy and direct file download
- [x] Dark mode
- [x] Protected routes (password protection and authentication) through `.password` files
- [x] Pagination for folders with more than 200 items

## Demo

Available at: <https://alidrive.vercel.app>.

![demo](./public/demo.png)

## Deployment

> Simplified version for now, will update for detailed documentations in due course.

- Fork and clone the project to your GitHub account. Then deploy the project to Vercel.
- Define environment variables inside Vercel: `REDIS_URL`.
- Finally, change configuration file [`config/api.json`](config/api.json) and [`config/site.json`](config/site.json) according to your configs.

可以使用 [Upstash](https://vercel.com/integrations/upstash) 提供的免费的 redis 数据库，
新建 redis 数据库后，填写上文提到 Vercel 的 `REDIS_URL` 环境变量。
你需要用某种方式向你新建的 redis 数据库中新建键名为 `refresh_token` 的键值对，其值可以参考[这里](https://github.com/Xhofe/alist/issues/88)获得。

## Protected routes

See: [Announcements - Password protected routes is now supported #66](https://github.com/spencerwooo/onedrive-vercel-index/discussions/66).

---

**onedrive-vercel-index** ©Spencer Woo. Released under the MIT License.

Authored and maintained by Spencer Woo.

> [@Portfolio](https://spencerwoo.com/) · [@Blog](https://blog.spencerwoo.com/) · [@GitHub](https://github.com/spencerwooo)
