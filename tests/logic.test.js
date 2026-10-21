import { describe, expect, it } from 'vitest'
import { buildTruthTable, evaluateCircuit, inputCount, MAX_GATE_INPUTS } from '../src/logic.js'

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

  it('supports variable OR/NOR fan-in and multiple LED outputs', () => {
    const inputC = { id: 'c', type: 'INPUT', label: 'C', value: false }
    const orGate = { id: 'or', type: 'OR', label: 'OR1', inputCount: 3 }
    const outputs = [
      { id: 'lamp-or', type: 'LED', label: 'OUT' },
      { id: 'lamp-a', type: 'LED', label: 'OUT2' },
      { id: 'lamp-c', type: 'LED', label: 'OUT3' },
    ]
    const nodes = [inputA, inputB, inputC, orGate, ...outputs]
    const wires = [
      { id: 'a-or', from: 'a', to: 'or', toPort: 0 },
      { id: 'b-or', from: 'b', to: 'or', toPort: 1 },
      { id: 'c-or', from: 'c', to: 'or', toPort: 2 },
      { id: 'or-lamp', from: 'or', to: 'lamp-or', toPort: 0 },
      { id: 'a-lamp', from: 'a', to: 'lamp-a', toPort: 0 },
      { id: 'c-lamp', from: 'c', to: 'lamp-c', toPort: 0 },
    ]
    const table = buildTruthTable(nodes, wires)
    expect(inputCount(orGate)).toBe(3)
    expect(table.outputs.map((node) => node.id)).toEqual(['lamp-or', 'lamp-a', 'lamp-c'])
    expect(table.rows.map((row) => row.outputs['lamp-or'])).toEqual([false, true, true, true, true, true, true, true])
    expect(table.rows.map((row) => row.outputs['lamp-a'])).toEqual([false, false, false, false, true, true, true, true])
    expect(table.rows.map((row) => row.outputs['lamp-c'])).toEqual([false, true, false, true, false, true, false, true])

    const norGate = { id: 'nor', type: 'NOR', inputCount: 3 }
    const norWires = wires.slice(0, 3).map((wire) => ({ ...wire, to: 'nor' }))
    expect(evaluateCircuit([...nodes.slice(0, 3), norGate], norWires, { a: false, b: false, c: false }).nor).toBe(true)
    expect(evaluateCircuit([...nodes.slice(0, 3), norGate], norWires, { a: false, b: true, c: false }).nor).toBe(false)
    expect(inputCount({ type: 'OR', inputCount: MAX_GATE_INPUTS + 10 })).toBe(MAX_GATE_INPUTS)
    expect(inputCount('OR')).toBe(2)
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
