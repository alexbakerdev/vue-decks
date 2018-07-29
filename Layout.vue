<template>
  <div id="wrapper">
    <div class="theme-container">
      <Transition ref="pageTransitioner" name="rotate">
        <Content class="content-container"/>
      </Transition>
    </div>
  </div>
</template>

<script>
import { normalize, ensureExt, resolvePage } from "./util";

const FuncWrap = {
  functional: true,
  render: function(createElement, context) {
    function walkChildren(vnode) {
      if (vnode.children) {
        vnode.children = vnode.children.map(walkChildren);
      }

      return vnode;
    }

    return context.slots();
  }
};

export default {
  components: { FuncWrap },
  data() {
    return {
      direction: 0,
      nextScopeId: ""
    };
  },
  mounted() {
    document.addEventListener("keyup", this.keyListener);
    if (!parseInt(this.$route.query.step)) {
      this.changeRoute({ step: 0 });
    }
  },
  destroyed() {
    document.removeEventListener("keyup", this.keyListener);
  },
  methods: {
    changeRoute({ path, step }) {
      if (path && typeof step !== "undefined") {
        return this.$router.push({ path, query: { step } });
      }

      if (path) {
        return this.$router.push({ path, query: { step: 0 } });
      }

      if (typeof step !== "undefined") {
        return this.$router.push({ path: this.$route.path, query: { step } });
      }
    },
    findPath(offset) {
      const page = this.orderedPages[this.currentPageIndex + offset];
      if (page) return ensureExt(page.path);
    },
    keyListener(e) {
      if (e.code === "ArrowRight" || e.code === "Space") {
        if (parseInt(this.$route.query.step) >= this.stepsCount) {
          this.direction = 1;
          this.changeRoute({ path: this.findPath(1) });
        } else {
          this.changeRoute({ step: parseInt(this.$route.query.step) + 1 });
        }
      }

      if (e.code === "ArrowLeft") {
        if (parseInt(this.$route.query.step) <= 0) {
          this.direction = -1;
          this.changeRoute({
            path: this.findPath(-1),
            step: this.orderedPages[this.currentPageIndex - 1].frontmatter.steps
          });
        } else {
          this.changeRoute({ step: parseInt(this.$route.query.step) - 1 });
        }
      }
    }
  },
  computed: {
    orderedPages() {
      const sitePages = this.$site.pages.reduce((pages, page) => {
        pages[normalize(page.path)] = page;
        return pages;
      }, {});
      return this.$site.themeConfig.slideOrder.map(
        path => sitePages[normalize(path)]
      );
    },
    slideOrder() {
      if (this.$site.themeConfig && this.$site.themeConfig.slideOrder) {
        return this.$site.themeConfig.slideOrder;
      }

      console.warn(`[vuepress-theme-decks] no themeConfig slideOrder defined`);
      return [];
    },
    currentPageIndex() {
      return this.orderedPages.findIndex(page => {
        return normalize(page.path) === normalize(this.$route.path);
      });
    },
    transitionType() {
      let transitionName = "rotate";

      if (this.direction >= 0) {
        return (transitionName += "-forward");
      }

      if (this.direction <= -1) {
        return (transitionName += "-backward");
      }
    },
    stepsCount() {
      if (this.$page.frontmatter.steps) {
        return this.$page.frontmatter.steps;
      }
      console.warn(
        `[vuepress-theme-decks] the current slide '${
          this.$route.path
        }' has no steps defined`
      );
      return 0;
    }
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

li {
  transition: all 0.5s;
  margin-right: 10px;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateX(100vw);
}

.list-leave-active {
  position: absolute;
}

.theme-container {
  overflow: hidden;
  perspective: 600px;
  perspective-origin: 480px 280px;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: flex-start;
  padding: 100px 150px;
  box-sizing: border-box;
}

.content.custom.content-container {
  width: calc(100% - 300px);
  max-width: 780px;
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-backward-enter-active,
.slide-backward-leave-active,
.slide-forward-enter-active,
.slide-forward-leave-active {
  transform-style: preserve-3d;
  transition: transform 0.5s, opacity 0.5s;
}

.slide-backward-leave-to,
.slide-backward-enter,
.slide-forward-leave-to,
.slide-forward-enter {
  opacity: 0;
}

.slide-forward-leave-to,
.slide-backward-enter {
  transform: translateX(-100%);
}

.slide-forward-enter,
.slide-backward-leave-to {
  transform: translateX(100%);
}

.rotate-enter-active {
  animation: rotate-in 1s;
}

.rotate-leave-active {
  animation: rotate-out 1s;
}

@keyframes rotate-in {
  0% {
    transform: translate3d(100%, 0, 0) rotateY(90deg) translate3d(100%, 0, 0);
    opacity: 0;
  }
  100% {
    transform: none;
    opacity: 1;
  }
}

@keyframes rotate-out {
  0% {
    transform: none;
    opacity: 1;
  }
  100% {
    transform: translate3d(-100%, 0, 0) rotateY(-90deg) translate3d(-100%, 0, 0);
    opacity: 0;
  }
}
</style>
<style src="prismjs/themes/prism-tomorrow.css"></style>
<style src="./styles/theme.styl" lang="stylus"></style>
