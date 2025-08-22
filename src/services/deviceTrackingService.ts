diff --git a/src/services/deviceTrackingService.ts b/src/services/deviceTrackingService.ts
index 59139b65759982b0e5047f02eb9337d8ebfb9429..2413aedb46cdecc57d9db884d1d338ac746b1b1b 100644
--- a/src/services/deviceTrackingService.ts
+++ b/src/services/deviceTrackingService.ts
@@ -1,78 +1,86 @@
 import { supabase } from '../lib/supabaseClient';
 
 interface DeviceInfo {
   fingerprint: string;
   name?: string;
   type: 'desktop' | 'mobile' | 'tablet';
   browser: {
     name: string;
     version: string;
   };
   os: {
     name: string;
     version: string;
   };
   screen: {
     width: number;
     height: number;
     resolution: string;
   };
   timezone: string;
   language: string;
 }
 
+export interface Location {
+  city: string;
+  region: string;
+  country: string;
+  latitude: number;
+  longitude: number;
+}
+
 export interface UserDevice {
   id: string;
   deviceName?: string;
   deviceType: string;
   browserName: string;
   osName: string;
   isTrusted: boolean;
   lastSeenAt: string;
-  lastLocation?: any;
+  lastLocation?: Location;
   activeSessions: number;
 }
 
 export interface UserSession {
   id: string;
   deviceId: string;
   ipAddress: string;
   userAgent: string;
-  location?: any;
+  location?: Location;
   isActive: boolean;
   expiresAt: string;
   lastActivityAt: string;
   createdAt: string;
 }
 
 export interface ActivityLog {
   id: string;
   activityType: string;
   activityDetails?: any;
   ipAddress?: string;
-  location?: any;
+  location?: Location;
   riskScore: number;
   createdAt: string;
 }
 
 class DeviceTrackingService {
   // Get comprehensive device information
   async getDeviceInfo(): Promise<DeviceInfo> {
     const userAgent = navigator.userAgent;
     const screen = window.screen;
     
     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
     const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent) ||
                      (screen.width >= 768 && screen.width <= 1024);
     
     const deviceType: 'desktop' | 'mobile' | 'tablet' =
       isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
 
     const browserInfo = this.parseBrowserInfo(userAgent);
     const osInfo = this.parseOSInfo(userAgent);
 
     const fingerprintString = `${browserInfo.name}|${browserInfo.version}|${osInfo.name}|${screen.width}x${screen.height}|${Intl.DateTimeFormat().resolvedOptions().timeZone}|${navigator.language}`;
     
     const encoder = new TextEncoder();
     const data = encoder.encode(fingerprintString);
     const hashBuffer = await crypto.subtle.digest('SHA-256', data);
diff --git a/src/services/deviceTrackingService.ts b/src/services/deviceTrackingService.ts
index 59139b65759982b0e5047f02eb9337d8ebfb9429..2413aedb46cdecc57d9db884d1d338ac746b1b1b 100644
--- a/src/services/deviceTrackingService.ts
+++ b/src/services/deviceTrackingService.ts
@@ -126,74 +134,99 @@ class DeviceTrackingService {
     ];
 
     for (const system of systems) {
       const match = userAgent.match(system.regex);
       if (match) {
         const version = match[1] ? match[1].replace('_', '.') : '0.0';
         return { name: system.name, version };
       }
     }
 
     return { name: 'Unknown', version: '0.0' };
   }
 
   // Generate friendly device name
   private generateDeviceName(type: string, browser: string, os: string): string {
     const typeMap = {
       desktop: '🖥️',
       mobile: '📱',
       tablet: '📱'
     };
     
     return `${typeMap[type as keyof typeof typeMap] || '💻'} ${browser} on ${os}`;
   }
 
   /**
-   * @description A placeholder function to get the user's IP address without making external API calls.
-   * @returns A default IP address.
+   * @description Fetch the user's public IP address.
+   * @returns The IP address or '0.0.0.0' on failure.
    */
   async getUserIP(): Promise<string> {
-    console.warn('getUserIP: Skipping external IP lookup due to environment constraints or CORS.');
-    return '0.0.0.0';
+    try {
+      const response = await fetch('https://api.ipify.org?format=json');
+      if (!response.ok) {
+        throw new Error(`IP fetch failed: ${response.status}`);
+      }
+      const data: { ip?: string } = await response.json();
+      return data.ip || '0.0.0.0';
+    } catch (error) {
+      console.warn('getUserIP: Failed to fetch IP:', error);
+      return '0.0.0.0';
+    }
   }
 
   /**
-   * @description A placeholder function to get the user's location without making external API calls.
-   * @returns Always returns null.
+   * @description Fetch geolocation information for the given IP address.
+   * @returns A Location object or null on failure.
    */
-  async getLocationFromIP(ip: string): Promise<any> {
-    console.warn('getLocationFromIP: Skipping external location lookup due to environment constraints or CORS.');
-    return null;
+  async getLocationFromIP(ip: string): Promise<Location | null> {
+    try {
+      const response = await fetch(`https://ipapi.co/${ip}/json/`);
+      if (!response.ok) {
+        throw new Error(`Location fetch failed: ${response.status}`);
+      }
+      const data: any = await response.json();
+      const location: Location = {
+        city: data.city,
+        region: data.region,
+        country: data.country_name || data.country,
+        latitude: parseFloat(data.latitude),
+        longitude: parseFloat(data.longitude)
+      };
+      return location;
+    } catch (error) {
+      console.warn('getLocationFromIP: Failed to fetch location:', error);
+      return null;
+    }
   }
 
   // Register device for current user
   async registerDevice(userId: string): Promise<string | null> {
     try {
       const deviceInfo = await this.getDeviceInfo();
       
       let ip = '0.0.0.0';
-      let location = null;
+      let location: Location | null = null;
       
       try {
         ip = await this.getUserIP();
         if (ip !== '0.0.0.0') {
           location = await this.getLocationFromIP(ip);
         }
       } catch (networkError) {
         console.warn('Network requests failed during device registration:', networkError);
       }
 
       let data, error;
       
       try {
         const rpcResult = await supabase.rpc('register_device', {
           user_uuid: userId,
           device_fingerprint_param: deviceInfo.fingerprint,
           device_name_param: deviceInfo.name,
           device_type_param: deviceInfo.type,
           browser_name_param: deviceInfo.browser.name,
           browser_version_param: deviceInfo.browser.version,
           os_name_param: deviceInfo.os.name,
           os_version_param: deviceInfo.os.version,
           screen_resolution_param: deviceInfo.screen.resolution,
           timezone_param: deviceInfo.timezone,
           language_param: deviceInfo.language,
diff --git a/src/services/deviceTrackingService.ts b/src/services/deviceTrackingService.ts
index 59139b65759982b0e5047f02eb9337d8ebfb9429..2413aedb46cdecc57d9db884d1d338ac746b1b1b 100644
--- a/src/services/deviceTrackingService.ts
+++ b/src/services/deviceTrackingService.ts
@@ -254,51 +287,51 @@ class DeviceTrackingService {
             })
             .select('id')
             .single();
           
           data = insertData?.id;
           error = insertError;
         }
       }
 
       if (error) {
         console.error('Error registering device:', error);
         return null;
       }
 
       return data;
     } catch (error) {
       console.error('Error in registerDevice:', error);
       return null;
     }
   }
 
   // Create session for device
   async createSession(userId: string, deviceId: string, sessionToken: string): Promise<string | null> {
     try {
       let ip = '0.0.0.0';
-      let location = null;
+      let location: Location | null = null;
       
       try {
         ip = await this.getUserIP();
         if (ip !== '0.0.0.0') {
           location = await this.getLocationFromIP(ip);
         }
       } catch (networkError) {
         console.warn('Network requests failed during session creation:', networkError);
       }
 
       let data, error;
       
       try {
         const rpcResult = await supabase.rpc('create_session', {
           user_uuid: userId,
           device_uuid: deviceId,
           session_token_param: sessionToken,
           ip_address_param: ip,
           user_agent_param: navigator.userAgent,
           location_param: location
         });
         
         data = rpcResult.data;
         error = rpcResult.error;
       } catch (rpcError) {
diff --git a/src/services/deviceTrackingService.ts b/src/services/deviceTrackingService.ts
index 59139b65759982b0e5047f02eb9337d8ebfb9429..2413aedb46cdecc57d9db884d1d338ac746b1b1b 100644
--- a/src/services/deviceTrackingService.ts
+++ b/src/services/deviceTrackingService.ts
@@ -368,99 +401,99 @@ class DeviceTrackingService {
         error = updateError;
       }
 
       if (error) {
         console.error('Error ending session:', error);
         return false;
       }
 
       return true;
     } catch (error) {
       console.error('Error in endSession:', error);
       return false;
     }
   }
 
   // Log device activity
   async logActivity(
     userId: string,
     activityType: string,
     details?: any,
     deviceId?: string,
     sessionId?: string
   ): Promise<void> {
     try {
       let ip = '0.0.0.0';
-      let location = null;
+      let location: Location | null = null;
       
       try {
         ip = await this.getUserIP();
         if (ip !== '0.0.0.0') {
           location = await this.getLocationFromIP(ip);
         }
       } catch (networkError) {
         console.warn('Network requests failed during activity logging:', networkError);
       }
       
       const riskScore = await this.calculateRiskScore(userId, ip, location);
 
       try {
         await supabase.rpc('log_device_activity', {
           user_uuid: userId,
           device_uuid: deviceId,
           session_uuid: sessionId,
           activity_type_param: activityType,
           activity_details_param: details,
           ip_address_param: ip,
           location_param: location,
           user_agent_param: navigator.userAgent,
           risk_score_param: riskScore
         });
       } catch (rpcError) {
         console.warn('RPC function log_device_activity not available, using direct table insert:', rpcError);
         
         await supabase
           .from('device_activity_logs')
           .insert({
             user_id: userId,
             device_id: deviceId,
             session_id: sessionId,
             activity_type: activityType,
             activity_details: details,
             ip_address: ip,
             location: location,
             user_agent: navigator.userAgent,
             risk_score: riskScore
           });
       }
     } catch (error) {
       console.error('Error logging activity:', error);
     }
   }
 
   // Calculate risk score for activity
-  private async calculateRiskScore(userId: string, ip: string, location: any): Promise<number> {
+  private async calculateRiskScore(userId: string, ip: string, location: Location | null): Promise<number> {
     try {
       try {
         const { data, error } = await supabase.rpc('detect_suspicious_activity', {
           user_uuid: userId,
           ip_address_param: ip,
           location_param: location,
           user_agent_param: navigator.userAgent
         });
 
         if (error) {
           if (error.message?.includes('function') || error.message?.includes('does not exist')) {
             console.warn('Risk scoring function not available, using default score');
             return 0;
           }
           console.error('Error calculating risk score:', error);
           return 0;
         }
 
         return data || 0;
       } catch (rpcError) {
         console.warn('Risk scoring RPC call failed, using default score:', rpcError);
         return 0;
       }
     } catch (error) {
       console.error('Error in calculateRiskScore:', error);
