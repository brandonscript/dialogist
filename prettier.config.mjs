import straightQuotes from "./scripts/prettier-plugin-straight-quotes.mjs";

export default {
  plugins: [straightQuotes],
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  bracketSpacing: true,
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
    },
  ],
};
