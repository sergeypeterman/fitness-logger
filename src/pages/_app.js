import "@/styles/globals.css";
import Head from "next/head";

import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Fitness Logger app</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Cuprum:wght@700&family=Rambla:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
