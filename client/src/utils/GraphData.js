import {
    EMPTY_EDGE_TYPE,
    FORK_JOIN_NODE,
    SKINNY_TYPE,
} from './GraphConfig';

export const startNodeId = "start";
export const endNodeId = "end";

export function romanize(num) {
    if (isNaN(num))
        return NaN;
    var digits = String(+num).split(""),
        key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

export const DefaultSystemGraph = {
    edges: [
        {
            source: startNodeId,
            target: 1,
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: startNodeId,
            target: 3,
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: startNodeId,
            target: 5,
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 1,
            target: 2,
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 3,
            target: 4,
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 5,
            target: 6,
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 2,
            target: endNodeId,
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 4,
            target: endNodeId,
            type: EMPTY_EDGE_TYPE,
        },
        {
            source: 6,
            target: endNodeId,
            type: EMPTY_EDGE_TYPE,
        }
    ],
    nodes: [
        {
            id: startNodeId,
            title: "Fork",
            x: 50,
            y: 200,
            type: FORK_JOIN_NODE
        },
        {
            id: 1,
            title: romanize(1),
            type: SKINNY_TYPE,
            x: 250,
            y: 100,
        },
        {
            id: 2,
            title: romanize(2),
            type: SKINNY_TYPE,
            x: 500,
            y: 100,
        },
        {
            id: 3,
            title: romanize(3),
            type: SKINNY_TYPE,
            x: 250,
            y: 200,
        },
        {
            id: 4,
            title: romanize(4),
            type: SKINNY_TYPE,
            x: 500,
            y: 200,
        },
        {
            id: 5,
            title: romanize(5),
            type: SKINNY_TYPE,
            x: 250,
            y: 300,
        },
        {
            id: 6,
            title: romanize(6),
            type: SKINNY_TYPE,
            x: 500,
            y: 300,
        },
        {
            id: endNodeId,
            title: "Join",
            x: 700,
            y: 200,
            type: FORK_JOIN_NODE
        }
    ],
};