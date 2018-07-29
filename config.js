module.exports = function(config) {
  const markdownConfigurator = md => {
    // use more markdown-it plugins!
    md.use(require("markdown-it-attrs")).use(function attributes(md, options) {
      function vueDecksAttributes(state) {
        let tokens = state.tokens;

        applyTokens(tokens, (token, index, siblings) => {
          if (token.attrGet("v-magic")) {
            const transitionOpenToken = new state.Token(
              "transition_open",
              "Transition",
              1
            );
            const transitionCloseToken = new state.Token(
              "transition_close",
              "Transition",
              -1
            );

            transitionOpenToken.attrSet("name", token.attrGet("v-magic"));
            token.attrs.splice(
              token.attrs.findIndex(value => {
                return value[0] === "v-magic";
              }),
              1
            );

            let closePosition;

            if (token.nesting === 0) {
              closePosition = index + 2;
            }

            let closeType = token.type.replace("_open", "_close");

            for (
              let closeIndex = index;
              closeIndex < siblings.length;
              closeIndex++
            ) {
              let sibling = siblings[closeIndex];

              if (sibling.type === closeType) {
                closePosition = closeIndex + 2;
                break;
              }
            }

            siblings.splice(index, 0, transitionOpenToken);
            siblings.splice(closePosition, 0, transitionCloseToken);
          }
        });
      }
      function applyTokens(tokens, fn) {
        for (let index = 0; index < tokens.length; index++) {
          let token = tokens[index];

          if (token.children && token.children.length) {
            applyTokens(token.children, fn);
          }
          fn(token, index, tokens);
        }
      }
      md.core.ruler.after(
        "smartquotes",
        "vuedecks_attributes",
        vueDecksAttributes
      );
    });
  };

  let markdownConfigFn = markdownConfigurator;
  if (config.markdown && config.markdown.config) {
    const userMarkdownConfig = config.markdown;
    markdownConfigFn = md => markdownConfigurator(md) && userMarkdownConfig(md);
  }

  config.markdown = config.markdown || {};

  config.markdown.anchor = config.markdown.anchor || {
    permalink: false
  };
  config.markdown.config = markdownConfigFn;

  config.theme = "decks";

  return config;
};
