import { useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced locations with country codes for flags and currencies
// All amounts are $200K minimum and range upwards for high-value B2B transactions
// Only using supported currencies: USD, CNY, EUR, GBP, AUD, NZD, SGD, HKD, JPY, CHF
const LOCATIONS = [
    { name: "New York", code: "us", lat: 40.7128, lon: -74.0060, currency: "USD", amount: "$825K", sender: "TechFlow Solutions" },
    { name: "London", code: "gb", lat: 51.5074, lon: -0.1278, currency: "GBP", amount: "£640K", sender: "Sterling Logistics" },
    { name: "Tokyo", code: "jp", lat: 35.6762, lon: 139.6503, currency: "JPY", amount: "¥92M", sender: "Sakura Industries" },
    { name: "Singapore", code: "sg", lat: 1.3521, lon: 103.8198, currency: "SGD", amount: "S$550K", sender: "Pacific Trade Co." },
    { name: "Paris", code: "fr", lat: 48.8566, lon: 2.3522, currency: "EUR", amount: "€1.2M", sender: "Lumiere Fashion" },
    { name: "São Paulo", code: "br", lat: -23.5505, lon: -46.6333, currency: "USD", amount: "$780K", sender: "Horizonte Imports" },
    { name: "Mumbai", code: "in", lat: 19.0760, lon: 72.8777, currency: "USD", amount: "$920K", sender: "Deccan Systems" },
    { name: "Lagos", code: "ng", lat: 6.5244, lon: 3.3792, currency: "GBP", amount: "£485K", sender: "Vantage Global" },
    { name: "Sydney", code: "au", lat: -33.8688, lon: 151.2093, currency: "AUD", amount: "A$720K", sender: "Harbour Capital" },
    { name: "Cape Town", code: "za", lat: -33.9249, lon: 18.4241, currency: "EUR", amount: "€650K", sender: "Summit Holdings" },
    { name: "Dubai", code: "ae", lat: 25.2048, lon: 55.2708, currency: "USD", amount: "$1.1M", sender: "Oasis Ventures" },
    { name: "Toronto", code: "ca", lat: 43.6532, lon: -79.3832, currency: "USD", amount: "$950K", sender: "Maple Leaf Tech" },
    { name: "Seoul", code: "kr", lat: 37.5665, lon: 126.9780, currency: "CNY", amount: "¥5.8M", sender: "Haneul Electronics" },
    { name: "Berlin", code: "de", lat: 52.5200, lon: 13.4050, currency: "EUR", amount: "€780K", sender: "Axios GmbH" },
    { name: "Mexico City", code: "mx", lat: 19.4326, lon: -99.1332, currency: "USD", amount: "$850K", sender: "Solaris Group" },
    { name: "Jakarta", code: "id", lat: -6.2088, lon: 106.8456, currency: "SGD", amount: "S$1.2M", sender: "Nusantara Export" },
];

interface Transaction {
    id: string;
    source: typeof LOCATIONS[0];
    target: typeof LOCATIONS[0];
    progress: number;
    state: 'preparing' | 'sending' | 'completed';
    amount: string;
}

export const HeroGlobeWrapper = () => {
    const [geoJson, setGeoJson] = useState<any>(null);

    useEffect(() => {
        fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
            .then(res => res.json())
            .then(worldData => {
                setGeoJson(topojson.feature(worldData, worldData.objects.countries));
            })
            .catch(err => console.error("Failed to load globe data", err));
    }, []);

    if (!geoJson) return <div className="w-[800px] h-[800px]" />;

    return <HeroRotatingGlobe geoJson={geoJson} size={800} />;
};


const HeroRotatingGlobe = ({ geoJson, size }: { geoJson: any; size: number }) => {
    const [rotation, setRotation] = useState([0, -20]); // [lambda, phi]
    const [scale, setScale] = useState(size / 2 - 10);
    const [globeOpacity, setGlobeOpacity] = useState(0); // 0 = transparent bottom
    const [activeTx, setActiveTx] = useState<Transaction | null>(null);
    const [recentTx, setRecentTx] = useState<Transaction | null>(null);
    const [highlightFeature, setHighlightFeature] = useState<any>(null); // For filling the target country

    // Create d3 projection
    const projection = useMemo(() => {
        return d3.geoOrthographic()
            .translate([size / 2, size / 2])
            .rotate(rotation as [number, number])
            .scale(scale);
    }, [size, rotation, scale]);

    const pathGenerator = useMemo(() => d3.geoPath().projection(projection), [projection]);

    // Memoize visible locations to reduce calculations
    const visibleLocations = useMemo(() => {
        const path = d3.geoPath().projection(projection);
        return LOCATIONS.map(loc => ({
            ...loc,
            coords: projection([loc.lon, loc.lat]),
            visible: path({ type: 'Point', coordinates: [loc.lon, loc.lat] }) !== null
        }));
    }, [projection]);

    // Animation Loop
    useEffect(() => {
        let frameId: number;
        let phase = 'intro'; // intro | reveal | idle | rotate_to_source | preparing | sending | received

        let currentState = {
            rotation: [0, -20],
            scale: size / 2 - 40,
            opacity: 0 // Using this for the mask gradient stop
        };

        let currentTx: Transaction | null = null;

        const config = {
            baseScale: size / 2 - 40,
            zoomScale: size / 2 + 30
        };

        let timer = 0;
        let startTimestamp = Date.now();
        let lastFrameTime = Date.now();
        const targetFPS = 30; // Limit to 30 FPS for performance
        const frameInterval = 1000 / targetFPS;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTimestamp;
            const deltaTime = now - lastFrameTime;

            // Throttle to target FPS
            if (deltaTime < frameInterval) {
                frameId = requestAnimationFrame(animate);
                return;
            }

            lastFrameTime = now - (deltaTime % frameInterval);

            if (phase === 'intro') {
                // Step 1: Globe is there but bottom faded. Static.
                if (elapsed > 2000) {
                    phase = 'reveal';
                    startTimestamp = now;
                }
            } else if (phase === 'reveal') {
                // Step 2: Animate mask to full visibility
                const progress = Math.min((now - startTimestamp) / 2000, 1);
                currentState.opacity = progress;
                currentState.rotation[0] += 0.05; // Slow spin start

                if (progress >= 1) {
                    phase = 'idle';
                    setGlobeOpacity(1);
                } else {
                    setGlobeOpacity(progress);
                }
            } else if (phase === 'idle') {
                // Spin slowly unlil we decide to start a transaction
                currentState.rotation[0] += 0.1;

                if (!currentTx && Math.random() < 0.01) {
                    // Start new transaction sequence
                    const sourceIdx = Math.floor(Math.random() * LOCATIONS.length);
                    let targetIdx = Math.floor(Math.random() * LOCATIONS.length);
                    while (targetIdx === sourceIdx) targetIdx = Math.floor(Math.random() * LOCATIONS.length);

                    const source = LOCATIONS[sourceIdx];
                    const target = LOCATIONS[targetIdx];

                    const newTx: Transaction = {
                        id: Math.random().toString(36),
                        source,
                        target,
                        progress: 0,
                        state: 'preparing',
                        amount: source.amount
                    };

                    // Find target feature for highlighting
                    const targetFeature = geoJson.features.find((f: any) =>
                        d3.geoContains(f, [target.lon, target.lat])
                    );
                    setHighlightFeature(targetFeature || null);

                    currentTx = newTx;
                    setActiveTx(newTx);
                    phase = 'rotate_to_source';
                }
            } else if (phase === 'rotate_to_source') {
                if (currentTx) {
                    // Rotate to center the Source
                    const targetRotation = [-currentTx.source.lon, -currentTx.source.lat + 10]; // Look slightly above

                    const rotDiff0 = targetRotation[0] - currentState.rotation[0];
                    let dLon = rotDiff0;
                    // Fix wrapping
                    if (dLon > 180) dLon -= 360;
                    if (dLon < -180) dLon += 360;

                    const rotDiff1 = targetRotation[1] - currentState.rotation[1];

                    currentState.rotation[0] += dLon * 0.05;
                    currentState.rotation[1] += rotDiff1 * 0.05;
                    currentState.scale += (config.zoomScale - currentState.scale) * 0.05;

                    if (Math.abs(dLon) < 0.5 && Math.abs(rotDiff1) < 0.5) {
                        phase = 'preparing';
                        timer = now + 1500; // Show "Preparing" card for 1.5s
                    }
                }
            } else if (phase === 'preparing') {
                // Just wait while card shows
                if (now > timer) {
                    phase = 'sending';
                    if (currentTx) {
                        currentTx.state = 'sending';
                        setActiveTx({ ...currentTx });
                    }
                }
            } else if (phase === 'sending') {
                if (currentTx) {
                    // Rotate slightly towards target or midpoint
                    // Let's rotate towards midpoint for the journey
                    const midLon = (currentTx.source.lon + currentTx.target.lon) / 2;

                    currentState.rotation[0] += ((-midLon - currentState.rotation[0]) * 0.02);

                    const nextProgress = currentTx.progress + 0.008; // Speed of travel
                    currentTx.progress = nextProgress;

                    if (nextProgress >= 1) {
                        phase = 'received';
                        timer = now + 4000; // Show Success for 4s
                        currentTx.progress = 1;
                        currentTx.state = 'completed';

                        setRecentTx({ ...currentTx });
                        setActiveTx({ ...currentTx });
                    } else {
                        setActiveTx({ ...currentTx });
                    }
                }
            } else if (phase === 'received') {
                // Wait, hold highlight
                if (now > timer) {
                    phase = 'cleanup';
                }
            } else if (phase === 'cleanup') {
                currentTx = null;
                setActiveTx(null);
                setRecentTx(null);
                setHighlightFeature(null);
                phase = 'idle';
            }

            // Always gentle rotation fix if not controlling heavily
            if (phase !== 'rotate_to_source' && phase !== 'preparing') {
                // drift latitude back to comfortable viewing angle
                currentState.rotation[1] += (-20 - currentState.rotation[1]) * 0.05;
            }

            // If idle, zoom out back to base
            if (phase === 'idle' || phase === 'intro' || phase === 'reveal') {
                currentState.scale += (config.baseScale - currentState.scale) * 0.05;
            }

            setRotation([currentState.rotation[0], currentState.rotation[1]]);
            setScale(currentState.scale);

            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [geoJson]); // Run once on mount, depends on geoJson loaded


    // Helper: Project a point
    const project = (lon: number, lat: number) => {
        return projection([lon, lat]);
    };

    // Check visibility of locations
    const isVisible = (lon: number, lat: number) => {
        const path = d3.geoPath().projection(projection);
        return path({ type: 'Point', coordinates: [lon, lat] }) !== null;
    };

    // Calculate dynamic gradient for intro mask
    // We can just animate the stopOpacity of a gradient in the SVG

    return (
        <div
            style={{ width: size, height: size, position: 'relative', willChange: 'transform' }}
            className="select-none"
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{
                    // filter: 'drop-shadow(0 0 60px rgba(59, 130, 246, 0.3))', // Too blue
                    overflow: 'visible',
                    willChange: 'transform'
                }}
            >
                <defs>
                    <radialGradient id="globeGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#f1f5f9" stopOpacity="1" />
                    </radialGradient>

                    <linearGradient id="introMaskGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="40%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity={globeOpacity} /> 
                    </linearGradient>

                    <mask id="globeIntroMask">
                        <circle cx={size / 2} cy={size / 2} r={scale} fill="url(#introMaskGradient)" />
                    </mask>

                    <mask id="globeClip">
                        <circle cx={size / 2} cy={size / 2} r={scale} fill="white" />
                    </mask>

                    <filter id="glow-highlight">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* The Globe Sphere */}
                <g mask="url(#globeIntroMask)">
                    <circle cx={size / 2} cy={size / 2} r={scale} fill="url(#globeGradient)" />

                    {/* Inner Shadow / Atmosphere */}
                    <circle cx={size / 2} cy={size / 2} r={scale} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    <circle cx={size / 2} cy={size / 2} r={scale} fill="url(#globeGradient)" opacity="0.5" />
                </g>

                <g mask="url(#globeIntroMask)">
                    <g mask="url(#globeClip)">
                    {/* Countries */}
                    <g>
                            {geoJson.features.map((feature: any, i: number) => {
                                // Check if this feature is the highlighted one
                                const isHighlighted = highlightFeature && activeTx?.state === 'completed' && feature === highlightFeature;

                                return (
                                    <path
                                        key={`country-${i}`}
                                        d={pathGenerator(feature) || ""}
                                        fill={isHighlighted ? "#22c55e" : "#cbd5e1"}
                                        stroke="#94a3b8"
                                        strokeWidth="0.5"
                                        className="transition-colors duration-1000 ease-in-out"
                                        style={{
                                            // "ONLY THE COUNTRIES SHOULD BE COLORED"
                                            // Default: Slate-300 (#cbd5e1). Active: Green-500 (#22c55e)
                                            fill: isHighlighted ? "#22c55e" : "#cbd5e1"
                                        }}
                                    />
                                );
                            })}
                    </g>

                        {/* Highlight Feature Pulse - Extra layer on top ensuring visibility */}
                        {highlightFeature && activeTx?.state === 'completed' && (
                            <path
                                d={pathGenerator(highlightFeature) || ""}
                                fill="#22c55e"
                                stroke="#16a34a"
                                strokeWidth="1"
                                opacity="0.6"
                            >
                                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                            </path>
                        )}

                        {/* Grid Lines - very faint */}
                    <g opacity="0.1">
                            <path d={pathGenerator(d3.geoGraticule10()) || ""} fill="none" stroke="#64748b" strokeWidth="0.5" />
                    </g>

                    {/* Active Transaction Path */}
                    {activeTx && (
                        <g>
                            {/* The Arc */}
                            <path
                                d={pathGenerator({
                                    type: "LineString",
                                    coordinates: [
                                        [activeTx.source.lon, activeTx.source.lat],
                                        [activeTx.target.lon, activeTx.target.lat]
                                    ]
                                }) || ""}
                                fill="none"
                                    stroke="#3b82f6" 
                                strokeWidth="2"
                                    strokeDasharray="4 4"
                                    strokeOpacity={activeTx.state === 'preparing' ? 0.2 : 0.4}
                                strokeLinecap="round"
                                >
                                    {/* Animate dash for "preparing" state effect */}
                                    {activeTx.state === 'preparing' && (
                                        <animate attributeName="stroke-opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
                                    )}
                                </path>

                            {/* Comet / Particle */}
                                {activeTx.state !== 'preparing' && (() => {
                                const interpolate = d3.geoInterpolate(
                                    [activeTx.source.lon, activeTx.source.lat],
                                    [activeTx.target.lon, activeTx.target.lat]
                                );

                                    const posCoords = interpolate(activeTx.progress);
                                    const screenPos = project(posCoords[0], posCoords[1]);

                                    // Simple Dot if visible
                                    if (screenPos) {
                                        // Check if front facing
                                        const centerLen = Math.sqrt(Math.pow(screenPos[0] - size / 2, 2) + Math.pow(screenPos[1] - size / 2, 2));
                                        if (centerLen < scale) {
                                            return (
                                                <g filter="url(#glow-highlight)">
                                                    <circle cx={screenPos[0]} cy={screenPos[1]} r="4" fill="#3b82f6" />
                                                    <circle cx={screenPos[0]} cy={screenPos[1]} r="8" fill="#3b82f6" opacity="0.3">
                                                        <animate attributeName="r" values="4;12" dur="1s" repeatCount="indefinite" />
                                                        <animate attributeName="opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
                                                    </circle>
                                                </g>
                                            )
                                    }
                                }
                                    return null;
                            })()}
                        </g>
                    )}

                        {/* Locations (Points) - Minimized, maybe too noisy? User just asked for countries colored. 
                        Let's keep dots small and grey unless active.
                    */}
                        {visibleLocations.map(loc => {
                            if (!loc.coords || !loc.visible) return null;

                        const isSource = activeTx?.source.name === loc.name;
                        const isTarget = activeTx?.target.name === loc.name;
                        const isActive = isSource || isTarget;

                        return (
                            <g
                                key={loc.name}
                                transform={`translate(${loc.coords[0]}, ${loc.coords[1]})`}
                                className="cursor-pointer"
                            >
                                <circle r={isActive ? 4 : 2} fill={isActive ? "#3b82f6" : "#94a3b8"} />
                                {isActive && (
                                    <circle r={8} stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.5" />
                                )}
                            </g>
                        );
                    })}
                </g>
                </g>

                {/* Shading for 3D effect */}
                <circle cx={size / 2} cy={size / 2} r={scale} fill="url(#radialGradient)" opacity="0.1" pointerEvents="none" mask="url(#globeIntroMask)" />

            </svg>

            {/* HTML Overlays for Stories */}
            <AnimatePresence>

                {/* PREPARING CARD */}
                {activeTx && activeTx.state === 'preparing' && isVisible(activeTx.source.lon, activeTx.source.lat) && (
                    <PositionedCard
                        key={`preparing-${activeTx.id}`}
                        coords={project(activeTx.source.lon, activeTx.source.lat)}
                        offset={{ x: 0, y: -50 }}
                        direction="up"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: -10 }}
                            className="bg-white rounded-xl shadow-xl p-3 border border-slate-100 flex items-center gap-3 w-48"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                <img 
                                    src={`https://flagfeed.com/flags/${activeTx.source.code}`}
                                    className="w-full h-full object-cover"
                                    alt="sender-country"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400 font-medium">Preparing to send</span>
                                <span className="text-sm font-bold text-slate-800">{activeTx.amount}</span>
                            </div>
                        </motion.div>
                        {/* Connecting Line */}
                        <div className="h-8 w-[1px] bg-slate-300"></div>
                    </PositionedCard>
                )}

                {/* SENDING CARD */}
                {activeTx && activeTx.state === 'sending' && isVisible(activeTx.source.lon, activeTx.source.lat) && (
                    <PositionedCard
                        key={`sending-${activeTx.id}`}
                        coords={project(activeTx.source.lon, activeTx.source.lat)}
                        offset={{ x: 0, y: -50 }}
                        direction="up"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-3 py-1.5 bg-blue-600 rounded-full text-white text-xs font-bold shadow-lg shadow-blue-200"
                        >
                            Sending...
                        </motion.div>
                    </PositionedCard>
                )}

                {/* RECEIVED / SUCCESS CARD */}
                {recentTx && recentTx.state === 'completed' && isVisible(recentTx.target.lon, recentTx.target.lat) && (
                    <PositionedCard
                        key={`completed-${recentTx.id}`}
                        coords={project(recentTx.target.lon, recentTx.target.lat)}
                        offset={{ x: 0, y: -50 }}
                        direction="up"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: -10 }}
                            className="bg-white rounded-xl shadow-xl p-3 border border-green-100 flex items-center gap-3 w-48"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-100 overflow-hidden shrink-0 border border-green-200 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400 font-medium">{recentTx.target.sender}</span>
                                <span className="text-sm font-bold text-slate-800">{recentTx.amount}</span>
                            </div>
                        </motion.div>
                        {/* Connecting Line */}
                        <div className="h-8 w-[1px] bg-green-300"></div>
                    </PositionedCard>
                )}

            </AnimatePresence>
        </div>
    );
};

const PositionedCard = ({ coords, offset, children }: any) => {
    if (!coords) return null;
    return (
        <div
            className="absolute pointer-events-none z-50 flex flex-col items-center justify-center transition-all duration-75" // Added smooth transition for movement
            style={{
                left: coords[0] + offset.x,
                top: coords[1] + offset.y,
                transform: 'translate(-50%, -50%)'
            }}
        >
            {children}
        </div>
    );
};

export default HeroGlobeWrapper;


