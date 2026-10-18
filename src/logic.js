export const NODE_WIDTH = 116
export const NODE_HEIGHT = 82
export const MAX_TRUTH_TABLE_INPUTS = 8

export const GATE_TYPES = ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR']
export const SOURCE_TYPES = ['INPUT', 'VCC', 'GND']
export const OUTPUT_TYPES = ['LED']

export function inputCount(type) {
  if (type === 'NOT' || type === 'LED') return 1
  if (GATE_TYPES.includes(type)) return 2
  return 0
}

export function makeDemoCircuit() {
  const nodes = [
    { id: 'input-a', type: 'INPUT', label: 'A', x: 105, y: 140, value: false },
    { id: 'input-b', type: 'INPUT', label: 'B', x: 105, y: 310, value: false },
    { id: 'gate-xor', type: 'XOR', label: 'XOR1', x: 365, y: 225 },
    { id: 'led-out', type: 'LED', label: 'OUT', x: 645, y: 225 },
  ]
  const wires = [
    { id: 'wire-a-xor', from: 'input-a', to: 'gate-xor', toPort: 0 },
    { id: 'wire-b-xor', from: 'input-b', to: 'gate-xor', toPort: 1 },
    { id: 'wire-xor-led', from: 'gate-xor', to: 'led-out', toPort: 0 },
  ]
  return { nodes, wires, projectName: 'XOR · 2 inputs' }
}

/** Evaluate the combinational signal at every node. Unconnected inputs are LOW.
 * Cycles are safely resolved to LOW rather than recursing indefinitely.
 */
export function evaluateCircuit(nodes, wires, assignments = {}) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const incoming = new Map()
  for (const wire of wires) {
    if (!nodeById.has(wire.from) || !nodeById.has(wire.to)) continue
    incoming.set(`${wire.to}:${wire.toPort}`, wire.from)
  }

  const memo = new Map()
  const visiting = new Set()

  const readInput = (node, port) => {
    const sourceId = incoming.get(`${node.id}:${port}`)
    return sourceId ? evaluateNode(sourceId) : false
  }

  const evaluateNode = (id) => {
    if (memo.has(id)) return memo.get(id)
    const node = nodeById.get(id)
    if (!node || visiting.has(id)) return false

    visiting.add(id)
    let value = false
    switch (node.type) {
      case 'INPUT':
        value = Boolean(Object.prototype.hasOwnProperty.call(assignments, id) ? assignments[id] : node.value)
        break
      case 'VCC':
        value = true
        break
      case 'GND':
        value = false
        break
      case 'LED':
        value = readInput(node, 0)
        break
      case 'NOT':
        value = !readInput(node, 0)
        break
      case 'AND':
        value = readInput(node, 0) && readInput(node, 1)
        break
      case 'OR':
        value = readInput(node, 0) || readInput(node, 1)
        break
      case 'NAND':
        value = !(readInput(node, 0) && readInput(node, 1))
        break
      case 'NOR':
        value = !(readInput(node, 0) || readInput(node, 1))
        break
      case 'XOR':
        value = readInput(node, 0) !== readInput(node, 1)
        break
      case 'XNOR':
        value = readInput(node, 0) === readInput(node, 1)
        break
      default:
        value = false
    }
    visiting.delete(id)
    memo.set(id, Boolean(value))
    return Boolean(value)
  }

  for (const node of nodes) evaluateNode(node.id)
  return Object.fromEntries(memo)
}

/** Build a conventional binary truth table (A is the most significant bit). */
export function buildTruthTable(nodes, wires, maxInputs = MAX_TRUTH_TABLE_INPUTS) {
  const allInputs = nodes.filter((node) => node.type === 'INPUT')
  const inputs = allInputs.slice(0, maxInputs)
  const outputs = nodes.filter((node) => node.type === 'LED')
  const rowCount = 2 ** inputs.length
  const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
    const assignments = {}
    inputs.forEach((node, inputIndex) => {
      const shift = inputs.length - inputIndex - 1
      assignments[node.id] = Boolean((rowIndex >> shift) & 1)
    })
    const values = evaluateCircuit(nodes, wires, assignments)
    const inputValues = Object.fromEntries(inputs.map((node) => [node.id, assignments[node.id]]))
    const outputValues = Object.fromEntries(outputs.map((node) => [node.id, Boolean(values[node.id])]))
    return { index: rowIndex, inputs: inputValues, outputs: outputValues }
  })
  return { inputs, outputs, rows, omittedInputs: Math.max(0, allInputs.length - inputs.length) }
}
