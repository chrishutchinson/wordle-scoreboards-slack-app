import { Provider } from "next-auth/client";
import { ThemeProvider } from "theme-ui";
import { theme } from "../theme";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <Provider session={session}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  );
}
