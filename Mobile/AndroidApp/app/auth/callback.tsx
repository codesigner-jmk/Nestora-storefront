import { Loading } from "../../components/Screen";

// Expo Router receives the native OAuth deep link as a route. The login screen
// completes the PKCE exchange when WebBrowser.openAuthSessionAsync resolves.
export default function AuthCallback() {
  return <Loading />;
}
