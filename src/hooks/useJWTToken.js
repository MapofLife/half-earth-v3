import Portal from "@arcgis/core/portal/Portal"
import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing JWT tokens from Clerk
 * Handles token caching, refresh, and provides a consistent interface
 */
const useJWTToken = () => {
  const [cachedToken, setCachedToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get a fresh token from Clerk session
  const getFreshToken = useCallback(async () => {
    try {
      const token = await getEsriToken();
      if (!token) {
        throw new Error("Failed to get token from session");
      }

      // Decode token to get expiry time
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        setTokenExpiry(expiryTime);
        setCachedToken(token);
        return token;
      } catch (decodeError) {
        console.warn("Could not decode JWT payload:", decodeError);
        setCachedToken(token);
        return token;
      }
    } catch (error) {
      console.error("Error getting fresh token:", error);
      throw error;
    }
  }, []);

  // Check if token needs refresh (refresh 5 minutes before expiry)
  const needsRefresh = useCallback(() => {
    if (!tokenExpiry) return false;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return now >= tokenExpiry - fiveMinutes;
  }, [tokenExpiry]);

  // Get current valid token (cached or fresh)
  const getToken = useCallback(async () => {
    // If we have a cached token and it doesn't need refresh, return it
    if (cachedToken && !needsRefresh()) {
      return cachedToken;
    }

    // If we're already refreshing, wait for it to complete
    if (isRefreshing) {
      // Wait for refresh to complete (with timeout)
      const startTime = Date.now();
      while (isRefreshing && Date.now() - startTime < 10000) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (cachedToken) return cachedToken;
    }

    // Get fresh token
    setIsRefreshing(true);
    try {
      const token = await getFreshToken();
      setIsRefreshing(false);
      return token;
    } catch (error) {
      setIsRefreshing(false);
      throw error;
    }
  }, [
    cachedToken,
    needsRefresh,
    isRefreshing,
    getFreshToken,
  ]);

  // Clear cached token when user signs out
  const getEsriToken = useCallback(async () => {
    console.log('Getting Esri token...');
    const portal = new Portal();
    portal.authMode = 'immediate';
    await portal.load();
    // Get user's credential
    console.log('Getting credential from portal...');
    const refreshedCredential = await portal.credential.refreshToken();
    console.log('Token refreshed:', refreshedCredential.token);
    return refreshedCredential.token;
  }, []);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!cachedToken || !tokenExpiry) return;

    const checkInterval = setInterval(() => {
      if (needsRefresh()) {
        getFreshToken().catch((error) => {
          console.error("Auto-refresh token failed:", error);
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [cachedToken, tokenExpiry, needsRefresh, getFreshToken]);

  return {
    getToken,
    isRefreshing,
    hasToken: !!cachedToken,
    tokenExpiry,
    getEsriToken,
  };
};

export default useJWTToken;
