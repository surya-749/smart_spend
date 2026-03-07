"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useSession } from "next-auth/react";

// ─── BLE Constants ────────────────────────────────────────────────────────────
const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const CHAR_UUID = "abcd1234-ab12-ab12-ab12-abcdef123456";
const SYNC_INTERVAL_MS = 30_000;

// ─── Types ────────────────────────────────────────────────────────────────────
export type ConnectionStatus = "disconnected" | "connecting" | "connected";

export interface WalletData {
    balance: number;
    income: number;
    expense: number;
    savings_pct: number;
    top_cat: string;
    warning: string;
    name: string;
}

export interface LastLocation {
    lat: number;
    lng: number;
    address: string | null;
    savedAt: string;
}

interface BLEContextValue {
    status: ConnectionStatus;
    walletData: WalletData | null;
    lastLocation: LastLocation | null;
    syncLog: string[];
    locationError: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    resync: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const BLEContext = createContext<BLEContextValue | null>(null);

export function useBLE() {
    const ctx = useContext(BLEContext);
    if (!ctx) throw new Error("useBLE must be inside BLEProvider");
    return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function BLEProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status: sessionStatus } = useSession();

    const [status, setStatus] = useState<ConnectionStatus>("disconnected");
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [lastLocation, setLastLocation] = useState<LastLocation | null>(null);
    const [syncLog, setSyncLog] = useState<string[]>([]);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Refs survive re-renders and page navigations (provider never unmounts)
    const deviceRef = useRef<any>(null);
    const charRef = useRef<any>(null);
    const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const addLog = (msg: string) =>
        setSyncLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));

    // ── Fetch last GPS on mount ───────────────────────────────────────────────
    useEffect(() => {
        if (sessionStatus !== "authenticated") return;
        fetch("/api/wallet/location")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => { if (d?.location) setLastLocation(d.location); })
            .catch(() => { });
    }, [sessionStatus]);

    // ── Fetch wallet data ─────────────────────────────────────────────────────
    const fetchWalletData = useCallback(async (): Promise<WalletData | null> => {
        try {
            const res = await fetch("/api/wallet/data");
            if (res.status === 401) { addLog("✗ Not signed in — please log in"); return null; }
            if (!res.ok) { addLog(`✗ API error ${res.status}`); return null; }
            return await res.json();
        } catch (err: any) {
            addLog(`✗ Network error: ${err?.message}`);
            return null;
        }
    }, []);

    // ── Push data to ESP32 ────────────────────────────────────────────────────
    const pushToWallet = useCallback(async (data: WalletData) => {
        if (!charRef.current) return;
        const encoded = new TextEncoder().encode(JSON.stringify(data));
        try {
            await charRef.current.writeValue(encoded);
            addLog("✓ Data sent to wallet");
        } catch (err: any) {
            addLog(`✗ BLE write failed: ${err?.message}`);
        }
    }, []);

    // ── Save GPS ──────────────────────────────────────────────────────────────
    const saveGPS = useCallback(() => {
        if (!navigator.geolocation) return;
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const { latitude: lat, longitude: lng } = coords;
                let address: string | null = null;
                try {
                    const r = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                    );
                    const d = await r.json();
                    address = d.display_name ?? null;
                } catch { }
                try {
                    await fetch("/api/wallet/location", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ lat, lng, address }),
                    });
                    setLastLocation({ lat, lng, address, savedAt: new Date().toISOString() });
                    addLog("📍 Location saved");
                } catch {
                    setLocationError("Failed to save location");
                }
            },
            (err) => setLocationError(`GPS error: ${err.message}`)
        );
    }, []);

    // ── Handle BLE disconnect ─────────────────────────────────────────────────
    const handleDisconnected = useCallback(() => {
        setStatus("disconnected");
        charRef.current = null;
        if (syncTimerRef.current) { clearInterval(syncTimerRef.current); syncTimerRef.current = null; }
        addLog("Wallet disconnected — saving location...");
        saveGPS();
    }, [saveGPS]);

    // ── Connect ───────────────────────────────────────────────────────────────
    const connect = useCallback(async () => {
        if (!("bluetooth" in navigator)) {
            alert("Web Bluetooth is not supported. Use Chrome or Edge.");
            return;
        }
        if (sessionStatus !== "authenticated") {
            alert("Please sign in first.");
            return;
        }

        setStatus("connecting");
        addLog("Scanning for SmartWallet...");

        try {
            const device = await (navigator as any).bluetooth.requestDevice({
                filters: [{ services: [SERVICE_UUID] }],
                optionalServices: [SERVICE_UUID],
            });
            deviceRef.current = device;
            device.addEventListener("gattserverdisconnected", handleDisconnected);

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(SERVICE_UUID);
            const char = await service.getCharacteristic(CHAR_UUID);
            charRef.current = char;
            setStatus("connected");
            addLog("✓ Connected — fetching your data...");

            // Push immediately
            const data = await fetchWalletData();
            if (data) { setWalletData(data); await pushToWallet(data); }

            // Periodic sync every 30s
            syncTimerRef.current = setInterval(async () => {
                const fresh = await fetchWalletData();
                if (fresh) { setWalletData(fresh); await pushToWallet(fresh); }
            }, SYNC_INTERVAL_MS);

        } catch (err: any) {
            setStatus("disconnected");
            addLog(`✗ ${err?.message ?? "Connection failed"}`);
        }
    }, [sessionStatus, handleDisconnected, fetchWalletData, pushToWallet]);

    // ── Disconnect ────────────────────────────────────────────────────────────
    const disconnect = useCallback(() => {
        if (deviceRef.current?.gatt?.connected) {
            deviceRef.current.gatt.disconnect();
        }
    }, []);

    // ── Manual resync ─────────────────────────────────────────────────────────
    const resync = useCallback(async () => {
        if (status !== "connected") return;
        const data = await fetchWalletData();
        if (data) { setWalletData(data); await pushToWallet(data); }
    }, [status, fetchWalletData, pushToWallet]);

    // ── Cleanup on unmount (never happens since it's in root layout) ──────────
    useEffect(() => () => {
        if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    }, []);

    return (
        <BLEContext.Provider value={{
            status, walletData, lastLocation, syncLog, locationError,
            connect, disconnect, resync,
        }}>
            {children}
        </BLEContext.Provider>
    );
}
