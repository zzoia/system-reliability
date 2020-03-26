import React from 'react';
import AdjacencyList from './adjacency-list';

export default function ReliabilityModelContainer() {

    let adjacencyList = localStorage.getItem("adjacencyList")
    if (!adjacencyList) return (<div />);

    adjacencyList = JSON.parse(adjacencyList);
    return (<AdjacencyList adjacencyList={adjacencyList} />);
}