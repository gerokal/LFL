module.exports = function (eleventyConfig) {
  // Passthrough copy static assets
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("data");
  eleventyConfig.addPassthroughCopy(".htaccess");
  eleventyConfig.addPassthroughCopy("manifest.json");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("sw.js");

  // Watch CSS and JS for changes (processed by PostCSS/terser via npm scripts)
  eleventyConfig.addWatchTarget("css/");
  eleventyConfig.addWatchTarget("scripts/");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
