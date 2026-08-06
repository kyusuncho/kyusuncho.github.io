/*
  "On this page" panel (see _includes/toc_aside_custom.html): highlight the
  entry for the section currently under the top of the viewport, and keep that
  entry visible when the panel itself has to scroll.

  Block comments only — this file is concatenated into assets/js/just-the-docs.js.
*/
jtd.onReady(function () {
  var panel = document.querySelector(".toc-aside")
  if (!panel) return

  var box = panel.querySelector(".toc-aside-inner")
  var links = Array.prototype.slice.call(
    panel.querySelectorAll(".toc-aside-link")
  )
  if (!links.length) return

  var headings = links.map(function (link) {
    try {
      return document.getElementById(decodeURIComponent(link.hash.slice(1)))
    } catch (e) {
      return null
    }
  })

  /* Distance below the viewport top at which a heading becomes "current". */
  var ACTIVE_OFFSET = 96
  var active = null
  var ticking = false

  function keepInView(link) {
    if (!box || box.scrollHeight <= box.clientHeight) return
    var top = link.offsetTop
    var bottom = top + link.offsetHeight
    if (top < box.scrollTop) {
      box.scrollTop = top - 8
    } else if (bottom > box.scrollTop + box.clientHeight) {
      box.scrollTop = bottom - box.clientHeight + 8
    }
  }

  function activate(link) {
    if (link === active) return
    if (active) {
      active.classList.remove("is-active")
      active.removeAttribute("aria-current")
    }
    if (link) {
      link.classList.add("is-active")
      link.setAttribute("aria-current", "true")
      keepInView(link)
    }
    active = link
  }

  function update() {
    ticking = false

    var index = 0
    var scrolled = window.pageYOffset || document.documentElement.scrollTop
    var atBottom =
      scrolled + window.innerHeight >= document.documentElement.scrollHeight - 2

    if (atBottom) {
      /* Trailing sections can be too short to ever cross the offset line. */
      index = links.length - 1
    } else {
      for (var i = 0; i < headings.length; i++) {
        if (
          headings[i] &&
          headings[i].getBoundingClientRect().top <= ACTIVE_OFFSET
        ) {
          index = i
        }
      }
    }

    activate(links[index])
  }

  function onScroll() {
    if (ticking) return
    ticking = true
    window.requestAnimationFrame(update)
  }

  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onScroll, { passive: true })
  update()
})
