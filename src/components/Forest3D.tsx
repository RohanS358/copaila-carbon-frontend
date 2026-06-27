'use client';

import React, { useEffect, useMemo, useRef } from 'react';

interface Tree {
  id: number;
  x: number;
  y: number;
  state: 'live' | 'seed' | 'dead';
}

interface Forest3DProps {
  trees?: Tree[];
  width?: number;
  height?: number;
  savedCo2Kg?: number;
  emittedCo2Kg?: number;
  treeKgEq?: number;
}

const TILE_SIZE = 100;
const DEFAULT_TREE_KG_EQ = 25;

interface Rock {
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
}

interface Hill {
  x: number;
  y: number;
  height: number;
}

// Generate a super dense forest with many trees
const generateDenseTrees = (): Tree[] => {
  const trees: Tree[] = [];
  let id = 0;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 20; x++) {
      // 95% fill rate - almost completely covered
      if (Math.random() > 0.05) {
        const rand = Math.random();
        let state: 'live' | 'seed' | 'dead' = 'live';

        // Distribution: 80% live, 12% seed, 8% dead
        if (rand < 0.8) {
          state = 'live';
        } else if (rand < 0.92) {
          state = 'seed';
        } else {
          state = 'dead';
        }

        trees.push({ id: id++, x, y, state });
      }
    }
  }
  return trees;
};

// Generate rocks and stones scattered throughout
const generateRocks = (): Rock[] => {
  const rocks: Rock[] = [];
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 20; x++) {
      // Randomly place rocks/stones
      if (Math.random() > 0.6) {
        const rand = Math.random();
        let size: 'small' | 'medium' | 'large' = 'small';
        if (rand < 0.6) {
          size = 'small';
        } else if (rand < 0.85) {
          size = 'medium';
        } else {
          size = 'large';
        }
        rocks.push({ x, y, size });
      }
    }
  }
  return rocks;
};

// Generate hills for terrain variation
const generateHills = (): Hill[] => {
  const hills: Hill[] = [];
  const hillCount = Math.floor(Math.random() * 3) + 2;
  for (let i = 0; i < hillCount; i++) {
    hills.push({
      x: Math.random() * 20,
      y: Math.random() * 16,
      height: Math.random() * 0.5 + 0.3,
    });
  }
  return hills;
};

const DEFAULT_TREES: Tree[] = generateDenseTrees();
const DEFAULT_ROCKS: Rock[] = generateRocks();
const DEFAULT_HILLS: Hill[] = generateHills();

function cloneTrees(source: Tree[]) {
  return source.map((tree, index) => ({
    id: typeof tree.id === 'number' ? tree.id : index,
    x: tree.x,
    y: tree.y,
    state: tree.state,
  }))
}

function hashNoise(seed: number) {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

function isometricProject(x: number, y: number, baseX: number, baseY: number) {
  const screenX = baseX + (x - y) * (TILE_SIZE / 2);
  const screenY = baseY + (x + y) * (TILE_SIZE / 4);
  return { screenX, screenY };
}

function drawPineTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: 'live' | 'seed' | 'dead',
  opacity: number = 1
) {
  ctx.save();
  ctx.globalAlpha = opacity;

  if (state === 'live') {
    // Trunk
    ctx.fillStyle = '#6B5344';
    ctx.fillRect(x - 4, y + 12, 8, 18);

    // Pine tree foliage - multiple triangles for cone shape
    ctx.fillStyle = '#2D5A2D';
    const levels = 8;
    for (let i = 0; i < levels; i++) {
      const width = 28 - i * 3;
      const height = 8;
      ctx.beginPath();
      ctx.moveTo(x, y - i * 6);
      ctx.lineTo(x - width / 2, y + height - i * 6);
      ctx.lineTo(x + width / 2, y + height - i * 6);
      ctx.closePath();
      ctx.fill();
    }

    // Add darker shading for depth
    ctx.fillStyle = '#1F3D1F';
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 5);
    ctx.lineTo(x - 12, y + 25);
    ctx.lineTo(x - 4, y + 25);
    ctx.closePath();
    ctx.fill();

    // Add some lighter highlights
    ctx.fillStyle = 'rgba(120, 180, 80, 0.5)';
    ctx.beginPath();
    ctx.moveTo(x + 4, y - 3);
    ctx.lineTo(x + 10, y + 20);
    ctx.lineTo(x + 4, y + 20);
    ctx.closePath();
    ctx.fill();
  } else if (state === 'seed') {
    // Small sapling
    ctx.fillStyle = '#8B9D6F';

    // Trunk
    ctx.fillRect(x - 2, y + 6, 4, 10);

    // Small foliage
    const width = 12;
    const height = 6;
    ctx.beginPath();
    ctx.moveTo(x, y - 2);
    ctx.lineTo(x - width / 2, y + height - 2);
    ctx.lineTo(x + width / 2, y + height - 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y + 4);
    ctx.lineTo(x - width / 2 + 2, y + height + 4);
    ctx.lineTo(x + width / 2 - 2, y + height + 4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x - width / 2 + 3, y + height + 8);
    ctx.lineTo(x + width / 2 - 3, y + height + 8);
    ctx.closePath();
    ctx.fill();
  } else if (state === 'dead') {
    // Stump
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(x - 6, y + 10, 12, 10);

    // Add some texture
    ctx.strokeStyle = '#6B5344';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 15);
    ctx.lineTo(x + 6, y + 15);
    ctx.stroke();

    // Ground patch - bare earth
    ctx.fillStyle = 'rgba(139, 115, 85, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 22, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawRock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: 'small' | 'medium' | 'large'
) {
  ctx.save();

  const sizes = { small: 4, medium: 7, large: 11 };
  const radius = sizes[size];
  const seed = x * 13.37 + y * 7.91 + radius * 11.3;

  // Rock color with variation
  const colors = ['#7A7A7A', '#808080', '#6F6F6F', '#858585'];
  ctx.fillStyle = colors[Math.floor(hashNoise(seed) * colors.length)];

  // Draw irregular rock shape
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const r = radius * (0.72 + hashNoise(seed + i * 0.81) * 0.34);
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Add shadow for depth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const r = radius * (0.62 + hashNoise(seed + 17 + i * 0.59) * 0.27);
    const px = x + 2 + Math.cos(angle) * r;
    const py = y + 3 + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  hillInfluence: number = 0
) {
  const points = [
    { x: screenX + TILE_SIZE / 2, y: screenY },
    { x: screenX + TILE_SIZE, y: screenY + TILE_SIZE / 4 },
    { x: screenX + TILE_SIZE / 2, y: screenY + TILE_SIZE / 2 },
    { x: screenX, y: screenY + TILE_SIZE / 4 },
  ];

  // Adjust color based on hill elevation
  const baseColor = hillInfluence > 0.3 ? '#DCC9B6' : '#E8E4D0';
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#D4CFC0';
  ctx.lineWidth = 1;
  ctx.stroke();
}

export default function Forest3D({
  trees = DEFAULT_TREES,
  width = 2400,
  height = 1600,
  savedCo2Kg = 0,
  emittedCo2Kg = 0,
  treeKgEq = DEFAULT_TREE_KG_EQ,
}: Forest3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocksRef = useRef<Rock[]>(DEFAULT_ROCKS);
  const hillsRef = useRef<Hill[]>(DEFAULT_HILLS);
  const liveTreesTarget = Math.max(0, Math.round(savedCo2Kg / treeKgEq))
  const cutTreesTarget = Math.max(0, Math.round(emittedCo2Kg / treeKgEq))
  const forestTrees = useMemo(() => {
    const base = cloneTrees(trees.length ? trees : DEFAULT_TREES)
    return base.map((tree, index) => {
      if (index < liveTreesTarget) return { ...tree, state: 'live' as const }
      if (index < liveTreesTarget + cutTreesTarget) return { ...tree, state: 'dead' as const }
      return { ...tree, state: 'seed' as const }
    })
  }, [trees, liveTreesTarget, cutTreesTarget])

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#F5F3ED';
    ctx.fillRect(0, 0, width, height);

    // Anchor the full projected board, not just the top-left grid origin.
    const baseX = width / 2 - 150;
    const baseY = height / 2 - 450;

    // Draw grid of tiles
    const gridWidth = 20;
    const gridHeight = 16;

    // Calculate hill influences
    const getHillInfluence = (x: number, y: number) => {
      let influence = 0;
      hillsRef.current.forEach((hill) => {
        const dx = x - hill.x;
        const dy = y - hill.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        influence += Math.max(0, hill.height * (1 - dist / 5));
      });
      return Math.min(influence, 1);
    };

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const { screenX, screenY } = isometricProject(x, y, baseX, baseY);
        const hillInfluence = getHillInfluence(x, y);
        drawTile(ctx, screenX, screenY, hillInfluence);
      }
    }

    // Sort all elements by depth for proper layering
    const allElements: Array<{ depth: number; type: string; data: any }> = [];

    // Add trees
    forestTrees.forEach((tree) => {
      allElements.push({
        depth: tree.x + tree.y,
        type: 'tree',
        data: tree,
      });
    });

    // Add rocks
    rocksRef.current.forEach((rock) => {
      allElements.push({
        depth: rock.x + rock.y,
        type: 'rock',
        data: rock,
      });
    });

    // Sort by depth
    allElements.sort((a, b) => a.depth - b.depth);

    // Draw all elements
    allElements.forEach((element) => {
      if (element.type === 'tree') {
        const tree = element.data as Tree;
        const { screenX, screenY } = isometricProject(tree.x, tree.y, baseX, baseY);
        const treeX = screenX + TILE_SIZE / 2;
        const treeY = screenY + TILE_SIZE / 4;
        drawPineTree(ctx, treeX, treeY, tree.state);
      } else if (element.type === 'rock') {
        const rock = element.data as Rock;
        const { screenX, screenY } = isometricProject(rock.x, rock.y, baseX, baseY);
        const rockX = screenX + TILE_SIZE / 2 + (hashNoise(rock.x + rock.y) - 0.5) * 20;
        const rockY = screenY + TILE_SIZE / 4 + (hashNoise(rock.y + rock.x + 9) - 0.5) * 10;
        drawRock(ctx, rockX, rockY, rock.size);
      }
    });
  }, [forestTrees, width, height]);

  return (
    <div className="w-full rounded-3xl border border-[#dfe8d3] bg-gradient-to-br from-[#F5F3ED] via-[#f4f6ef] to-[#eef2e5] p-4 md:p-5 shadow-[0_18px_60px_rgba(30,47,30,0.12)]">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[#7BAE7F] mb-2">Forest equivalence</p>
          <h2 className="text-xl md:text-2xl font-black text-[#1E2F1E] leading-tight m-0">Saved CO₂ grows trees. Emitted CO₂ cuts them down.</h2>
          <p className="text-sm text-[#4E7D5B] mt-2 mb-0">{Math.round(savedCo2Kg / treeKgEq)} trees grown · {Math.round(emittedCo2Kg / treeKgEq)} trees cut</p>
        </div>
        <div className="rounded-full border border-[#e4edd6] bg-white/90 px-4 py-2 text-sm font-bold text-[#1E2F1E]">
          1 tree = {treeKgEq} kg CO₂e
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#dfe8d3] bg-[#f7f8f2]">
        <canvas ref={canvasRef} width={width} height={height} className="block w-full h-auto" style={{ display: 'block' }} />
      </div>
    </div>
  );
}
