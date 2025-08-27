import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <title>IMS</title>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="stylesheet" href="/css/styles.css" />
        <link rel="stylesheet" href="/css/custom.css" />
        <link rel="icon" href="/images/favicon.png" />
      </head>
      <body>
        <NextTopLoader color="#181817" initialPosition={0.1} height={3} shadow={"0 0 10px #181817,0 0 5px #181817"} showSpinner={false} zIndex={9999} />
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
