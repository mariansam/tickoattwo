"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("next-auth/react");
const api_1 = require("~/utils/api");
require("~/styles/globals.css");
const MyApp = ({ Component, pageProps: { session, ...pageProps }, }) => {
    return (<react_1.SessionProvider session={session}>
            <Component {...pageProps}/>
        </react_1.SessionProvider>);
};
exports.default = api_1.api.withTRPC(MyApp);
