import { useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced locations with country codes for flags and currencies
const LOCATIONS = [
    { name: "New York", code: "us", lat: 40.7128, lon: -74.0060, currency: "USD", amount: "$12,450" },
    { name: "London", code: "gb", lat: 51.5074, lon: -0.1278, currency: "GBP", amount: "£8,240" },
    { name: "Tokyo", code: "jp", lat: 35.6762, lon: 139.6503, currency: "JPY", amount: "¥1.5M" },
    { name: "Singapore", code: "sg", lat: 1.3521, lon: 103.8198, currency: "SGD", amount: "S$5,200" },
    { name: "Paris", code: "fr", lat: 48.8566, lon: 2.3522, currency: "EUR", amount: "€4,100" },
    { name: "São Paulo", code: "br", lat: -23.5505, lon: -46.6333, currency: "BRL", amount: "R$25k" },
    { name: "Mumbai", code: "in", lat: 19.0760, lon: 72.8777, currency: "INR", amount: "₹450k" },
    { name: "Lagos", code: "ng", lat: 6.5244, lon: 3.3792, currency: "NGN", amount: "₦2.5M" },
    { name: "Sydney", code: "au", lat: -33.8688, lon: 151.2093, currency: "AUD", amount: "A$6,800" },
    { name: "Cape Town", code: "za", lat: -33.9249, lon: 18.4241, currency: "ZAR", amount: "R85k" },
    { name: "Dubai", code: "ae", lat: 25.2048, lon: 55.2708, currency: "AED", amount: "د.إ15k" },
    { name: "Toronto", code: "ca", lat: 43.6532, lon: -79.3832, currency: "CAD", amount: "C$3,500" },
    { name: "Seoul", code: "kr", lat: 37.5665, lon: 126.9780, currency: "KRW", amount: "₩5.2M" },
    { name: "Berlin", code: "de", lat: 52.5200, lon: 13.4050, currency: "EUR", amount: "€3,200" },
    { name: "Mexico City", code: "mx", lat: 19.4326, lon: -99.1332, currency: "MXN", amount: "$42k" },
    { name: "Jakarta", code: "id", lat: -6.2088, lon: 106.8456, currency: "IDR", amount: "Rp15M" },
];

interface Transaction {
    id: string;
    source: typeof LOCATIONS[0];
    target: typeof LOCATIONS[0];
    progress: number;
    completed: boolean;
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
    const [activeTx, setActiveTx] = useState<Transaction | null>(null);
    const [recentTx, setRecentTx] = useState<Transaction | null>(null);
    const [hoveredHub, setHoveredHub] = useState<string | null>(null);

    // Create d3 projection
    const projection = useMemo(() => {
        return d3.geoOrthographic()
            .translate([size / 2, size / 2])
            .rotate(rotation as [number, number])
            .scale(scale);
    }, [size, rotation, scale]); // Recalculate when these change. Note: usually we update projection mutable, but here for React purity we can rebuild or use effect.
    // Optimization: d3 projections are mutable. Re-creating them is cheap enough, but updating is better.
    // Let's use a ref for the projection object if we want to mutate, but for React render cycle, useMemo is fine if we update generic state.

    const pathGenerator = useMemo(() => d3.geoPath().projection(projection), [projection]);

    // Animation Loop
    useEffect(() => {
        let frameId: number;
        let lastTime = Date.now();
        let phase = 'idle'; // idle | rotate_to_source | sending | rotate_to_target | completed

        // Mutable state for the loop to avoid React batching lag in animation logic
        let currentRotation = [0, -20];
        let currentScale = size / 2 - 40; // Initial scale slightly zoomed out
        const baseScale = size / 2 - 40;
        const zoomScale = size / 2 + 20;  // Zoom in during action

        let pauseTimer = 0;

        const animate = () => {
            const now = Date.now();
            lastTime = now;

            // Handle Transaction Lifecycle
            if (!activeTx && Math.random() < 0.005 && phase === 'idle') {
                // Start a new random transaction
                const sourceIdx = Math.floor(Math.random() * LOCATIONS.length);
                let targetIdx = Math.floor(Math.random() * LOCATIONS.length);
                while (targetIdx === sourceIdx) targetIdx = Math.floor(Math.random() * LOCATIONS.length);

                const newTx: Transaction = {
                    id: Math.random().toString(36),
                    source: LOCATIONS[sourceIdx],
                    target: LOCATIONS[targetIdx],
                    progress: 0,
                    completed: false
                };

                setActiveTx(newTx);
                phase = 'rotate_to_view';
            }

            // State Machine for Camera & Animation
            if (activeTx) {
                if (phase === 'rotate_to_view') {
                    // Calculate View Center (midpoint for nice arc view)
                    const midLon = (activeTx.source.lon + activeTx.target.lon) / 2;
                    const midLat = (activeTx.source.lat + activeTx.target.lat) / 2;

                    const targetRotation = [-midLon, -midLat];

                    // Smooth interpolate rotation
                    const rotDiff0 = targetRotation[0] - currentRotation[0];
                    const rotDiff1 = targetRotation[1] - currentRotation[1];
                    const scaleDiff = zoomScale - currentScale;

                    // Handle wrapping for longitude
                    let dLon = rotDiff0;
                    if (dLon > 180) dLon -= 360;
                    if (dLon < -180) dLon += 360;

                    // Ease into position
                    currentRotation[0] += dLon * 0.04;
                    currentRotation[1] += rotDiff1 * 0.04;
                    currentScale += scaleDiff * 0.03;

                    if (Math.abs(dLon) < 1 && Math.abs(rotDiff1) < 1) {
                        phase = 'sending';
                    }
                } else if (phase === 'sending') {
                    setActiveTx(prev => {
                        if (!prev) return null;
                        const nextProgress = prev.progress + 0.012; // Slightly slower
                        if (nextProgress >= 1) {
                            phase = 'completed';
                            setRecentTx({ ...prev, completed: true });
                            pauseTimer = now + 4000; // Pause for 4 seconds
                            return { ...prev, progress: 1, completed: true };
                        }
                        return { ...prev, progress: nextProgress };
                    });
                    // Maintain focus
                    const scaleDiff = zoomScale - currentScale;
                    currentScale += scaleDiff * 0.01;
                } else if (phase === 'completed') {
                    // Wait for timer
                    if (now > pauseTimer) {
                        setActiveTx(null);
                        setRecentTx(null);
                        phase = 'idle';
                    }
                    // slow drifting
                    currentRotation[0] += 0.01;
                }
            } else {
                // Idle Rotation
                currentRotation[0] += 0.15;
                // Gently return to roughly equator view if not there
                currentRotation[1] += (-20 - currentRotation[1]) * 0.02;
                // Zoom out
                currentScale += (baseScale - currentScale) * 0.02;
            }

            // Update React State
            setRotation([currentRotation[0], currentRotation[1]]);
            setScale(currentScale);

            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, []); // Run once on mount

    // Helper: Project a point
    const project = (lon: number, lat: number) => {
        return projection([lon, lat]);
    };

    // Check visibility of locations
    const isVisible = (lon: number, lat: number) => {
        const path = d3.geoPath().projection(projection);
        return path({ type: 'Point', coordinates: [lon, lat] }) !== null;
    };

    return (
        <div
            style={{ width: size, height: size, position: 'relative' }}
            className="select-none"
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{
                    filter: 'drop-shadow(0 0 60px rgba(59, 130, 246, 0.3))',
                    overflow: 'visible'
                }}
            >
                <defs>
                    <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#020617" stopOpacity="1" />
                        <stop offset="90%" stopColor="#1e3a8a" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#172554" stopOpacity="0.2" />
                    </radialGradient>
                    <linearGradient id="lineGradient" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                        <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow-strong">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <mask id="globeMask">
                        <circle cx={size / 2} cy={size / 2} r={scale} fill="white" />
                    </mask>
                </defs>

                {/* Atmosphere / Halo */}
                <circle cx={size / 2} cy={size / 2} r={scale + 20} fill="#3b82f6" opacity="0.05" filter="url(#glow-strong)" />
                <circle cx={size / 2} cy={size / 2} r={scale} fill="url(#oceanGradient)" />

                {/* Globe Borders for depth */}
                <circle cx={size / 2} cy={size / 2} r={scale} fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.1" />

                <g mask="url(#globeMask)">
                    {/* Countries */}
                    <g>
                        {geoJson.features.map((feature: any, i: number) => (
                            <path
                                key={`country-${i}`}
                                d={pathGenerator(feature) || ""}
                                fill="#1e40af"
                                stroke="#60a5fa"
                                strokeWidth="0.5"
                                fillOpacity="0.2"
                                strokeOpacity="0.2"
                                className="transition-colors duration-500"
                            />
                        ))}
                    </g>

                    {/* Faint network lines between hubs (constellation effect) */}
                    <g opacity="0.1">
                        {LOCATIONS.map((source, i) => (
                            LOCATIONS.slice(i + 1).map((target, j) => {
                                // Only draw some connections to avoid mesh mess
                                if ((i + j) % 3 !== 0) return null;

                                const d = pathGenerator({
                                    type: "LineString",
                                    coordinates: [[source.lon, source.lat], [target.lon, target.lat]]
                                });
                                if (!d) return null;

                                return (
                                    <path key={`net-${i}-${j}`} d={d} fill="none" stroke="#60a5fa" strokeWidth="0.5" />
                                )
                            })
                        ))}
                    </g>

                    {/* Grid Lines */}
                    <g opacity="0.05">
                        <path d={pathGenerator(d3.geoGraticule10()) || ""} fill="none" stroke="#ffffff" strokeWidth="0.5" />
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
                                stroke="url(#lineGradient)" // Gradient stroke doesn't strictly work on path simply but let's try fixed color if issue
                                // strokeColor="#10b981"
                                strokeWidth="2"
                                strokeDasharray="6 3"
                                strokeOpacity="0.5"
                                strokeLinecap="round"
                            />

                            {/* Comet / Particle */}
                            {(() => {
                                const interpolate = d3.geoInterpolate(
                                    [activeTx.source.lon, activeTx.source.lat],
                                    [activeTx.target.lon, activeTx.target.lat]
                                );

                                // Draw a trail
                                const trailLength = 5;
                                const points = [];
                                for (let i = 0; i < trailLength; i++) {
                                    const p = activeTx.progress - (i * 0.01);
                                    if (p > 0 && p < 1) {
                                        const posCoords = interpolate(p);
                                        const screenPos = project(posCoords[0], posCoords[1]);
                                        if (screenPos) {
                                            // Check visibility
                                            const dist = Math.sqrt(Math.pow(screenPos[0] - size / 2, 2) + Math.pow(screenPos[1] - size / 2, 2));
                                            if (dist <= scale) { // Visible
                                                points.push({ pos: screenPos, opacity: 1 - (i / trailLength), size: 4 - (i * 0.5) });
                                            }
                                        }
                                    }
                                }

                                return (
                                    <g filter="url(#glow-strong)">
                                        {points.map((pt, idx) => (
                                            <circle
                                                key={idx}
                                                cx={pt.pos[0]}
                                                cy={pt.pos[1]}
                                                r={pt.size}
                                                fill={idx === 0 ? "#fff" : "#10b981"}
                                                fillOpacity={pt.opacity}
                                            />
                                        ))}
                                    </g>
                                );
                            })()}
                        </g>
                    )}

                    {/* Locations (Points) */}
                    {LOCATIONS.map(loc => {
                        const coords = project(loc.lon, loc.lat);
                        const visible = isVisible(loc.lon, loc.lat);
                        if (!coords || !visible) return null;

                        const isSource = activeTx?.source.name === loc.name;
                        const isTarget = activeTx?.target.name === loc.name;
                        const isActive = isSource || isTarget;

                        return (
                            <g
                                key={loc.name}
                                transform={`translate(${coords[0]}, ${coords[1]})`}
                                onMouseEnter={() => setHoveredHub(loc.name)}
                                onMouseLeave={() => setHoveredHub(null)}
                                className="cursor-pointer"
                            >
                                {/* Interactive hit area */}
                                <circle r="15" fill="transparent" />

                                {/* Status Ring */}
                                <circle
                                    r={isActive ? 8 : 3}
                                    fill={isActive ? "#fbbf24" : "#60a5fa"}
                                    fillOpacity={isActive ? 1 : 0.6}
                                    className="transition-all duration-300"
                                />

                                {/* Label on Hover */}
                                <AnimatePresence>
                                    {hoveredHub === loc.name && !isActive && (
                                        <motion.g
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <rect x="12" y="-12" rx="4" width="80" height="24" fill="rgba(15, 23, 42, 0.9)" stroke="#3b82f6" strokeWidth="0.5" />
                                            <text x="52" y="4" fill="white" fontSize="10" textAnchor="middle" alignmentBaseline="middle">{loc.name}</text>
                                        </motion.g>
                                    )}
                                </AnimatePresence>

                                {/* Ripple for active hubs */}
                                {isActive && (
                                    <>
                                        <circle r={12} fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.5">
                                            <animate attributeName="r" values="8;20" dur="2s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
                                        </circle>
                                        <circle r={4} fill="#fff" />
                                    </>
                                )}
                            </g>
                        );
                    })}
                </g>

                {/* Foreground sheen/glare (static) */}
                <circle cx={size / 2 - scale * 0.3} cy={size / 2 - scale * 0.3} r={scale} fill="url(#oceanGradient)" opacity="0.1" style={{ mixBlendMode: 'overlay' }} pointerEvents="none" />

            </svg>

            {/* HTML Overlays for "Storytelling" UI Elements */}
            <AnimatePresence>
                {/* Source Label when Transaction Starts */}
                {activeTx && activeTx.progress < 0.3 && isVisible(activeTx.source.lon, activeTx.source.lat) && (
                    <PositionedCard
                        coords={project(activeTx.source.lon, activeTx.source.lat)}
                        offset={{ x: 0, y: -45 }}
                        direction="up"
                    >
                        <motion.div
                            className="flex flex-col items-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-blue-500/50 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                </span>
                                <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-blue-300 uppercase leading-none mb-1">Sending from {activeTx.source.code.toUpperCase()}</span>
                                    <span className="text-sm font-bold leading-none">{activeTx.source.amount}</span>
                                </div>
                                <img
                                    src={`https://flagcdn.com/w40/${activeTx.source.code}.png`}
                                    className="w-6 h-auto rounded ml-2 shadow-sm border border-white/10"
                                    alt=""
                                />
                            </div>
                            <div className="w-1 h-8 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
                        </motion.div>
                    </PositionedCard>
                )}

                {/* Target Label when Transaction Completes */}
                {recentTx && recentTx.completed && isVisible(recentTx.target.lon, recentTx.target.lat) && (
                    <PositionedCard
                        coords={project(recentTx.target.lon, recentTx.target.lat)}
                        offset={{ x: 0, y: -60 }}
                        direction="up"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0, y: 20 }}
                            className="flex flex-col items-center"
                        >
                            <div className="bg-gradient-to-br from-green-900/90 to-slate-900/95 backdrop-blur-xl p-0.5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-green-500/30">
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-green-500 rounded-full blur opacity-40 animate-pulse"></div>
                                        <div className="relative bg-green-500 text-black p-1.5 rounded-full">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-green-400">PAYMENT SUCCESS</span>
                                        </div>
                                        <div className="flex items-baseline gap-2 mt-0.5">
                                            <span className="text-lg font-bold text-white">{recentTx.target.currency}</span>
                                            <span className="text-sm text-gray-400">received in {recentTx.target.name}</span>
                                        </div>
                                    </div>

                                    <img
                                        src={`https://flagcdn.com/w40/${recentTx.target.code}.png`}
                                        className="w-8 h-auto rounded shadow-lg border border-white/10 ml-2"
                                        alt=""
                                    />
                                </div>
                            </div>
                            <div className="w-[1px] h-6 bg-gradient-to-b from-green-500/50 to-transparent"></div>
                        </motion.div>
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
            className="absolute pointer-events-none z-50 flex flex-col items-center justify-center"
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

