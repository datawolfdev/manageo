import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fr" className={`w-full h-full`}>
      <Head />
      <body className={`w-full h-full`}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
