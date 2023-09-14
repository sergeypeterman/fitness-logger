import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <title>Fitness Logger app</title>
      <Component {...pageProps} />
    </>
  );
}
