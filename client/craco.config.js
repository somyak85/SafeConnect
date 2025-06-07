const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fallbacks
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        buffer: require.resolve("buffer/"),
        path: require.resolve("path-browserify"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util/"),
        assert: require.resolve("assert/"),
        zlib: require.resolve("browserify-zlib"),
        process: require.resolve("process/browser"),
      };

      // Plugins
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );

      // Suppress source-map-loader warnings for @nsfw-filter/nsfwjs
      webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
        if (rule.use) {
          rule.use = rule.use.map((useEntry) => {
            if (
              typeof useEntry === "object" &&
              useEntry.loader &&
              useEntry.loader.includes("source-map-loader")
            ) {
              return {
                ...useEntry,
                options: {
                  ...useEntry.options,
                  filterSourceMappingUrl: (url, resourcePath) => {
                    if (resourcePath.includes("@nsfw-filter/nsfwjs")) {
                      return false;
                    }
                    return true;
                  },
                },
              };
            }
            return useEntry;
          });
        }
        return rule;
      });

      return webpackConfig;
    },
  },
};
