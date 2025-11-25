export function getSplinePoint(t, nodes) {
    const n = nodes.length;
    if (n === 0) return { x: 0, y: 0 };

    let p1 = Math.floor(t);
    let p0 = p1 - 1; let p2 = p1 + 1; let p3 = p1 + 2;
    let f = t - p1;

    p0 = ((p0 % n) + n) % n; p1 = ((p1 % n) + n) % n;
    p2 = ((p2 % n) + n) % n; p3 = ((p3 % n) + n) % n;

    const node0 = nodes[p0]; const node1 = nodes[p1];
    const node2 = nodes[p2]; const node3 = nodes[p3];

    const f2 = f * f; const f3 = f2 * f;

    const x = 0.5 * ((2 * node1.x) + (-node0.x + node2.x) * f + (2 * node0.x - 5 * node1.x + 4 * node2.x - node3.x) * f2 + (-node0.x + 3 * node1.x - 3 * node2.x + node3.x) * f3);
    const y = 0.5 * ((2 * node1.y) + (-node0.y + node2.y) * f + (2 * node0.y - 5 * node1.y + 4 * node2.y - node3.y) * f2 + (-node0.y + 3 * node1.y - 3 * node2.y + node3.y) * f3);

    return { x, y };
}

export function getTrackLength(nodes) {
    let len = 0;
    const resolution = 0.1;
    let prev = getSplinePoint(0, nodes);
    for (let t = resolution; t <= nodes.length; t += resolution) {
        const curr = getSplinePoint(t, nodes);
        len += Math.hypot(curr.x - prev.x, curr.y - prev.y);
        prev = curr;
    }
    return len;
}
