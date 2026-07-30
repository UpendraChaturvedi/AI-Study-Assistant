import React, { useMemo } from 'react';
import { ReactFlow, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GitFork } from 'lucide-react';

export function MindMap({ mindMapData = { nodes: [], edges: [] } }) {
  const { nodes = [], edges = [] } = mindMapData;

  const formattedNodes = useMemo(() => {
    if (!nodes || nodes.length === 0) return [];
    return nodes.map((node) => ({
      id: String(node.id),
      type: node.type || 'default',
      position: node.position || { x: 200, y: 100 },
      data: { label: node.data?.label || node.label || `Node ${node.id}` },
      style: {
        background: 'rgba(26, 21, 51, 0.95)',
        color: '#f8fafc',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '12px',
        padding: '10px 16px',
        fontSize: '12px',
        fontWeight: '600',
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.25)',
      },
    }));
  }, [nodes]);

  const formattedEdges = useMemo(() => {
    if (!edges || edges.length === 0) return [];
    return edges.map((edge) => ({
      id: String(edge.id),
      source: String(edge.source),
      target: String(edge.target),
      label: edge.label || '',
      animated: edge.animated !== false,
      style: { stroke: '#a855f7', strokeWidth: 2 },
      labelStyle: { fill: '#cbd5e1', fontSize: '10px', fontWeight: '500' },
    }));
  }, [edges]);

  if (formattedNodes.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl">
        <GitFork className="w-10 h-10 text-pink-400 mx-auto mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-200">No Mind Map Data</h3>
        <p className="text-xs text-slate-400 mt-1">Select "Mind Map" when generating study materials to view visual concept graphs.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] glass-card rounded-2xl relative overflow-hidden border border-pink-500/20 shadow-xl">
      <ReactFlow
        nodes={formattedNodes}
        edges={formattedEdges}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="rgba(168, 85, 247, 0.15)" gap={16} size={1} />
        <Controls className="!bg-slate-900/80 !border-slate-800 !text-slate-200 !rounded-xl" />
        <MiniMap
          nodeColor="rgba(168, 85, 247, 0.6)"
          className="!bg-slate-950/90 !border-slate-800 !rounded-lg"
          maskColor="rgba(15, 12, 29, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
