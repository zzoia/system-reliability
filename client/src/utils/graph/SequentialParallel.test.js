import { processGraph } from "../../components/constructor/AppContainer"

test("Correctly parses complex graph", () => {
    const input = JSON.parse('{"nodes":[{"title":"Fork","id":"start"},{"title":"Join","id":"end"},{"title":"I","id":1},{"title":"II","id":2},{"title":"VIII","id":8},{"title":"X","id":10},{"title":"XI","id":11},{"title":"XII","id":12},{"title":"XIII","id":13},{"title":"XIV","id":14},{"title":"XV","id":15},{"title":"XVI","id":16},{"title":"XVIII","id":18},{"title":"XIX","id":19},{"title":"XX","id":20},{"title":"XXI","id":21}],"edges":[{"source":"start","target":1},{"source":1,"target":2},{"source":2,"target":8},{"source":8,"target":10},{"source":10,"target":"end"},{"source":2,"target":11},{"source":2,"target":12},{"source":12,"target":10},{"source":"start","target":14},{"source":14,"target":13},{"source":13,"target":"end"},{"source":11,"target":15},{"source":15,"target":"end"},{"source":18,"target":10},{"source":2,"target":19},{"source":16,"target":21},{"source":19,"target":20},{"source":20,"target":18},{"source":21,"target":18},{"source":2,"target":16}]}');

    const expected = {"or":[{"and":[1,2,{"or":[{"and":[11,15]},{"and":[{"or":[{"or":[8,12]},{"and":[{"or":[{"and":[19,20]},{"and":[16,21]}]},18]}]},10]}]}]},{"and":[14,13]}]};
    const actual = processGraph(input).getRepresentation();
    
    expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
});