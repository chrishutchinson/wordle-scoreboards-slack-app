import { Provider } from "next-auth/client";
import { ThemeProvider } from "theme-ui";
import { theme } from "../theme";
import { usePanelbear } from "@panelbear/panelbear-nextjs";
import { config } from "../lib/config/config";
import { AppProps } from "next/app";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  usePanelbear(config.panelbear.siteId);

  return (
    <Provider session={session}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  );
}
