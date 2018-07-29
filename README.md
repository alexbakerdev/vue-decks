# Vue Decks

A Vuepress Theme

---

## Very Beta Right Now

List of Features

- [ ] Deck Theme - Just using vuepress css for now.
- [ ] Reversable Slide Transitions
- [ ] Across Slide Animations
- [ ] Extendable tranisitions between slides
- [ ] Progress Indicator
- [x] Use markdown to generate slideshows
- [x] Use vue transitions for slides and contents
- [x] Generate static sites, with code splitting
- [x] Live previews with HMR using the dev server

## Install

Setup a vuepress docs project.
Then install this package.

```
yarn add -S vuepress-theme-decks
```

In the `.vuepress/config.js` file, wrap your config with a wrapper from this theme:

```js
// .vuepress/config.js
const decksConfig = require("vuepress-theme-decks/config");
module.exports = decksConfig({
  // regular vuepress config here
  title: "Vuepress Slideshow",
  themeConfig: {
    // Define order of slides here
    slideOrder: ["/"]
  }
});
```
