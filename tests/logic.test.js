import { describe, expect, it } from 'vitest'
import { buildTruthTable, evaluateCircuit } from '../src/logic.js'

const inputA = { id: 'a', type: 'INPUT', label: 'A', value: false }
const inputB = { id: 'b', type: 'INPUT', label: 'B', value: false }
const output = { id: 'out', type: 'LED', label: 'OUT' }

function twoInputGate(type) {
  return {
    nodes: [inputA, inputB, { id: 'gate', type }, output],
    wires: [
      { id: 'a-gate', from: 'a', to: 'gate', toPort: 0 },
      { id: 'b-gate', from: 'b', to: 'gate', toPort: 1 },
      { id: 'gate-out', from: 'gate', to: 'out', toPort: 0 },
    ],
  }
}

describe('logic simulation', () => {
  it('builds the standard XOR truth table', () => {
    const { nodes, wires } = twoInputGate('XOR')
    const table = buildTruthTable(nodes, wires)
    expect(table.rows.map((row) => row.outputs.out)).toEqual([false, true, true, false])
  })

  it('evaluates every two-input gate correctly', () => {
    const cases = {
      AND: [false, false, false, true],
      OR: [false, true, true, true],
      XOR: [false, true, true, false],
      NAND: [true, true, true, false],
      NOR: [true, false, false, false],
      XNOR: [true, false, false, true],
    }
    for (const [type, expected] of Object.entries(cases)) {
      const { nodes, wires } = twoInputGate(type)
      expect(buildTruthTable(nodes, wires).rows.map((row) => row.outputs.out), type).toEqual(expected)
    }
  })

  it('inverts signals and keeps unconnected gate inputs LOW', () => {
    const nodes = [inputA, { id: 'not', type: 'NOT' }, output]
    const wires = [
      { id: 'a-not', from: 'a', to: 'not', toPort: 0 },
      { id: 'not-out', from: 'not', to: 'out', toPort: 0 },
    ]
    expect(buildTruthTable(nodes, wires).rows.map((row) => row.outputs.out)).toEqual([true, false])

    const unconnectedAnd = [{ id: 'and', type: 'AND' }, output]
    expect(evaluateCircuit(unconnectedAnd, [{ id: 'and-out', from: 'and', to: 'out', toPort: 0 }]).out).toBe(false)
  })

  it('limits displayed truth-table inputs to eight', () => {
    const nodes = Array.from({ length: 9 }, (_, index) => ({ id: `in-${index}`, type: 'INPUT', label: `I${index}`, value: false }))
    const table = buildTruthTable(nodes, [])
    expect(table.inputs).toHaveLength(8)
    expect(table.rows).toHaveLength(256)
    expect(table.omittedInputs).toBe(1)
  })

  it('supports constants and fails safely on feedback loops', () => {
    const nodes = [
      { id: 'power', type: 'VCC' },
      { id: 'gate', type: 'NOT' },
      { id: 'out', type: 'LED' },
    ]
    const values = evaluateCircuit(nodes, [
      { id: 'loop', from: 'gate', to: 'gate', toPort: 0 },
      { id: 'power-out', from: 'power', to: 'out', toPort: 0 },
    ])
    expect(values.power).toBe(true)
    expect(values.gate).toBe(true)
    expect(values.out).toBe(true)
  })
})
