import { NODE_KEY } from '../utils/GraphConfig';

export const hashCode = str => {

    let hash = 0;

    for (let index = 0; index < str.length; index++) {
        const character = str.charCodeAt(index);
        hash = ((hash << 5) - hash) + character;
        hash |= 0;
    }

    return hash;
};

export const graphToHash = graph => {
    const data = getGraphData(graph);
    const json = JSON.stringify(data);
    return hashCode(json);
};

export const getGraphData = graph => {

    const nodes = graph.nodes.map(node => {
        const obj = { title: node.title };
        obj[NODE_KEY] = node[NODE_KEY];
        return obj;
    });

    const edges = graph.edges.map(node => ({ source: node.source, target: node.target }));
    
    return {
        nodes,
        edges
    };
};