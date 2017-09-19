export function serialize(params: any): string {
  let url = ''
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      url += encodeURIComponent(key) + '='

      if (key === 'embed') {
        url += encodeURIComponent(JSON.stringify(params[key]))
      } else if (key === 'q') {
        const param = <Operator> params[key]
        url += encodeURIComponent(param.toString())
          .replace(/'/g, '%27')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29')
      } else if (params[key] instanceof Date) {
        url += encodeURIComponent(params[key].toISOString())
      } else {
        url += encodeURIComponent(params[key])
      }

      url += '&'
    }
  }
  return url.endsWith('&') ? url.substr(0, url.length - 1) : url
}

type Operand = string | string[]

function operandToString(operand: Operand) {
  if (operand instanceof Array) {
    return (operand as String[]).map(x => `'${x}'`).join(',')
  } else {
    return `'${operand}'`
  }
}

export interface Operator {
  toString: () => string
}

type LogicalOp = 'and' | 'or'

type BinaryOp = 'eq' | 'likei' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'

type UnaryOp = 'exists'

class LogicalOperation implements Operator {
  constructor(private operator: LogicalOp, private operands: Operator[]) { }

  public toString() {
    return this.operands.map(o => o.toString()).join(this.operator)
  }
}

class BinaryOperation implements Operator {
  constructor(private operator: BinaryOp, private left: Operand, private right: Operand) { }

  public toString() {
    return `(${this.left} ${this.operator} ${operandToString(this.right)})`
  }
}

class UnaryOperation implements Operator {
  constructor(private operator: UnaryOp, private only: Operand) { }

  public toString() {
    return `(${this.only} ${this.operator})`
  }
}

export function and(...ops: Operator[]): LogicalOperation {
  return new LogicalOperation('and', ops)
}

export function or(...ops: Operator[]): LogicalOperation {
  return new LogicalOperation('or', ops)
}

export function eq(left: Operand, right: Operand): BinaryOperation {
  return new BinaryOperation('eq', left, right)
}

export function likei(left: Operand, right: Operand): BinaryOperation {
  return new BinaryOperation('likei', left, right)
}

export function ne(left: Operand, right: Operand): BinaryOperation {
  return new BinaryOperation('ne', left, right)
}

export function gt(left: Operand, right: Operand): BinaryOperation {
  return new BinaryOperation('gt', left, right)
}

export function gte(left: Operand, right: Operand): BinaryOperation {
  return new BinaryOperation('gte', left, right)
}

export function lt(left: Operand, right: Operand): BinaryOperation {
  return new BinaryOperation('lt', left, right)
}

export function lte(left: Operand, right: Operand): BinaryOperation {
  return new BinaryOperation('lte', left, right)
}

export function exists(only: Operand): UnaryOperation {
  return new UnaryOperation('exists', only)
}
