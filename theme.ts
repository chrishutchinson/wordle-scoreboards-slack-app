import { Theme } from "theme-ui";

export const theme: Theme = {
  colors: {
    text: "#333",
    background: "#fff",
    mutedBackground: "#f3f3f3",
    primary: "#333",
    secondary: "#333",
    mutedText: "#555",
  },
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    heading:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    monospace:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
  fontWeights: {
    body: 400,
    heading: 900,
    subHeading: 400,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  text: {
    heading: {
      fontFamily: "heading",
      fontWeight: "heading",
    },
    subheading: {
      fontFamily: "heading",
      fontWeight: "subheading",
      color: "mutedText",
    },
    paragraph: {
      marginBottom: 3,
    },
  },
  fontSizes: [14, 16, 20, 24, 32, 48, 64, 72],
  layout: {
    container: {
      maxWidth: 1024,
      paddingLeft: 3,
      paddingRight: 3,
    },
    heading: {
      marginBottom: 4,
    },
    "heading-small": {
      marginBottom: 2,
    },
  },
  styles: {
    root: {
      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body",
    },
    hr: {
      marginTop: 4,
      marginBottom: 5,
      width: "100%",
      maxWidth: "700px",
      height: "1px",
      marginLeft: "auto",
      marginRight: "auto",
      color: "primary",
    },
  },
};
