import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import "react-datetime/css/react-datetime.css";
import MainWrapper from "@/components/main-wrapper";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead.bs5.css";
import { CountsProvider } from "@/lib/use-counts";

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
        <CountsProvider>
          <MainWrapper children={children} />
        </CountsProvider>
        <script src="/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
  );
};

export default RootLayout;
