# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is a personal blog/portfolio built on the **Just the Docs** Jekyll theme, used directly
as the site source (not as a gem template). This file is about **authoring content** — the
Markdown posts, navigation, and links. It is intentionally not a guide to the theme's internals.

## The one rule that governs everything: `./blog` is the content root

All rendered content lives under `./blog/`. A custom plugin (`_plugins/blog_root.rb`) enforces
two behaviors that differ from a stock Just the Docs site:

1. **Only Markdown inside `./blog/` is rendered.** A `.md`/`.markdown` file placed anywhere
   else in the repo (root, theme folders, etc.) is silently dropped from the build — it will
   not appear as a page or in the nav. To publish a page, it must be under `./blog/`.
2. **`{% link %}` tags resolve relative to `./blog/`.** Write `{% link utilities/color.md %}`,
   not `{% link blog/utilities/color.md %}`. The path is relative to `blog/`, so the leading
   `blog/` is omitted. (Plain URL strings like `{{ site.baseurl }}/blog/...` still keep the
   `blog/` segment — only `{% link %}` tags drop it.)

Non-Markdown files (e.g. `404.html`, `assets/**`) are unaffected by rule 1.

## Adding a post / page

Create a `.md` file under `./blog/` (in any subfolder) with YAML front matter:

```markdown
---
title: My Post Title      # what shows in the sidebar & breadcrumbs (NOT the filename)
nav_order: 5              # position among siblings (lower = higher up)
---

# My Post Title

Content in Markdown...
```

Key facts:
- **`title` drives navigation**, not the filename or directory. Links reference pages by title.
- Filenames/paths only affect the URL (permalinks are `pretty`, e.g. `blog/foo/bar.md` → `/blog/foo/bar/`).
- A folder's landing page is its `index.md`; that page's front matter controls the section's
  sidebar entry, while sibling files become the pages under it.

### Nesting (parent / child / grandchild)

Child pages declare their parent by **title**:

```markdown
---
title: Color
parent: Utilities        # must match the parent page's `title`
nav_order: 2
---
```

For a third level, add `grandparent: <top title>` alongside `parent`. A page that has children
should set `has_children: true` in its front matter.

## Ordering the sidebar

- Within a level, order is controlled by `nav_order` (numbers sort first, then strings).
- `nav_sort: case_sensitive` is set globally in `_config.yml` (capitals sort before lowercase).
- Pages without `nav_order` fall back to alphabetical by `title`.

## Hiding a page from the sidebar

Add to its front matter:

```markdown
nav_exclude: true        # hides from nav; page still builds & is reachable by URL
```

Also useful: `search_exclude: true` (omit from search), `published: false` (don't build at all).
Existing examples to copy from: `blog/search.md`, `blog/minimal-test.md`.

## The "On this page" panel (right-hand TOC)

Every page automatically gets a sticky table of contents on the right, built from its own
`##` and `###` headings. Nothing to add to a post — just write headings, and keep them
meaningful, since they are the page's navigation.

- It appears only when a page has **two or more** `##`/`###` headings, and only on viewports
  at least `83.5rem` (1336px) wide — narrower screens keep the stock two-column layout.
- Above that width the panel's column is reserved on *every* page, even ones with no panel,
  so the sidebar and content column stay put as you navigate. Don't make those widths
  conditional on the page having headings.
- `####` and deeper are ignored on purpose; two levels keep the panel scannable.
- Opt a page out with `toc_aside: false` in its front matter.

Implementation, if it needs changing: `_includes/toc_aside_custom.html` (builds the list from
the rendered HTML at build time), `_sass/custom/custom.scss` (`.toc-aside*`, plus the
three-column widths), `_includes/js/custom.js` (scroll-spy highlighting).

## Linking between posts

Prefer `{% link %}` (build-time validated — a typo'd path **fails the build**, which is the
intended safety net):

```markdown
See the [configuration page]({% link configuration.md %}#callouts).
[customize]: {% link customization.md %}        # reference-style links work too
```

Paths are relative to `./blog/`. Anchor fragments (`#section`) are appended after the tag.
For external links, use normal Markdown — do not use `{% link %}`.

## Images & media

Media goes in **`assets/`, not `./blog/`**. The blog-root filter only drops stray Markdown;
everything under `assets/**` is served as-is. Put images in `assets/images/` (subfolders are
fine, e.g. `assets/images/posts/2026/`).

Reference them with a **root-relative URL through `relative_url`** (robust regardless of how
deeply the post is nested):

```markdown
![alt text]({{ '/assets/images/small-image.jpg' | relative_url }})
```

This is a URL string, so it keeps the real `assets/...` path — the `{% link %}` blog-root
rule applies only to Markdown pages, never to images. Avoid relative `../../assets/...` paths
(seen in `blog/index-test.md`); they break when a file moves.

Site-wide media is set in `_config.yml`: `favicon_ico` (or a `/favicon.ico` file, auto-detected)
and `logo:` (a `/assets/images/...` path that replaces the title text in the sidebar).

## The homepage

`blog/index.md` is the site root. It keeps `permalink: /` and `layout: home`. Edit it in place;
do not move it out of `./blog/`.

## Sidebar footer: theme toggle + social buttons

The bottom-left sidebar row (light/dark toggle, GitHub, email, Google Scholar) is defined in
`_includes/nav_footer_custom.html`, styled in `_sass/custom/custom.scss` (`.social-icon`).
To change the links or add a button, edit those two files. The theme preference persists via
`localStorage` (restored in `_includes/head_custom.html`).

Note: inline `<script>` in `_includes/*.html` must use `/* */` block comments, never `//` line
comments — `compress_html` strips newlines and a `//` would comment out the rest of the file.

## Build & preview

```bash
bundle exec jekyll serve     # live preview at http://localhost:4000 (rebuilds on save)
bundle exec jekyll build     # one-off build into _site/ (same command CI uses)
```

A broken `{% link %}` target or other reference error will fail the build with a clear message.

## Deployment caveat (important)

The site **must** deploy via GitHub Actions (`.github/workflows/deploy.yml`, which runs
`jekyll build`). The custom plugin in `_plugins/` only runs there. If GitHub Pages is ever
switched to the classic "deploy from a branch" mode, Jekyll runs in safe mode, the plugin is
ignored, and both the blog-only filter and the `{% link %}` short paths break.
