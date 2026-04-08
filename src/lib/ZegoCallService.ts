/**
 * ZegoCallService
 *
 * Next.js / TypeScript port of the Flutter ZegoCallService.
 * Requires: npm install @zegocloud/zego-uikit-prebuilt
 */

import { ZegoCallConfig, ZegoUser } from "@/config/ZegoCallConfig";

// ─── Local type definitions (no reliance on SDK's missing .d.ts) ──────────────

type ZegoScenario = "OneONoneCall" | "GroupCall" | "VideoConference";

interface ZegoRoomConfig {
  container?: HTMLElement | null;
  scenario?: { mode: string };
  turnOnMicrophoneWhenJoining?: boolean;
  turnOnCameraWhenJoining?: boolean;
  showMyCameraToggleButton?: boolean;
  showMyMicrophoneToggleButton?: boolean;
  showAudioVideoSettingsButton?: boolean;
  showScreenSharingButton?: boolean;
  showTextChat?: boolean;
  showUserList?: boolean;
  maxUsers?: number;
  layout?: "Default" | "Grid" | "Sidebar";
  showLayoutButton?: boolean;
  onLeaveRoom?: () => void;
}

interface ZegoInstance {
  joinRoom(config: ZegoRoomConfig): void;
  destroy(): void;
}

interface ZegoSDK {
  ZegoUIKitPrebuiltCall: {
    generateKitTokenForTest(
      appId: number,
      serverSecret: string,
      roomId: string,
      userId: string,
      userName: string,
      expire?: number,
    ): string;
    create(kitToken: string): ZegoInstance;
  };
  ZegoUIKitScenario: Record<string, string>;
}

// ─── Lazy loader (avoids SSR crash + sidesteps missing .d.ts) ────────────────

let _sdk: ZegoSDK | null = null;

async function loadSDK(): Promise<ZegoSDK> {
  if (_sdk) return _sdk;
  if (typeof window === "undefined") {
    throw new Error("[ZegoCallService] Must be used in the browser only.");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = await import("@zegocloud/zego-uikit-prebuilt" as any);
  _sdk = mod as ZegoSDK;
  return _sdk;
}

// ─── Service singleton ────────────────────────────────────────────────────────

class ZegoCallServiceClass {
  private _initialized = false;
  private _currentUser: ZegoUser | null = null;

  /** Equivalent to Flutter's initForCurrentUser() */
  async initForCurrentUser(user: ZegoUser): Promise<void> {
    if (this._initialized) return;

    if (!ZegoCallConfig.appId || !ZegoCallConfig.appSign) {
      console.warn("[ZegoCallService] Missing appId or appSign in config.");
      return;
    }

    await loadSDK();

    this._currentUser = user;
    this._initialized = true;
    console.info("[ZegoCallService] Initialized for user:", user.userId);
  }

  /** Equivalent to Flutter's uninit() */
  uninit(): void {
    if (!this._initialized) return;
    this._currentUser = null;
    this._initialized = false;
    console.info("[ZegoCallService] Uninitialized.");
  }

  async joinCall(
    container: HTMLElement,
    roomId: string,
    scenario: ZegoScenario = "OneONoneCall",
    onLeave?: () => void,
  ): Promise<void> {
    if (!this._initialized || !this._currentUser) {
      throw new Error("[ZegoCallService] Call initForCurrentUser() first.");
    }

    const { ZegoUIKitPrebuiltCall, ZegoUIKitScenario } = await loadSDK();

    const userId = String(this._currentUser.userId);
    const userName =
      this._currentUser.fullName?.trim() || this._currentUser.email;

    // ⚠️ Dev only — replace with a backend token endpoint in production
    const kitToken = ZegoUIKitPrebuiltCall.generateKitTokenForTest(
      ZegoCallConfig.appId,
      ZegoCallConfig.appSign,
      roomId,
      userId,
      userName,
    );

    ZegoUIKitPrebuiltCall.create(kitToken).joinRoom({
      container,
      scenario: { mode: ZegoUIKitScenario[scenario] },
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: scenario === "OneONoneCall",
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: scenario !== "OneONoneCall",
      showTextChat: true,
      showUserList: scenario !== "OneONoneCall",
      maxUsers: scenario === "OneONoneCall" ? 2 : 10,
      layout: scenario === "OneONoneCall" ? "Default" : "Grid",
      showLayoutButton: scenario !== "OneONoneCall",
      onLeaveRoom: () => onLeave?.(),
    });
  }

  get isInitialized() {
    return this._initialized;
  }

  get currentUser() {
    return this._currentUser;
  }
}

export const ZegoCallService = new ZegoCallServiceClass();

// /**
//  * ZegoCallService
//  *
//  * Next.js / TypeScript port of the Flutter ZegoCallService.
//  * Requires: npm install @zegocloud/zego-uikit-prebuilt
//  * Types:    src/types/zegocloud.d.ts
//  */

// import { ZegoCallConfig, ZegoUser } from "@/config/ZegoCallConfig";

// // Lazily loaded to avoid SSR crashes (Zego SDK is browser-only)
// type ZegoModule = typeof import("@zegocloud/zego-uikit-prebuilt");
// let _sdk: ZegoModule | null = null;

// async function loadSDK(): Promise<ZegoModule> {
//   if (_sdk) return _sdk;
//   if (typeof window === "undefined") {
//     throw new Error("[ZegoCallService] Must be used in the browser only.");
//   }
//   _sdk = await import("@zegocloud/zego-uikit-prebuilt");
//   return _sdk;
// }

// // ─── Service singleton ────────────────────────────────────────────────────────

// class ZegoCallServiceClass {
//   private _initialized = false;
//   private _currentUser: ZegoUser | null = null;

//   /** Equivalent to Flutter's initForCurrentUser() */
//   async initForCurrentUser(user: ZegoUser): Promise<void> {
//     if (this._initialized) return;

//     if (!ZegoCallConfig.appId || !ZegoCallConfig.appSign) {
//       console.warn("[ZegoCallService] Missing appId or appSign in config.");
//       return;
//     }

//     // Pre-load SDK so joinCall() feels instant
//     await loadSDK();

//     this._currentUser = user;
//     this._initialized = true;
//     console.info("[ZegoCallService] Initialized for user:", user.userId);
//   }

//   /** Equivalent to Flutter's uninit() */
//   uninit(): void {
//     if (!this._initialized) return;
//     this._currentUser = null;
//     this._initialized = false;
//     console.info("[ZegoCallService] Uninitialized.");
//   }

//   /**
//    * Mount the Zego call UI into a container element.
//    *
//    * @param container - DOM node that hosts the call UI
//    * @param roomId    - Unique room/call ID
//    * @param scenario  - OneONoneCall | GroupCall | VideoConference
//    * @param onLeave   - Called when the user leaves
//    */
//   async joinCall(
//     container: HTMLElement,
//     roomId: string,
//     scenario: "OneONoneCall" | "GroupCall" | "VideoConference" = "OneONoneCall",
//     onLeave?: () => void,
//   ): Promise<void> {
//     if (!this._initialized || !this._currentUser) {
//       throw new Error("[ZegoCallService] Call initForCurrentUser() first.");
//     }

//     const { ZegoUIKitPrebuiltCall, ZegoUIKitScenario } = await loadSDK();

//     const userId = String(this._currentUser.userId);
//     const userName =
//       this._currentUser.fullName?.trim() || this._currentUser.email;

//     // ⚠️  generateKitTokenForTest is for development only.
//     //     In production, fetch the token from your own backend.
//     const kitToken = ZegoUIKitPrebuiltCall.generateKitTokenForTest(
//       ZegoCallConfig.appId,
//       ZegoCallConfig.appSign,
//       roomId,
//       userId,
//       userName,
//     );

//     ZegoUIKitPrebuiltCall.create(kitToken).joinRoom({
//       container,
//       scenario: { mode: ZegoUIKitScenario[scenario] },
//       turnOnMicrophoneWhenJoining: true,
//       turnOnCameraWhenJoining: scenario === "OneONoneCall",
//       showMyCameraToggleButton: true,
//       showMyMicrophoneToggleButton: true,
//       showAudioVideoSettingsButton: true,
//       showScreenSharingButton: scenario !== "OneONoneCall",
//       showTextChat: true,
//       showUserList: scenario !== "OneONoneCall",
//       maxUsers: scenario === "OneONoneCall" ? 2 : 10,
//       layout: scenario === "OneONoneCall" ? "Default" : "Grid",
//       showLayoutButton: scenario !== "OneONoneCall",
//       onLeaveRoom: () => onLeave?.(),
//     });
//   }

//   get isInitialized() {
//     return this._initialized;
//   }
//   get currentUser() {
//     return this._currentUser;
//   }
// }

// // Singleton export — mirrors the static class pattern in Flutter
// export const ZegoCallService = new ZegoCallServiceClass();
