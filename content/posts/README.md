# Blog posts

Every file in this folder is one post on useaktivate.com/blog. The file name is the address:
`what-is-shoplink.md` → `useaktivate.com/blog/what-is-shoplink/`. Use lowercase words joined by dashes.

To publish, add or edit a file and merge it into `main`. Render rebuilds the site and the post is live a few
minutes later.

## Writing in an editor (Pages CMS)

Go to app.pagescms.org, sign in with GitHub and open **Aktivate-Org/website-v3 → Blog posts**. You get a form for
the fields below and a normal text editor for the post; images you add go to `content/blog-images/`. Save
commits straight to `main`. The set-up lives in `.pages.yml` at the root of the repo. The site reads the top of
each file as YAML, so what Pages CMS writes (wrapped lines, quotes) works, and hand-written files still do too.

You can also open a file on GitHub and press the pencil.

## The top of each file

```
---
title: Black Friday on ShopLink: get ₦10,000 extra on your first sale this week
subtitle: One line under the title (optional)
date: 2026-11-23T08:00:00+01:00
tags: for-creators, ShopLink, Black Friday
cover: /blog-images/my-cover.jpg
seo_title: Shorter title for Google (optional)
seo_description: One or two sentences for Google and link previews (optional)
---

The post, in Markdown.
```

| Field | What it does |
|---|---|
| `title`, `date` | Required. Use Lagos time with `+01:00` in the date. |
| `date` in the future | The post stays off the site until then. The Blog schedule workflow rebuilds the site at that time. |
| `tags` | Comma-separated. One of `for-brands`, `for-creators`, `case-study`, `news` sets the category pill; otherwise it's guessed from the title. `brasil`, `philippines` or `indonesia` makes it a market post (see `build/blog.js`). |
| `cover` | Put the image in `content/blog-images/` and write `/blog-images/<file>`. 1600×840 works best. Without one, the post gets an illustration. |
| `draft: true` | Keeps the post off the site. |
| `updated`, `read_time`, `author`, `canonical`, `og_image` | Optional. Read time is worked out from the length if left out. |

Images inside a post: put them in `content/blog-images/` too and link them as `![Alt text](/blog-images/<file>)`.
