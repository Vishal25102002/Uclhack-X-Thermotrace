'use client';

import React from 'react';

// Interface for flowchart nodes - ready for LangSmith data integration
interface FlowNode {
  id: string;
  label: string;
  color: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  children?: FlowNode[];
}

// Dummy data structure - can be replaced with LangSmith API data
const dummyFlowData: FlowNode = {
  id: 'root',
  label: 'AI Agent Workflow',
  color: 'primary',
  children: [
    {
      id: 'about',
      label: 'Initialize',
      color: 'secondary',
      children: [
        { id: 'story', label: 'Load Config', color: 'tertiary' },
        { id: 'team', label: 'Setup Context', color: 'tertiary' },
        { id: 'contact', label: 'Validate Input', color: 'tertiary' },
      ],
    },
    {
      id: 'locations',
      label: 'Data Processing',
      color: 'secondary',
      children: [
        { id: 'mass', label: 'Parse Data', color: 'tertiary' },
        { id: 'metro', label: 'Transform', color: 'tertiary' },
      ],
    },
    {
      id: 'careers',
      label: 'Analysis',
      color: 'secondary',
      children: [
        { id: 'apply', label: 'Run Model', color: 'tertiary' },
      ],
    },
    {
      id: 'menu',
      label: 'Decision Making',
      color: 'secondary',
      children: [
        { id: 'mass-menu', label: 'Evaluate Options', color: 'tertiary' },
        { id: 'metro-menu', label: 'Score Results', color: 'tertiary' },
        {
          id: 'tatte-all',
          label: 'Validate Decision',
          color: 'tertiary',
          children: [
            { id: 'gluten', label: 'Check Constraints', color: 'quaternary' },
            { id: 'brunch', label: 'Verify Output', color: 'quaternary' },
          ],
        },
      ],
    },
    {
      id: 'catering',
      label: 'Execution',
      color: 'secondary',
      children: [
        { id: 'cambridge', label: 'Execute Action', color: 'tertiary' },
        { id: 'dc', label: 'Monitor Progress', color: 'tertiary' },
        { id: 'boston', label: 'Handle Errors', color: 'tertiary' },
        {
          id: 'cambridge-form',
          label: 'Cambridge Task',
          color: 'quaternary',
        },
        {
          id: 'dc-form',
          label: 'DC Task',
          color: 'quaternary',
        },
        {
          id: 'boston-form',
          label: 'Boston Task',
          color: 'quaternary',
        },
      ],
    },
    {
      id: 'order',
      label: 'Finalize',
      color: 'secondary',
      children: [
        { id: 'pickup', label: 'Collect Results', color: 'tertiary' },
        { id: 'delivery', label: 'Send Response', color: 'tertiary' },
        { id: 'special', label: 'Log Activity', color: 'tertiary' },
        { id: 'order-form', label: 'Generate Report', color: 'quaternary' },
        { id: 'special-form', label: 'Archive Data', color: 'quaternary' },
      ],
    },
  ],
};

const FlowChart: React.FC = () => {
  const getNodeColor = (color: FlowNode['color']) => {
    switch (color) {
      case 'primary':
        return 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg';
      case 'secondary':
        return 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md';
      case 'tertiary':
        return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-sm';
      case 'quaternary':
        return 'bg-gradient-to-br from-rose-300 to-rose-400 text-gray-800 shadow-sm';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const renderNode = (node: FlowNode, isRoot: boolean = false) => {
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Box */}
        <div
          className={`
            ${getNodeColor(node.color)}
            px-6 py-3 rounded-2xl font-semibold text-sm
            transition-all duration-300 hover:scale-105 hover:shadow-xl
            ${isRoot ? 'text-lg px-10 py-4' : ''}
            min-w-[140px] text-center
          `}
        >
          {node.label}
        </div>

        {/* Connector Line Down */}
        {hasChildren && (
          <div className="w-0.5 h-10 bg-gray-400 rounded" />
        )}

        {/* Children Container */}
        {hasChildren && (
          <div className="relative">
            {/* Horizontal Line connecting all children */}
            {node.children!.length > 1 && (
              <div
                className="absolute h-0.5 bg-gray-400 rounded"
                style={{
                  top: '0',
                  left: '50%',
                  right: '50%',
                  width: `${(node.children!.length - 1) * 200}px`,
                  marginLeft: `-${((node.children!.length - 1) * 200) / 2}px`,
                }}
              />
            )}

            {/* Children Nodes */}
            <div className="flex gap-4 pt-0">
              {node.children!.map((child, index) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  {/* Vertical connector from horizontal line to child */}
                  <div className="w-0.5 h-10 bg-gray-400 rounded mb-2" />

                  {/* Render child node recursively */}
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8 overflow-x-auto">
      <div className="min-w-max mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Agent Workflow Flowchart
          </h1>
          <p className="text-gray-600">
            Visual representation of the AI agent execution flow
          </p>
        </div>

        {/* Flowchart */}
        <div className="flex justify-center py-8">
          {renderNode(dummyFlowData, true)}
        </div>

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 text-center shadow-sm">
            <h3 className="text-sm font-medium text-blue-700 mb-2">Total Duration</h3>
            <p className="text-3xl font-bold text-blue-900">43000ms</p>
          </div>
          <div className="bg-white rounded-2xl border-2 border-green-200 p-6 text-center shadow-sm">
            <h3 className="text-sm font-medium text-green-700 mb-2">Total Cost</h3>
            <p className="text-3xl font-bold text-green-900">$0.0234</p>
          </div>
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 text-center shadow-sm">
            <h3 className="text-sm font-medium text-blue-700 mb-2">Execution ID</h3>
            <p className="text-2xl font-bold text-blue-900">exec-001</p>
          </div>
        </div>

        {/* Integration Note */}
        <div className="mt-8 max-w-2xl mx-auto bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">🔗 Ready for LangSmith Integration</h3>
          <p className="text-sm text-blue-700">
            This component uses a <code className="bg-blue-100 px-2 py-1 rounded">FlowNode</code> interface
            that can easily be populated with data from LangSmith API. Simply replace the{' '}
            <code className="bg-blue-100 px-2 py-1 rounded">dummyFlowData</code> with your API response.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlowChart;
