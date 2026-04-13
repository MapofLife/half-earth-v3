import Portal from "@arcgis/core/portal/Portal"
import { createContext, useEffect, useState } from "react"

const AuthorizationContext = createContext();

function AuthorizationProvider(props) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const portal = new Portal();
    portal.authMode = 'immediate';
    portal.load().then(async (response) => {
      setIsAuthorized(true);
    });
  }, [])


  return (
    <AuthorizationContext.Provider value={{ isAuthorized, setIsAuthorized }}>
      {props.children}
    </AuthorizationContext.Provider>
  );
}

export { AuthorizationContext, AuthorizationProvider };
