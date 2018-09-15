module.exports = function(config) {
  const markdownConfigurator = md => {
    // use more markdown-it plugins!
    md.use(require("./markdown/index.js")).use(function attributes(md) {
      const fence = md.renderer.rules.fence;
      md.renderer.rules.fence = (...args) => {
        const [tokens, idx, options, env, slf] = args;
        const token = tokens[idx];
        const rawCode = fence(...args);
        const updatedCode = `<div ${slf.renderAttrs(token)}>${rawCode}</div>`;
        return updatedCode;
      };
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
