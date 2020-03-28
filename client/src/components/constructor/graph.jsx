import * as React from 'react';

import { GraphView } from 'react-digraph';

import GraphConfig, {
    EMPTY_EDGE_TYPE,
    NODE_KEY,
    SKINNY_TYPE,
} from '../../utils/graph-config';

import { startNodeId, endNodeId, romanize } from '../../utils/graph-data';
class Graph extends React.Component {
    GraphView;

    constructor(props) {
        super(props);

        this.state = {
            copiedNode: null,
            graph: props.value,
            selected: null
        };

        this.GraphView = React.createRef();
    }

    getModuleGraph() {
        return {
            nodes: [...this.state.graph.nodes],
            edges: [...this.state.graph.edges]
        }
    }

    // Helper to find the index of a given node
    getNodeIndex(searchNode) {
        return this.state.graph.nodes.findIndex(node => {
            return node[NODE_KEY] === searchNode[NODE_KEY];
        });
    }

    // Helper to find the index of a given edge
    getEdgeIndex(searchEdge) {
        return this.state.graph.edges.findIndex(edge => {
            return (
                edge.source === searchEdge.source && edge.target === searchEdge.target
            );
        });
    }

    // Given a nodeKey, return the corresponding node
    getViewNode(nodeKey) {
        const searchNode = {};

        searchNode[NODE_KEY] = nodeKey;
        const i = this.getNodeIndex(searchNode);

        return this.state.graph.nodes[i];
    }

    // Called by 'drag' handler, etc..
    // to sync updates from D3 with the graph
    onUpdateNode = (viewNode) => {
        const graph = this.state.graph;
        const i = this.getNodeIndex(viewNode);

        graph.nodes[i] = viewNode;
        this.setState({ graph });
    };

    // Node 'mouseUp' handler
    onSelectNode = (viewNode) => {
        // Deselect events will send Null viewNode
        this.setState({ selected: viewNode });
    };

    // Edge 'mouseUp' handler
    onSelectEdge = (viewEdge) => {
        this.setState({ selected: viewEdge });
    };

    // Updates the graph with a new node
    onCreateNode = (x, y) => {
        const graph = this.state.graph;

        const ids = graph.nodes.filter(n => !isNaN(n.id)).map(n => n.id);
        const newId = Math.max(...ids) + 1;

        const viewNode = {
            id: newId,
            title: romanize(newId),
            type: SKINNY_TYPE,
            x,
            y,
        };

        graph.nodes = [...graph.nodes, viewNode];
        this.setState({ graph });

        this.props.onChange(this.getModuleGraph());
    };

    // Deletes a node from the graph
    onDeleteNode = (viewNode, nodeId, nodeArr) => {
        const graph = this.state.graph;
        // Delete any connected edges
        const newEdges = graph.edges.filter((edge, i) => {
            return (
                edge.source !== viewNode[NODE_KEY] && edge.target !== viewNode[NODE_KEY]
            );
        });

        graph.nodes = nodeArr;
        graph.edges = newEdges;

        this.setState({ graph, selected: null });

        this.props.onChange(this.getModuleGraph());
    };

    // Creates a new node between two edges
    onCreateEdge = (sourceViewNode, targetViewNode) => {

        const viewEdge = {
            source: sourceViewNode[NODE_KEY],
            target: targetViewNode[NODE_KEY],
            EMPTY_EDGE_TYPE,
        };

        const graph = this.state.graph;

        if (viewEdge.source !== viewEdge.target) {
            graph.edges = [...graph.edges, viewEdge];
            this.setState({
                graph,
                selected: viewEdge,
            });
        }

        this.props.onChange(this.getModuleGraph());
    };

    // Called when an edge is reattached to a different target.
    onSwapEdge = (
        sourceViewNode,
        targetViewNode,
        viewEdge
    ) => {
        const graph = this.state.graph;
        const i = this.getEdgeIndex(viewEdge);
        const edge = JSON.parse(JSON.stringify(graph.edges[i]));

        edge.source = sourceViewNode[NODE_KEY];
        edge.target = targetViewNode[NODE_KEY];
        graph.edges[i] = edge;
        // reassign the array reference if you want the graph to re-render a swapped edge
        graph.edges = [...graph.edges];

        this.setState({
            graph,
            selected: edge,
        });

        this.props.onChange(this.getModuleGraph());
    };

    // Called when an edge is deleted
    onDeleteEdge = (viewEdge, edges) => {
        const graph = this.state.graph;

        graph.edges = edges;
        this.setState({
            graph,
            selected: null,
        });

        this.props.onChange(this.getModuleGraph());
    };

    onUndo = () => {
        console.warn('Undo is not currently implemented in the example.');
    };

    onCopySelected = () => {
        if (this.state.selected.source) {
            console.warn('Cannot copy selected edges, try selecting a node instead.');

            return;
        }

        const x = this.state.selected.x + 10;
        const y = this.state.selected.y + 10;

        this.setState({
            copiedNode: { ...this.state.selected, x, y },
        });
    };

    onPasteSelected = () => {
        if (!this.state.copiedNode) {
            console.warn(
                'No node is currently in the copy queue. Try selecting a node and copying it with Ctrl/Command-C'
            );
        }

        const graph = this.state.graph;
        const newNode = { ...this.state.copiedNode, id: Date.now() };

        graph.nodes = [...graph.nodes, newNode];
        this.forceUpdate();
    };

    canDeleteNode = (node) => node[NODE_KEY] !== startNodeId && node[NODE_KEY] !== endNodeId;

    setGraphRef = (el) => {
        this.GraphView = el;
        this.props.onChange(this.getModuleGraph());
    }

    render() {
        const { nodes, edges } = this.state.graph;
        const selected = this.state.selected;
        const { NodeTypes, NodeSubtypes, EdgeTypes } = GraphConfig;

        return (
            <div id="graph">
                <GraphView
                    ref={this.setGraphRef}
                    nodeKey={NODE_KEY}
                    nodes={nodes}
                    edges={edges}
                    selected={selected}
                    nodeTypes={NodeTypes}
                    nodeSubtypes={NodeSubtypes}
                    edgeTypes={EdgeTypes}
                    canDeleteNode={this.canDeleteNode}
                    onSelectNode={this.onSelectNode}
                    onCreateNode={this.onCreateNode}
                    onUpdateNode={this.onUpdateNode}
                    onDeleteNode={this.onDeleteNode}
                    onSelectEdge={this.onSelectEdge}
                    onCreateEdge={this.onCreateEdge}
                    onSwapEdge={this.onSwapEdge}
                    onDeleteEdge={this.onDeleteEdge}
                    showGraphControls={true}
                    onUndo={this.onUndo}
                    onCopySelected={this.onCopySelected}
                    onPasteSelected={this.onPasteSelected}
                    layoutEngineType="SnapToGrid"
                />
            </div>
        );
    }
}

export default Graph;
