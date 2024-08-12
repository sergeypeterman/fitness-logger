import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Fitness Logger app</title>
      </Head>

      <Component {...pageProps} />
    </>
  );
}
